# 🐾 Cat Claws - 安裝與使用指南

**Snap it. Paw it. Screenshots with a soft paw.**

---

## 📋 目錄

1. [安裝前準備](#安裝前準備)
2. [生成 Icon 圖示](#生成-icon-圖示)
3. [載入 Extension](#載入-extension)
4. [如何使用](#如何使用)
5. [專案結構](#專案結構)
6. [設計規範](#設計規範)
7. [常見問題](#常見問題)

---

## 安裝前準備

### 必要條件

- Chrome 瀏覽器（版本 88 或更新）
- 已下載完整的 `cat-paw-screenshot` 資料夾

### 檔案清單

確認你的資料夾包含以下檔案：

```
cat-paw-screenshot/
├── manifest.json           ✓ Extension 配置檔
├── background.js           ✓ 背景腳本
├── content.js              ✓ 內容腳本（懸浮貓爪）
├── content.css             ✓ 懸浮按鈕樣式
├── editor.html             ✓ 編輯頁面
├── editor.css              ✓ 編輯頁面樣式
├── editor.js               ✓ 編輯功能邏輯
├── generate-icons.html     ✓ Icon 生成器
├── assets/
│   ├── paw.svg            ✓ 貓爪圖示
│   ├── cat.svg            ✓ 貓咪裝飾
│   └── icons/             ⚠️ 需要生成
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
└── README.md              ✓ 說明文件
```

---

## 生成 Icon 圖示

### 步驟 1：開啟 Icon 生成器

1. 用瀏覽器開啟 `generate-icons.html`
2. 你會看到四個不同尺寸的貓爪 icon 預覽

### 步驟 2：下載所有尺寸

點擊每個尺寸下方的「下載」按鈕：

- 下載 16x16 → `icon16.png`
- 下載 32x32 → `icon32.png`
- 下載 48x48 → `icon48.png`
- 下載 128x128 → `icon128.png`

### 步驟 3：放置 Icon 檔案

將下載的四個 PNG 檔案放到專案的 `assets/icons/` 資料夾中。

**最終結構：**
```
cat-paw-screenshot/
└── assets/
    └── icons/
        ├── icon16.png   ✓
        ├── icon32.png   ✓
        ├── icon48.png   ✓
        └── icon128.png  ✓
```

---

## 載入 Extension

### 步驟 1：開啟擴充功能管理頁面

在 Chrome 中，有三種方式進入：

**方法 A：網址列**
- 輸入 `chrome://extensions/` 並按 Enter

**方法 B：選單**
- 點擊右上角 ⋮（三個點）
- 擴充功能 → 管理擴充功能

**方法 C：快捷鍵**
- Windows/Linux: `Ctrl + Shift + E`
- Mac: `Cmd + Shift + E`（部分版本）

### 步驟 2：啟用開發人員模式

在擴充功能頁面右上角，開啟「**開發人員模式**」開關。

### 步驟 3：載入未封裝項目

1. 點擊左上角的「**載入未封裝項目**」按鈕
2. 選擇 `cat-paw-screenshot` 資料夾
3. 點擊「選擇資料夾」

### 步驟 4：確認安裝成功

你應該會看到：

- Extension 卡片顯示「Cat Claws」
- 粉色貓爪 icon
- 狀態為「已啟用」

---

## 如何使用

### 🐾 懸浮貓爪按鈕

1. **顯示位置**
   - 開啟任何網頁，右下角會出現一個粉色貓爪按鈕
   - Hover 時會顯示「喵～截圖一下？」

2. **拖曳移動**
   - 按住貓爪不放，拖曳到你想要的位置
   - 鬆開滑鼠即可固定

3. **截圖**
   - 點擊貓爪按鈕
   - 會出現「啾～」動畫
   - 自動截取當前畫面並開啟編輯頁面

### 🎨 編輯工具

編輯頁面提供以下工具：

1. **✏️ 畫筆** - 自由手繪標記
2. **⬜ 方框** - 框選重點區域
3. **⭕ 圓形** - 圓圈標記
4. **🐾 貓爪貼紙** - 點一下蓋一個可愛貓爪印
   - 隨機角度（±15°）
   - 隨機大小（0.8～1.1）
   - 隨機顏色（粉、白、淺咖）
5. **↩️ 復原** - 支援多步驟復原（最多 20 步）
6. **💾 下載** - 儲存為 PNG 格式

### 工具設定

- **顏色選擇**：點擊顏色方塊選擇你喜歡的顏色
- **粗細調整**：拖曳滑桿調整線條粗細（2-10px）

---

## 專案結構

```
cat-paw-screenshot/
│
├── manifest.json          # Manifest V3 配置
│   ├── name: "Cat Claws"
│   ├── permissions: activeTab, tabs, storage
│   └── icons: 16, 32, 48, 128
│
├── background.js          # Service Worker
│   ├── 處理截圖請求
│   ├── chrome.tabs.captureVisibleTab
│   └── 開啟編輯頁面
│
├── content.js + content.css   # 懸浮貓爪按鈕
│   ├── 注入到所有網頁
│   ├── 可拖曳功能
│   ├── 點擊截圖
│   └── 「啾～」動畫
│
├── editor.html + editor.css + editor.js   # 編輯介面
│   ├── 可愛貓咪風格設計
│   ├── Canvas 繪圖功能
│   ├── 工具：畫筆、方框、圓形、貓爪貼紙
│   ├── 復原功能（歷史記錄）
│   └── 下載 PNG
│
└── assets/
    ├── paw.svg           # 貓爪圖示（用於按鈕和貼紙）
    ├── cat.svg           # Q 版貓咪裝飾
    └── icons/            # Extension Icons
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        └── icon128.png
```

---

## 設計規範

### 🎨 Color System

| 名稱 | 色碼 | 用途 |
|------|------|------|
| Paw Pink | `#F6B6C8` | 主色、按鈕、標題 |
| Milk Cream | `#FFF8F2` | 背景色 |
| Latte Brown | `#B88C7D` | 線條、邊框、文字 |
| Mint Hint | `#CFE8D8` | 選中狀態 |

### ✏️ Typography

- **字體家族**: Nunito, Poppins, system-ui, -apple-system
- **標題**: font-weight 600
- **一般文字**: font-weight 400

### 🐾 Design DNA

- **關鍵詞**: 療癒 / 軟萌 / 不打擾 / 像一隻偷偷幫忙的小貓
- **視覺風格**: iOS 小元件 + 日系文具感
- **動畫**: 輕柔、快速（0.15s ease-out）
- **圓角**: 12-24px
- **陰影**: 柔和、淺色

---

## 常見問題

### Q1: 貓爪按鈕沒有出現？

**解決方法：**
1. 確認 Extension 已啟用
2. 重新載入網頁（F5）
3. 檢查是否有其他 Extension 衝突
4. 查看 Console 是否有錯誤訊息

### Q2: 點擊貓爪後沒有反應？

**解決方法：**
1. 檢查瀏覽器是否允許截圖權限
2. 確認不是在特殊頁面（chrome:// 開頭的頁面無法截圖）
3. 查看 Console 錯誤訊息

### Q3: 編輯頁面無法載入圖片？

**解決方法：**
1. 確認 `assets/` 資料夾完整
2. 檢查 manifest.json 的 `web_accessible_resources` 設定
3. 重新載入 Extension

### Q4: Icon 無法顯示？

**解決方法：**
1. 確認已生成並放置所有 icon 檔案
2. 檔名必須完全一致：icon16.png, icon32.png, icon48.png, icon128.png
3. 重新載入 Extension

### Q5: 想要修改顏色或樣式？

**修改方法：**
- 編輯 `content.css` - 懸浮按鈕樣式
- 編輯 `editor.css` - 編輯頁面樣式
- 修改後記得重新載入 Extension

---

## 🚀 下一步擴充建議

如果你想要增強功能，可以考慮：

1. **文字標註** - 在截圖上添加文字說明
2. **箭頭工具** - 繪製指向箭頭
3. **馬賽克/模糊** - 隱藏敏感資訊
4. **螢光筆** - 半透明標記工具
5. **快捷鍵** - Ctrl+Shift+P 快速截圖
6. **區域截圖** - 選擇特定區域截圖
7. **滾動截圖** - 截取整個網頁

---

## 📞 需要幫助？

- 查看 `README.md` 了解更多功能說明
- 查看 Chrome Extension 官方文檔
- 檢查 Console 錯誤訊息

---

**🐾 喵～幫你抓住這一刻！**

**Cat Claws - Screenshots with a soft paw.**
