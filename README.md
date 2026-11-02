# Bitcoin ETF Net Flow Tracker

一款 Chrome 浏览器扩展（Manifest V3），实时追踪**比特币现货 ETF 资金净流入 / 净流出**，数据来自 CoinMarketCap 官方公开接口。

![Bitcoin ETF Net Flow](screenshots/etf-promo-marquee-1400x560.png)

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-安装-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/bitcoin-etf-net-flow-trac/pbbigenohbldalaboklkkcpjgknelogn)

## ✨ 功能特性

- **📊 实时净流向**：每日比特币 ETF 净流入 / 净流出金额，弹窗即点即看
- **🏷️ 角标显示**：扩展图标上直接显示当日净流金额（如 `+7.8M` / `-240M`），无需打开弹窗
- **📈 历史图表**：内置 Chart.js 图表，支持 **30 天 / 1 年 / 全部** 三档时间范围回看
- **🔔 自动刷新**：后台定时轮询，数据自动保持最新
- **🆓 免费免 Key**：仅使用 CoinMarketCap 公开行情接口，无需注册、无需 API Key

> 配色语义：**净流入红色向上柱 / 净流出绿色向下柱**，资金方向一目了然。

## 📸 截图

| 弹窗主界面 | 小型宣传图 |
|---|---|
| ![screenshot](screenshots/etf-screenshot-1280x800.png) | ![promo](screenshots/etf-promo-small-440x280.png) |

## 🔧 安装方式

### 方式一：Chrome 应用商店（推荐）

👉 [**点击前往 Chrome 应用商店安装**](https://chromewebstore.google.com/detail/bitcoin-etf-net-flow-trac/pbbigenohbldalaboklkkcpjgknelogn)

安装后自动更新，无需手动维护。

### 方式二：加载源码

1. 下载或克隆本仓库：
   ```bash
   git clone https://github.com/caniggia3/bitcoin-etf-net-flow.git
   ```
2. 打开 Chrome，进入 `chrome://extensions`
3. 打开右上角「**开发者模式**」
4. 点击「**加载已解压的扩展程序**」，选择本仓库文件夹
5. 工具栏出现图标，即安装完成

### 方式三：Release 附件

前往 [Releases](https://github.com/caniggia3/bitcoin-etf-net-flow/releases) 页面下载 `.crx` 文件。
> ⚠️ 注意：Windows 版 Chrome 出于安全策略**不支持直接拖拽安装 .crx**，该文件仅作存档分发用途，日常安装请使用方式一。

## 🗂️ 项目结构

```
├── manifest.json        # MV3 扩展清单
├── background.js        # 后台轮询 + 角标更新
├── popup.html/js/css    # 弹窗界面
├── lib/
│   └── chart.umd.min.js # Chart.js 图表库
└── icons/               # 扩展图标
```

## 🔐 隐私说明

本扩展**不收集任何用户数据**：

- 不收集个人身份信息、浏览记录或任何敏感数据
- 仅访问 CoinMarketCap 公开行情接口（只读，无需身份验证）
- 所有设置与缓存仅保存在本地浏览器，不上传任何服务器

详见 [PRIVACY.md](PRIVACY.md)。

## 📄 许可证

[MIT License](LICENSE)
