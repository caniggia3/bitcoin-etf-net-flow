/**
 * Bitcoin ETF Net Flow Tracker - Popup Script
 *
 * Reads cached data from chrome.storage.local, renders the net flow value
 * and chart, and handles manual refresh and timeframe switching.
 */

// ---------- Formatting helpers (synced with background.js) ----------

function formatCurrency(value) {
  const sign = value >= 0 ? "+" : "-";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

function formatPercent(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDate(timestampSeconds) {
  if (!timestampSeconds) return "";
  const date = new Date(timestampSeconds * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateShort(timestampMs) {
  const date = new Date(parseInt(timestampMs));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelativeTime(timestampMs) {
  const diff = Date.now() - timestampMs;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------- State ----------

let chartInstance = null;
let currentRange = "30d";
let cachedData = null;

// ---------- Rendering ----------

function setValueClass(el, value) {
  el.classList.remove("positive", "negative", "neutral");
  if (value > 0) el.classList.add("positive");
  else if (value < 0) el.classList.add("negative");
  else el.classList.add("neutral");
}

function renderMetrics(metrics) {
  const current = metrics.current || {};
  const value = current.value;

  // Main value
  const valueEl = document.getElementById("flow-value");
  if (value !== undefined && value !== null) {
    valueEl.textContent = formatCurrency(value);
    setValueClass(valueEl, value);
  } else {
    valueEl.textContent = "---.--";
    valueEl.classList.add("neutral");
  }

  // Percentage
  const percentEl = document.getElementById("flow-percent");
  if (current.percentage !== undefined) {
    percentEl.textContent = `(${formatPercent(current.percentage)} vs prev day)`;
    setValueClass(percentEl, current.percentage);
  } else {
    percentEl.textContent = "";
  }

  // Date
  const dateEl = document.getElementById("flow-date");
  if (current.timestamp) {
    dateEl.textContent = `(${formatDate(parseInt(current.timestamp))})`;
  } else {
    dateEl.textContent = "";
  }

  // Historical values
  const lastWeek = metrics.lastWeek;
  const lastMonth = metrics.lastMonth;
  const threeMonths = metrics.threeMonthsAgo;

  const lwEl = document.getElementById("last-week");
  if (lastWeek?.value !== undefined) {
    lwEl.textContent = formatCurrency(lastWeek.value);
    setValueClass(lwEl, lastWeek.value);
  }

  const lmEl = document.getElementById("last-month");
  if (lastMonth?.value !== undefined) {
    lmEl.textContent = formatCurrency(lastMonth.value);
    setValueClass(lmEl, lastMonth.value);
  }

  const l3mEl = document.getElementById("last-3-months");
  if (threeMonths?.value !== undefined) {
    l3mEl.textContent = formatCurrency(threeMonths.value);
    setValueClass(l3mEl, threeMonths.value);
  }
}

function renderChart(chartData, range) {
  const canvas = document.getElementById("flow-chart");
  const ctx = canvas.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (!chartData || !chartData.points || chartData.points.length === 0) {
    // Show empty state
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#565f89";
    ctx.textAlign = "center";
    ctx.fillText("No chart data available", canvas.width / 2, canvas.height / 2);
    return;
  }

  const points = chartData.points;

  // Prepare data
  const labels = points.map((p) => formatDateShort(p.timestamp));
  const values = points.map((p) => p.value);
  const colors = values.map((v) =>
    v >= 0 ? "rgba(224, 58, 62, 0.75)" : "rgba(0, 176, 116, 0.75)"
  );
  const borderColors = values.map((v) =>
    v >= 0 ? "rgba(224, 58, 62, 1)" : "rgba(0, 176, 116, 1)"
  );

  // Total
  const totalEl = document.getElementById("chart-total");
  if (chartData.total !== undefined && chartData.total !== null) {
    totalEl.textContent = `Total: ${formatCurrency(chartData.total)}`;
    totalEl.classList.remove("positive", "negative", "neutral");
    setValueClass(totalEl, chartData.total);
  } else {
    const sum = values.reduce((a, b) => a + b, 0);
    totalEl.textContent = `Total: ${formatCurrency(sum)}`;
    setValueClass(totalEl, sum);
  }

  // Determine y-axis tick format based on range
  const yFormatter = (val) => {
    const abs = Math.abs(val);
    if (abs >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${(val / 1e6).toFixed(0)}M`;
    if (abs >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
    return val.toFixed(0);
  };

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Net Flow",
          data: values,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 3,
          barPercentage: 0.8,
          categoryPercentage: 0.85,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a1b26",
          titleColor: "#a9b1d6",
          bodyColor: "#c0caf5",
          borderColor: "#3b4261",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: function (context) {
              return `Net Flow: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#565f89",
            font: { size: 9 },
            maxRotation: 45,
            autoSkip: true,
            maxTicksLimit: 8,
          },
          grid: { display: false },
        },
        y: {
          ticks: {
            color: "#565f89",
            font: { size: 10 },
            callback: yFormatter,
          },
          grid: {
            color: "rgba(59, 66, 97, 0.3)",
          },
        },
      },
    },
  });
}

function renderLastUpdated(timestampMs) {
  const el = document.getElementById("last-updated");
  if (timestampMs) {
    el.textContent = `Last updated: ${formatRelativeTime(timestampMs)}`;
  } else {
    el.textContent = "Last updated: ---";
  }
}

function renderAll(data) {
  if (!data) {
    // No data yet
    document.getElementById("flow-value").textContent = "No data";
    document.getElementById("flow-value").classList.add("neutral");
    document.getElementById("last-updated").textContent = "Waiting for data...";
    return;
  }

  cachedData = data;
  renderMetrics(data.metrics || {});
  renderChart(data.charts?.[currentRange], currentRange);
  renderLastUpdated(data.lastUpdated);
}

// ---------- Data loading ----------

async function loadData() {
  const result = await chrome.storage.local.get("btcEtfData");
  renderAll(result.btcEtfData);
}

// ---------- Event handlers ----------

// Timeframe tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentRange = tab.dataset.range;
    if (cachedData) {
      renderChart(cachedData.charts?.[currentRange], currentRange);
    }
  });
});

// Refresh button
const refreshBtn = document.getElementById("refresh-btn");
refreshBtn.addEventListener("click", async () => {
  refreshBtn.classList.add("loading");
  refreshBtn.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({ action: "refresh" });
    if (response?.success) {
      await loadData();
    } else {
      console.error("Refresh failed:", response?.error);
    }
  } catch (e) {
    console.error("Refresh error:", e);
  } finally {
    refreshBtn.classList.remove("loading");
    refreshBtn.disabled = false;
  }
});

// Listen for storage changes (in case background updates while popup is open)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.btcEtfData) {
    renderAll(changes.btcEtfData.newValue);
  }
});

// ---------- Init ----------
loadData();
