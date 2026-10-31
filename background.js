/**
 * Bitcoin ETF Net Flow Tracker - Background Service Worker
 *
 * Fetches Bitcoin ETF Net Flow data from CoinMarketCap's internal API.
 * Updates the extension badge every 2 hours with the daily net flow value.
 * Stores chart data for the popup to display.
 */

const API_BASE = "https://api.coinmarketcap.com";
const METRICS_URL = `${API_BASE}/data-api/v3/etf/netflow/metrics?category=btc&convertId=2781`;
const CHART_URL = (range) => `${API_BASE}/data-api/v3/etf/overview/netflow/chart?category=btc&range=${range}&convertId=2781`;
const ALARM_NAME = "btc-etf-flow-refresh";
const REFRESH_INTERVAL_MINUTES = 120; // 2 hours

// ---------- Helpers ----------

/**
 * Abbreviate a number for badge display.
 * e.g., 7800000 -> "+7.8M", -630400000 -> "-630.4M", 3569282000 -> "+3.6B"
 */
function abbreviate(value) {
  const sign = value >= 0 ? "+" : "-";
  const abs = Math.abs(value);

  if (abs >= 1e9) {
    return `${sign}${(abs / 1e9).toFixed(1)}B`;
  } else if (abs >= 1e6) {
    return `${sign}${(abs / 1e6).toFixed(1)}M`;
  } else if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(1)}K`;
  } else {
    return `${sign}${abs.toFixed(0)}`;
  }
}

/**
 * Format a full currency value for display.
 * e.g., 7800000 -> "+$7.80M", -630400000 -> "-$630.40M"
 */
function formatCurrency(value) {
  const sign = value >= 0 ? "+" : "-";
  const abs = Math.abs(value);

  if (abs >= 1e9) {
    return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  } else if (abs >= 1e6) {
    return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  } else if (abs >= 1e3) {
    return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  } else {
    return `${sign}$${abs.toFixed(2)}`;
  }
}

/**
 * Format a timestamp (seconds) into a readable date.
 */
function formatDate(timestampSeconds) {
  const date = new Date(timestampSeconds * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------- Badge ----------

function updateBadge(value) {
  const text = abbreviate(value);
  // Chinese stock market convention: red = up (positive), green = down (negative)
  let color;
  if (value > 0) {
    color = "#E03A3E"; // red for positive (bullish)
  } else if (value < 0) {
    color = "#00B074"; // green for negative (bearish)
  } else {
    color = "#808080"; // gray for zero
  }

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setTitle({
    title: `Bitcoin ETF Net Flow: ${formatCurrency(value)}`,
  });
}

// ---------- Data Fetching ----------

async function fetchMetrics() {
  const response = await fetch(METRICS_URL, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Metrics API error: ${response.status}`);
  }
  const json = await response.json();
  return json.data || {};
}

async function fetchChart(range) {
  const response = await fetch(CHART_URL(range), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Chart API error: ${response.status}`);
  }
  const json = await response.json();
  return json.data || {};
}

async function refreshData() {
  try {
    console.log("[BTC ETF Flow] Refreshing data...");

    // Fetch metrics and all chart ranges in parallel
    const [metrics, chart30d, chart1y, chartAll] = await Promise.all([
      fetchMetrics(),
      fetchChart("30d"),
      fetchChart("1y"),
      fetchChart("all"),
    ]);

    const currentValue = metrics.current?.value ?? 0;
    const now = Date.now();

    const data = {
      metrics,
      charts: {
        "30d": chart30d,
        "1y": chart1y,
        all: chartAll,
      },
      lastUpdated: now,
      lastValue: currentValue,
    };

    // Store in chrome.storage.local
    await chrome.storage.local.set({ btcEtfData: data });

    // Update badge
    updateBadge(currentValue);

    console.log("[BTC ETF Flow] Data refreshed successfully:", formatCurrency(currentValue));
  } catch (error) {
    console.error("[BTC ETF Flow] Refresh failed:", error);

    // Try to load cached data for badge
    const cached = await chrome.storage.local.get("btcEtfData");
    if (cached.btcEtfData?.lastValue !== undefined) {
      updateBadge(cached.btcEtfData.lastValue);
    } else {
      chrome.action.setBadgeText({ text: "..." });
      chrome.action.setBadgeBackgroundColor({ color: "#808080" });
      chrome.action.setTitle({ title: "Bitcoin ETF Net Flow: Loading..." });
    }
  }
}

// ---------- Lifecycle ----------

chrome.runtime.onInstalled.addListener(async () => {
  console.log("[BTC ETF Flow] Extension installed. Starting initial fetch...");
  await refreshData();

  // Create recurring alarm (2 hours)
  await chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: REFRESH_INTERVAL_MINUTES,
  });
});

chrome.runtime.onStartup.addListener(async () => {
  console.log("[BTC ETF Flow] Browser started. Refreshing data...");
  await refreshData();

  // Ensure alarm exists
  const existing = await chrome.alarms.get(ALARM_NAME);
  if (!existing) {
    await chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: REFRESH_INTERVAL_MINUTES,
    });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await refreshData();
  }
});

// Listen for messages from popup (manual refresh)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "refresh") {
    refreshData().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // keep channel open for async response
  }

  if (message.action === "getBadgeValue") {
    chrome.storage.local.get("btcEtfData").then((result) => {
      const value = result.btcEtfData?.lastValue;
      sendResponse({ value });
    });
    return true;
  }
});
