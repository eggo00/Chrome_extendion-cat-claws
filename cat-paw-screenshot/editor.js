// 貓爪截圖編輯器 - 主要邏輯
(function() {
  'use strict';

  // 全域變數
  let canvas, ctx;
  let currentTool = 'pen';
  let currentColor = '#FF69B4';
  let currentSize = 3;
  let isDrawing = false;
  let startX, startY;

  // 歷史記錄（用於復原功能）
  let history = [];
  let historyStep = -1;

  // 貓爪圖案（用於貼紙）
  let pawImage = null;

  // 初始化
  document.addEventListener('DOMContentLoaded', init);

  /**
   * 初始化編輯器
   */
  async function init() {
    // 取得 DOM 元素
    canvas = document.getElementById('editor-canvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    // 載入截圖
    await loadScreenshot();

    // 載入用戶狀態
    await loadUserState();

    // 初始化工具列
    initToolbar();

    // 初始化畫布事件
    initCanvasEvents();

    // 載入貓爪圖案
    loadPawImage();

    // 初始化貓咪表情系統
    initCatMoodSystem();

    // 初始化主題系統
    initThemeSystem();

    console.log('編輯器初始化完成！');
  }

  /**
   * 初始化主題系統
   */
  async function initThemeSystem() {
    // 初始化肉墊主題
    if (typeof initPawThemes === 'function') {
      await initPawThemes();
    }

    // 初始化夜間模式
    await initDarkMode();

    // 設定主題選擇器
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');

    if (!themeBtn || !themeMenu) return;

    // 點擊按鈕切換選單
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('show');
    });

    // 點擊外部關閉選單
    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
        themeMenu.classList.remove('show');
      }
    });

    // 選擇主題
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;

        // 移除所有 active
        themeOptions.forEach(opt => opt.classList.remove('active'));

        // 添加當前 active
        option.classList.add('active');

        // 切換主題
        if (typeof setPawTheme === 'function') {
          setPawTheme(theme);
        }

        // 關閉選單
        themeMenu.classList.remove('show');
      });
    });

    // 標記當前主題為 active
    const currentTheme = typeof getCurrentPawTheme === 'function' ? getCurrentPawTheme() : 'classic';
    themeOptions.forEach(option => {
      if (option.dataset.theme === currentTheme) {
        option.classList.add('active');
      }
    });
  }

  /**
   * 初始化夜間模式
   */
  async function initDarkMode() {
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const catObject = document.getElementById('cat-object');

    if (!darkModeBtn || !darkModeIcon || !catObject) return;

    // 載入保存的主題設定
    const state = typeof loadState === 'function' ? await loadState() : {};
    const isDark = state.theme === 'dark';

    // 應用初始主題
    if (isDark) {
      document.documentElement.dataset.theme = 'dark';
      darkModeIcon.textContent = '☀️';
      catObject.data = 'assets/cat-dark.svg';
      if (typeof setCatMood === 'function') {
        setCatMood('night');
      }
    }

    // 切換夜間模式
    darkModeBtn.addEventListener('click', async () => {
      const currentlyDark = document.documentElement.dataset.theme === 'dark';

      // 切換主題
      if (currentlyDark) {
        // 切換到日間模式
        document.documentElement.dataset.theme = 'light';
        darkModeIcon.textContent = '🌙';
        catObject.data = 'assets/cat-expressions.svg';
        if (typeof setCatMood === 'function') {
          setCatMood('idle');
        }
      } else {
        // 切換到夜間模式
        document.documentElement.dataset.theme = 'dark';
        darkModeIcon.textContent = '☀️';
        catObject.data = 'assets/cat-dark.svg';
        if (typeof setCatMood === 'function') {
          setCatMood('night');
        }
      }

      // 儲存設定
      if (typeof updateState === 'function') {
        await updateState({
          theme: currentlyDark ? 'light' : 'dark'
        });
      }
    });
  }

  /**
   * 載入用戶狀態
   */
  async function loadUserState() {
    if (typeof loadState !== 'function') {
      console.warn('狀態管理系統未載入');
      return;
    }

    const state = await loadState();

    // 恢復工具設定
    if (state.lastTool) {
      currentTool = state.lastTool;

      // 選中對應的工具按鈕（需要在 initToolbar 之後執行）
      setTimeout(() => {
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
          if (btn.dataset.tool === state.lastTool) {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 切換對應的表情
            if (typeof setCatMood === 'function') {
              if (state.lastTool === 'pen') {
                setCatMood('draw');
              } else if (state.lastTool === 'stamp') {
                setCatMood('sticker');
              }
            }
          }
        });
      }, 100);
    }

    // 恢復顏色設定
    if (state.lastColor) {
      currentColor = state.lastColor;
      const colorInput = document.getElementById('color-input');
      if (colorInput) colorInput.value = state.lastColor;
    }

    // 恢復粗細設定
    if (state.lastSize) {
      currentSize = state.lastSize;
      const sizeInput = document.getElementById('size-input');
      const sizeValue = document.getElementById('size-value');
      if (sizeInput) sizeInput.value = state.lastSize;
      if (sizeValue) sizeValue.textContent = state.lastSize;
    }

    console.log('✅ 用戶狀態已恢復:', state);
  }

  /**
   * 初始化貓咪表情系統
   */
  function initCatMoodSystem() {
    // 等待 SVG 載入
    const catObject = document.getElementById('cat-object');
    if (catObject) {
      catObject.addEventListener('load', () => {
        // 顯示驚喜表情（截圖完成）
        setTimeout(() => {
          if (typeof setCatMoodTemporary === 'function') {
            setCatMoodTemporary('capture', 2500);
          }
        }, 500);
      });
    }

    // 工具列 hover 效果
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
      toolbar.addEventListener('mouseenter', () => {
        if (typeof setCatMood === 'function') {
          setCatMood('hover');
        }
      });

      toolbar.addEventListener('mouseleave', () => {
        if (typeof setCatMood === 'function') {
          setCatMood('idle');
        }
      });
    }
  }

  /**
   * 載入截圖
   */
  async function loadScreenshot() {
    const loading = document.getElementById('loading');

    try {
      // 從 storage 讀取截圖資料
      const result = await chrome.storage.local.get(['screenshot']);

      if (!result.screenshot) {
        throw new Error('找不到截圖資料');
      }

      // 載入圖片到 canvas
      const img = new Image();
      img.onload = () => {
        // 設定 canvas 尺寸
        canvas.width = img.width;
        canvas.height = img.height;

        // 繪製圖片
        ctx.drawImage(img, 0, 0);

        // 儲存初始狀態
        saveHistory();

        // 隱藏載入動畫
        loading.classList.add('hidden');
      };

      img.onerror = () => {
        throw new Error('圖片載入失敗');
      };

      img.src = result.screenshot;

    } catch (error) {
      console.error('載入截圖失敗:', error);
      alert('載入截圖失敗，請重新截圖！');
      loading.textContent = '載入失敗 😿';
    }
  }

  /**
   * 載入貓爪圖案
   */
  function loadPawImage() {
    pawImage = new Image();
    pawImage.src = chrome.runtime.getURL('assets/paw.svg');
  }

  /**
   * 初始化工具列
   */
  function initToolbar() {
    // 工具按鈕
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 移除其他按鈕的 active 狀態
        toolBtns.forEach(b => b.classList.remove('active'));
        // 添加當前按鈕的 active 狀態
        btn.classList.add('active');
        // 設定當前工具
        currentTool = btn.dataset.tool;

        // 更新游標樣式
        updateCursor();

        // 根據工具類型切換貓咪表情
        if (typeof setCatMood === 'function') {
          if (currentTool === 'pen') {
            setCatMood('draw');
          } else if (currentTool === 'stamp') {
            setCatMood('sticker');
          } else {
            setCatMood('idle');
          }
        }

        // 儲存工具選擇
        if (typeof updateState === 'function') {
          updateState({ lastTool: currentTool });
        }
      });
    });

    // 預設選中畫筆
    document.getElementById('pen-btn').classList.add('active');

    // 顏色選擇
    const colorInput = document.getElementById('color-input');
    colorInput.addEventListener('input', (e) => {
      currentColor = e.target.value;

      // 儲存顏色選擇
      if (typeof updateState === 'function') {
        updateState({ lastColor: currentColor });
      }
    });

    // 粗細選擇
    const sizeInput = document.getElementById('size-input');
    const sizeValue = document.getElementById('size-value');
    sizeInput.addEventListener('input', (e) => {
      currentSize = parseInt(e.target.value);
      sizeValue.textContent = currentSize;

      // 儲存粗細選擇
      if (typeof updateState === 'function') {
        updateState({ lastSize: currentSize });
      }
    });

    // 復原按鈕
    document.getElementById('undo-btn').addEventListener('click', undo);

    // 下載按鈕
    document.getElementById('download-btn').addEventListener('click', download);
  }

  /**
   * 初始化畫布事件
   */
  function initCanvasEvents() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
  }

  /**
   * 更新游標樣式
   */
  function updateCursor() {
    if (currentTool === 'stamp') {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'crosshair';
    }
  }

  /**
   * 滑鼠按下
   */
  function handleMouseDown(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();

    // 計算縮放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 修正座標偏移
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;

    // 貓爪貼紙工具直接貼上
    if (currentTool === 'stamp') {
      stampPaw(startX, startY);
      saveHistory();
      isDrawing = false;
      return;
    }

    // 畫筆工具開始繪製
    if (currentTool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    }
  }

  /**
   * 滑鼠移動
   */
  function handleMouseMove(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();

    // 計算縮放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 修正座標偏移
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    if (currentTool === 'pen') {
      drawLine(currentX, currentY);
    } else if (currentTool === 'rect' || currentTool === 'circle') {
      // 預覽形狀（需要重繪）
      redrawWithPreview(currentX, currentY);
    }
  }

  /**
   * 滑鼠放開
   */
  function handleMouseUp(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();

    // 計算縮放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 修正座標偏移
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;

    if (currentTool === 'rect') {
      drawRect(startX, startY, endX, endY);
      saveHistory();
    } else if (currentTool === 'circle') {
      drawCircle(startX, startY, endX, endY);
      saveHistory();
    } else if (currentTool === 'pen') {
      saveHistory();
    }

    isDrawing = false;
  }

  /**
   * 繪製線條（畫筆工具）
   */
  function drawLine(x, y) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  /**
   * 繪製方框
   */
  function drawRect(x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.strokeRect(x1, y1, width, height);
  }

  /**
   * 繪製圓形
   */
  function drawCircle(x1, y1, x2, y2) {
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    const centerX = x1 + (x2 - x1) / 2;
    const centerY = y1 + (y2 - y1) / 2;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }

  /**
   * 貼上貓爪貼紙
   * Design DNA: 隨機角度 ±15°、隨機大小 0.8～1.1、三種顏色（粉、白、淺咖）
   */
  function stampPaw(x, y) {
    if (!pawImage || !pawImage.complete) {
      console.error('貓爪圖案尚未載入');
      return;
    }

    const baseSize = 50; // 基礎大小

    // 隨機大小 0.8～1.1
    const randomScale = 0.8 + Math.random() * 0.3;
    const size = baseSize * randomScale;

    // 隨機角度 ±15°
    const randomAngle = (Math.random() * 30 - 15) * Math.PI / 180;

    // 隨機顏色：粉 #F6B6C8、白 #FFFFFF、淺咖 #B88C7D
    const colors = ['#F6B6C8', '#FFFFFF', '#B88C7D'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // 保存當前狀態
    ctx.save();

    // 移動到貓爪位置
    ctx.translate(x, y);

    // 旋轉
    ctx.rotate(randomAngle);

    // 設定顏色濾鏡（使用 globalCompositeOperation）
    ctx.globalAlpha = 0.9;

    // 繪製貓爪
    ctx.drawImage(pawImage, -size / 2, -size / 2, size, size);

    // 如果不是白色，添加顏色覆蓋層
    if (randomColor !== '#FFFFFF') {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = randomColor;
      ctx.fillRect(-size / 2, -size / 2, size, size);
    }

    // 恢復狀態
    ctx.restore();
  }

  /**
   * 重繪並顯示預覽（用於方框和圓形）
   */
  function redrawWithPreview(currentX, currentY) {
    // 恢復到上一個歷史狀態
    if (historyStep >= 0) {
      const imageData = history[historyStep];
      ctx.putImageData(imageData, 0, 0);
    }

    // 繪製預覽
    ctx.save();
    ctx.globalAlpha = 0.5;

    if (currentTool === 'rect') {
      drawRect(startX, startY, currentX, currentY);
    } else if (currentTool === 'circle') {
      drawCircle(startX, startY, currentX, currentY);
    }

    ctx.restore();
  }

  /**
   * 儲存歷史記錄
   */
  function saveHistory() {
    // 移除當前步驟之後的歷史
    history = history.slice(0, historyStep + 1);

    // 儲存當前畫布狀態
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(imageData);
    historyStep++;

    // 限制歷史記錄數量（避免佔用太多記憶體）
    const maxHistory = 20;
    if (history.length > maxHistory) {
      history.shift();
      historyStep--;
    }
  }

  /**
   * 復原功能
   */
  function undo() {
    if (historyStep > 0) {
      historyStep--;
      const imageData = history[historyStep];
      ctx.putImageData(imageData, 0, 0);

      // 切換到小失落表情
      if (typeof setCatMoodTemporary === 'function') {
        setCatMoodTemporary('undo', 1500);
      }
    } else {
      alert('已經是最初狀態囉！');
    }
  }

  /**
   * 下載圖片
   */
  function download() {
    try {
      // 將 canvas 轉換為 blob
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // 生成檔名（包含時間戳）
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `cat-paw-screenshot-${timestamp}.png`;

        a.href = url;
        a.click();

        // 清理
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);

        // 切換到得意表情
        if (typeof setCatMoodTemporary === 'function') {
          setCatMoodTemporary('download', 2500);
        }

        console.log('下載成功！');
      }, 'image/png');

    } catch (error) {
      console.error('下載失敗:', error);
      alert('下載失敗，請重試！');
    }
  }

})();
