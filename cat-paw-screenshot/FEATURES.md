# 🐾 Cat Claws - 功能擴充文檔

## 📦 已實作功能

### ✅ 1. 貓咪表情系統 😺

**狀態**: ✅ 已完成

小貓咪會根據你的操作改變表情，提供即時的視覺回饋！

#### 表情狀態對應表

| 狀態 | 表情 | 觸發時機 |
|------|------|----------|
| **idle** | 😊 微笑 | 編輯頁面初始狀態 |
| **hover** | 👀 好奇 | 滑鼠移到工具列 |
| **capture** | ✨ 驚喜 | 截圖完成瞬間（2.5秒） |
| **draw** | 😼 認真 | 使用畫筆工具 |
| **sticker** | 😽 開心 | 蓋貓爪貼紙 |
| **undo** | 😿 小失落 | 復原操作（1.5秒） |
| **download** | 😻 得意 | 下載完成（2.5秒） |
| **night** | 😴 睡覺 | 夜間模式（待實作） |

#### 技術實作

**檔案結構:**
```
assets/cat-expressions.svg   # 多表情 SVG
cat-mood.js                  # 表情管理模組
editor.js                    # 整合表情切換
editor.html                  # 使用 <object> 載入 SVG
```

**API 使用:**
```javascript
// 切換表情
setCatMood('capture');

// 臨時切換（自動恢復到 idle）
setCatMoodTemporary('download', 2500);

// 取得當前表情
getCurrentCatMood();
```

---

## 🚧 待實作功能

以下功能已完成設計規範，等待實作：

### 2. 肉墊顏色主題 🐾

**狀態**: ✅ 已完成

每隻貓的肉墊都不一樣！提供 4 種主題色組：

#### 主題色組

**1️⃣ Classic Pink（預設）**
- Paw: `#F6B6C8`
- Accent: `#FFDDE7`

**2️⃣ Milk Tea**
- Paw: `#D8B4A0`
- Accent: `#F1E3D3`

**3️⃣ Matcha**
- Paw: `#9CC7B8`
- Accent: `#DDF2EA`

**4️⃣ Cocoa（夜間友善）**
- Paw: `#8B6F61`
- Accent: `#CBB5A7`

#### 技術實作

**檔案結構:**
```
paw-themes.js    # 主題管理模組
editor.css       # CSS 變數系統
editor.html      # 主題選擇 UI
editor.js        # 整合主題切換
```

**CSS 變數系統:**
```css
:root {
  --paw-color: #F6B6C8;      /* 可變的肉墊顏色 */
  --paw-accent: #FFDDE7;     /* 可變的輔助色 */
  --milk-cream: #FFF8F2;
  --latte-brown: #B88C7D;
  --mint-hint: #CFE8D8;
}
```

**JavaScript API:**
```javascript
// 切換主題
setPawTheme('matcha');

// 取得當前主題
getCurrentPawTheme();

// 取得所有主題
getAllPawThemes();

// 初始化主題系統（自動載入狀態）
await initPawThemes();
```

**實作完成項目:**
✅ 主題管理模組（paw-themes.js）
✅ CSS 變數系統
✅ 4 種主題色組
✅ 主題選擇 UI
✅ 下拉選單動畫
✅ 自動儲存主題偏好
✅ 自動載入上次選擇

---

### 3. 夜間模式（黑貓模式）🖤

**狀態**: ✅ 已完成

**命名**: Black Cat Mode 🐈‍⬛
**標語**: *The night is quiet. The cat is watching.*

#### 視覺規格

| 項目 | 日間 | 夜間 |
|------|------|------|
| 背景 | `#FFF8F2` (Milk Cream) | `#1E1E1E` |
| Canvas | 白色 | 深灰 |
| Icon | `#B88C7D` (咖啡線) | 淺灰 |
| 貓咪 | 橘/白色 | 黑貓 |
| 肉墊 | 粉色 | 深灰＋微亮 |

#### 黑貓細節

- **毛色**: 深灰（不是全黑，#3A3A3A）
- **眼睛**: 微亮黃/綠色
- **表情**:
  - 常駐: 😴 睡覺
  - 動作時: 👁️ 張開眼睛

#### 實作方式

**CSS:**
```css
[data-theme="dark"] {
  --bg-color: #1E1E1E;
  --text-color: #EAEAEA;
  --canvas-bg: #2A2A2A;
}
```

**JavaScript:**
```javascript
function toggleDarkMode() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';

  // 切換貓咪表情
  setCatMood(isDark ? 'idle' : 'night');

  // 儲存設定
  chrome.storage.local.set({ theme: isDark ? 'light' : 'dark' });
}
```

#### 切換入口

- 工具列 🌙 / ☀️ icon
- 切換動畫:
  - 畫面 fade 200ms
  - 貓咪閉眼 → 張眼動畫

#### 技術實作

**檔案結構:**
```
assets/cat-dark.svg   # 黑貓 SVG（睡覺狀態）
editor.css            # 包含 [data-theme="dark"] 變數
editor.js             # initDarkMode() 函數
editor.html           # 夜間模式切換按鈕
```

**CSS 變數系統:**
```css
[data-theme="dark"] {
  --bg-primary: #1E1E1E;
  --bg-secondary: #2A2A2A;
  --text-primary: #EAEAEA;
  --text-secondary: #C0C0C0;
  --border-color: #5A5A5A;
  --canvas-bg: #2F2F2F;
  --shadow-color: rgba(0, 0, 0, 0.3);
}
```

**JavaScript API:**
```javascript
// 初始化夜間模式（自動載入上次設定）
await initDarkMode();

// 切換主題
document.documentElement.dataset.theme = 'dark'; // 或 'light'
```

**實作完成項目:**
✅ 黑貓 SVG 資源（cat-dark.svg）
✅ CSS 暗色主題變數系統
✅ 夜間模式切換按鈕（🌙 / ☀️）
✅ 主題切換動畫（300ms fade）
✅ 貓咪 SVG 自動切換（cat-expressions.svg ↔ cat-dark.svg）
✅ 整合表情系統（夜間顯示睡覺狀態）
✅ 自動儲存主題偏好
✅ 自動載入上次選擇

---

### 4. 狀態記憶 💾

**狀態**: ✅ 已完成

**理念**: 關掉再打開，小貓還記得你 ❤️

#### 儲存項目

1. **夜間/日間模式**
2. **肉墊主題**
3. **最後使用的工具**
4. **最後使用的顏色**
5. **最後使用的粗細**

#### 技術實作

**檔案結構:**
```
state-manager.js    # 狀態管理模組
editor.js           # 整合狀態載入與儲存
```

**API 使用:**
```javascript
// 載入狀態
const state = await loadState();

// 儲存狀態
await saveState(state);

// 更新部分狀態
await updateState({ lastTool: 'pen', lastColor: '#F6B6C8' });

// 重置狀態
await resetState();

// 取得預設狀態
const defaults = getDefaultState();
```

**實作完成項目:**
✅ 狀態管理模組（state-manager.js）
✅ 自動載入上次設定
✅ 即時儲存工具選擇
✅ 即時儲存顏色選擇
✅ 即時儲存粗細選擇

#### 觸發時機

**儲存:**
- 切換主題時
- 切換工具時
- 更改顏色時
- 更改粗細時

**載入:**
- 編輯頁面初始化時

---

## 📋 實作優先級建議

基於用戶體驗和技術複雜度：

### 第一階段（立即實作）
✅ 1. 貓咪表情系統 - **已完成**

### 第二階段（建議優先）
✅ 2. 狀態記憶功能 - **已完成**
✅ 3. 肉墊顏色主題 - **已完成**

### 第三階段（進階功能）
✅ 4. 夜間模式 - **已完成**

---

## 🛠 實作建議

### 肉墊顏色主題實作步驟

1. **創建主題管理模組** (`paw-themes.js`)
2. **更新 CSS**，使用 CSS 變數
3. **創建主題選擇 UI**
4. **整合到工具列**
5. **連接狀態記憶**

### 夜間模式實作步驟

1. **創建黑貓 SVG** (`cat-dark.svg`)
2. **更新 CSS**，定義 dark theme 變數
3. **創建切換按鈕**
4. **實作切換動畫**
5. **整合表情系統**（夜間時使用睡覺表情）
6. **連接狀態記憶**

### 狀態記憶實作步驟

1. **創建狀態管理模組** (`state-manager.js`)
2. **定義狀態結構**
3. **實作 save/load 函數**
4. **在各個操作中觸發儲存**
5. **在初始化時載入狀態**

---

## 🎨 設計資源需求

### 需要準備的資源

- [x] 黑貓 SVG（夜間模式）
- [x] 主題選擇 UI 組件
- [x] 夜間/日間切換 icon
- [x] 主題色卡 UI

---

## 📊 功能完成度

| 功能 | 狀態 | 完成度 |
|------|------|--------|
| 貓咪表情系統 | ✅ 已完成 | 100% |
| 狀態記憶 | ✅ 已完成 | 100% |
| 肉墊顏色主題 | ✅ 已完成 | 100% |
| 夜間模式 | ✅ 已完成 | 100% |

---

## 🔗 相關文件

- `README.md` - 專案說明
- `INSTALLATION.md` - 安裝指南
- `cat-mood.js` - 表情系統實作
- `state-manager.js` - 狀態管理模組
- `paw-themes.js` - 主題管理模組
- `assets/cat-expressions.svg` - 日間模式貓咪表情 SVG
- `assets/cat-dark.svg` - 夜間模式黑貓 SVG

---

**🐾 喵～一步一步來，讓小貓越來越聰明！**
