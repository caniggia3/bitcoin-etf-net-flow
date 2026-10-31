# 隐私政策 / Privacy Policy

**Bitcoin ETF Net Flow Tracker** Chrome 扩展隐私政策（最后更新：2026-11-01）

## 简体中文

本扩展**不收集、不存储、不传输任何用户个人数据**。

1. **不收集数据**：本扩展不收集任何个人身份信息、浏览活动、位置信息或其他敏感数据。
2. **网络访问**：扩展仅向 CoinMarketCap 公开行情接口（`api.coinmarketcap.com`）发起**只读**请求，用于获取比特币 ETF 净流入/流出数据。不向任何服务器上传用户信息。
3. **本地存储**：扩展使用 `chrome.storage` 在本地保存少量缓存数据（最新净值数据），这些数据仅存于用户设备上的浏览器内，不会离开设备。
4. **无第三方追踪**：本扩展不包含任何分析、广告或追踪组件。
5. **权限用途**：
   - `alarms`：定时刷新行情数据
   - `storage`：本地缓存数据
   - 主机权限 `api.coinmarketcap.com`：只读公开行情接口，唯一数据来源

## English

This extension **does not collect, store, or transmit any personal user data**.

1. **No data collection**: No personal information, browsing activity, location, or sensitive data is collected.
2. **Network access**: The extension only makes **read-only** requests to CoinMarketCap's public market data endpoint (`api.coinmarketcap.com`) to fetch Bitcoin ETF net flow data. No user information is uploaded.
3. **Local storage**: A small cache of the latest market data is stored locally via `chrome.storage` and never leaves the device.
4. **No third-party tracking**: No analytics, advertising, or tracking components are included.
5. **Permissions**:
   - `alarms`: scheduled data refresh
   - `storage`: local data cache
   - Host permission `api.coinmarketcap.com`: the sole, read-only data source

## 联系方式 / Contact

如有隐私相关问题，请通过 GitHub Issues 联系：
https://github.com/caniggia3/bitcoin-etf-net-flow/issues
