# 🐾 Cat Claws

> Snap it. Paw it. Screenshots with a soft paw.

一個可愛又強大的 Chrome 擴充功能，讓你用貓爪來截圖和編輯！

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?style=flat-square&logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## ✨ 特色功能

### 🎯 核心功能
- **🐱 浮動貓爪按鈕** - 可拖曳的可愛貓爪，隨時準備截圖
- **📸 一鍵截圖** - 點擊貓爪即可截取當前頁面
- **🎨 完整編輯器** - 截圖後立即進入編輯模式
- **😸 貓咪表情系統** - 根據不同操作顯示可愛的貓咪表情

### 🛠️ 編輯工具
- **✏️ 畫筆** - 自由繪製線條和標記
- **⬜ 方框** - 繪製矩形框選區域
- **⭕ 圓形** - 繪製圓形/橢圓形
- **🐾 貓爪印章** - 隨機大小和角度的可愛貓爪印記
- **📝 文字工具** - 智能文字圖層系統

### 📝 文字圖層系統
- **拖曳建立** - 拖曳畫出文字框，自動計算字體大小
- **舒適輸入** - 輸入時使用適中的字體，方便編輯
- **自由選擇** - 點擊文字即可選中圖層
- **拖曳移動** - 隨意移動文字位置
- **縮放調整** - 四角控制點自由縮放文字大小
- **刪除功能** - Delete/Backspace 刪除選中的文字
- **圖層合併** - 下載時自動合併所有文字圖層

### 🎨 自訂功能
- **調色盤** - 選擇任意顏色
- **筆刷粗細** - 1-10 可調整
- **肉墊主題** - 多種貓爪顏色主題
  - 經典粉紅
  - 巧克力棕
  - 薄荷綠
  - 薰衣草紫
  - 珊瑚橘
- **夜間模式** - 深色主題保護眼睛

### 🎵 互動體驗
- **喵喵叫聲** - 點擊貓爪時播放可愛的貓叫聲
- **動態表情** - 根據操作切換貓咪心情
  - 😸 閒置：平靜
  - 😺 懸停：好奇
  - 😻 繪製：專注
  - 😽 貼紙：俏皮
  - 😿 復原：小失落
  - 😼 下載：得意
  - 🌙 夜間：睡眠
- **狀態記憶** - 自動記住你的偏好設定

### 🔧 其他功能
- **復原功能** - 支援最多 20 步復原
- **一鍵下載** - PNG 格式高畫質輸出
- **位置記憶** - 記住貓爪按鈕的位置

## 📦 安裝方式

### 方法一：從 Chrome Web Store 安裝
> 🚧 即將上架...

### 方法二：手動安裝（開發者模式）

1. **下載專案**
   ```bash
   git clone https://github.com/eggo00/Chrome_extendion-cat-claws.git
   cd Chrome_extendion-cat-claws
   ```

2. **開啟 Chrome 擴充功能頁面**
   - 在 Chrome 網址列輸入：`chrome://extensions/`
   - 或點選 **⋮** → **擴充功能** → **管理擴充功能**

3. **啟用開發者模式**
   - 點擊右上角的「開發人員模式」開關

4. **載入擴充功能**
   - 點擊「載入未封裝項目」
   - 選擇 `cat-paw-screenshot` 資料夾

5. **完成！** 🎉
   - 重新整理任何網頁，右下角會出現粉紅色貓爪按鈕

## 🎮 使用說明

### 基本操作

1. **截圖**
   - 點擊右下角的貓爪按鈕 🐾
   - 聽到「喵～」一聲後，截圖完成
   - 自動進入編輯器

2. **選擇工具**
   - 點擊工具列上的工具圖示
   - 貓咪會根據工具切換表情

3. **調整設定**
   - 使用顏色選擇器選擇顏色
   - 拖曳粗細滑桿調整筆刷大小

### 文字工具使用

1. **選擇文字工具**
   - 點擊工具列的「T」圖示

2. **建立文字**
   - 在畫布上**拖曳**畫出文字框
   - 框越大，最終文字就越大
   - 放開後出現輸入框，輸入文字
   - 按 **Enter** 或點擊外部確認

3. **編輯文字**
   - **選擇**：點擊文字選中（顯示粉紅色邊框）
   - **移動**：拖曳文字本身移動位置
   - **縮放**：拖曳四角的粉紅色圓點調整大小
   - **刪除**：選中後按 **Delete** 或 **Backspace**

### 鍵盤快捷鍵

- **Delete / Backspace** - 刪除選中的文字圖層
- **拖曳貓爪按鈕** - 移動位置（位置會被記住）

## 🏗️ 專案結構

```
cat-paw-screenshot/
├── manifest.json          # 擴充功能設定檔
├── background.js          # 背景服務
├── content.js            # 內容腳本（貓爪按鈕）
├── content.css           # 貓爪按鈕樣式
├── editor.html           # 編輯器頁面
├── editor.js             # 編輯器邏輯
├── editor.css            # 編輯器樣式
├── cat-mood.js           # 貓咪表情系統
├── state-manager.js      # 狀態管理
├── paw-themes.js         # 肉墊主題系統
└── assets/               # 資源檔案
    ├── cat.svg           # 貓咪圖示
    ├── cat-expressions.svg  # 表情版本
    ├── cat-dark.svg      # 夜間模式
    ├── paw.svg           # 貓爪圖案
    ├── meow.mp3          # 貓叫聲
    └── icons/            # 擴充功能圖示
```

## 🛠️ 技術架構

- **Manifest V3** - 最新的 Chrome 擴充功能規範
- **Vanilla JavaScript** - 純原生 JS，無框架依賴
- **Canvas API** - 高效能圖像編輯
- **Chrome Storage API** - 用戶偏好設定儲存
- **Service Worker** - 背景截圖處理

## 🎨 設計理念

- **可愛優先** - 以貓咪為主題的友善介面
- **簡單直覺** - 一鍵截圖，立即編輯
- **功能完整** - 專業級編輯工具
- **記住偏好** - 智能記憶用戶習慣
- **無干擾** - 可拖曳的浮動按鈕

## 🔄 更新日誌

### v1.0.0 (2026-01-01)
- ✨ 新增文字圖層系統
- 🎵 新增貓叫聲音效
- 🎨 優化文字輸入體驗
- 🐛 修正座標偏移問題
- 🌙 新增夜間模式
- 🎨 新增肉墊主題系統
- 😸 新增貓咪表情系統
- 💾 新增狀態記憶功能

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 建立你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 開發說明

### 本地開發

1. 修改程式碼後，到 `chrome://extensions/` 點擊「重新載入」
2. 重新整理網頁測試變更

### 新增音效

1. 將 `.mp3` 檔案放到 `assets/` 資料夾
2. 命名為 `meow.mp3` 或修改 `content.js` 中的路徑
3. 重新載入擴充功能

## 📄 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 💖 致謝

- 貓咪圖示和音效來自開源社群
- 感謝所有測試用戶的回饋

## 📮 聯絡方式

- GitHub Issues: [提交問題](https://github.com/eggo00/Chrome_extendion-cat-claws/issues)
- 作者：eggo00

---

<div align="center">
  <p>用愛製作 🐾 Made with love and paws</p>
  <p>⭐ 如果喜歡這個專案，請給我們一顆星星！</p>
</div>
