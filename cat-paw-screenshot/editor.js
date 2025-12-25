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

  // 文字圖層系統
  let textLayers = [];
  let selectedTextId = null;
  let textIdCounter = 0;
  let resizingHandle = null; // 'nw', 'ne', 'sw', 'se' 或 null
  let resizeStartSize = 0;
  let textBoxStartX = 0;
  let textBoxStartY = 0;
  let justSelectedText = false; // 標記是否剛選中文字圖層

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

    // 鍵盤事件 - 刪除選中的文字圖層
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTextId !== null) {
        // 確保不是在輸入框中
        if (document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          deleteSelectedTextLayer();
        }
      }
    });

    // 滑鼠移動時更新游標樣式（用於縮放控制點）
    canvas.addEventListener('mousemove', (e) => {
      if (isDrawing) return; // 繪製時不改變游標

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const handle = getResizeHandleAtPoint(mouseX, mouseY);

      if (handle) {
        // 根據控制點位置設定游標
        if (handle === 'nw' || handle === 'se') {
          canvas.style.cursor = 'nwse-resize';
        } else if (handle === 'ne' || handle === 'sw') {
          canvas.style.cursor = 'nesw-resize';
        }
      } else if (selectedTextId !== null && getTextLayerAtPoint(mouseX, mouseY)) {
        canvas.style.cursor = 'move';
      } else {
        updateCursor(); // 恢復預設游標
      }
    });

    // 定期重繪文字圖層
    setInterval(renderTextLayers, 16); // 60 FPS
  }

  /**
   * 更新游標樣式
   */
  function updateCursor() {
    if (currentTool === 'stamp') {
      canvas.style.cursor = 'pointer';
    } else if (currentTool === 'text') {
      canvas.style.cursor = 'text';
    } else {
      canvas.style.cursor = 'crosshair';
    }
  }

  /**
   * 滑鼠按下
   */
  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();

    // 計算縮放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 修正座標偏移
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;

    // 檢查是否點擊了縮放控制點（如果有選中的文字）
    if (selectedTextId !== null) {
      const handle = getResizeHandleAtPoint(startX, startY);
      if (handle) {
        resizingHandle = handle;
        isDrawing = true;
        const textLayer = textLayers.find(t => t.id === selectedTextId);
        if (textLayer) {
          resizeStartSize = textLayer.fontSize;
        }
        console.log('開始縮放:', handle);
        return;
      }
    }

    // 檢查是否點擊了文字圖層（優先處理）
    const clickedText = getTextLayerAtPoint(startX, startY);
    if (clickedText) {
      selectedTextId = clickedText.id;
      isDrawing = true;
      resizingHandle = null;
      justSelectedText = true; // 標記剛選中了文字圖層
      console.log('選中文字圖層:', clickedText.text);
      return;
    }

    // 如果點擊空白處，取消選擇
    selectedTextId = null;
    resizingHandle = null;
    justSelectedText = false;

    isDrawing = true;

    // 貓爪貼紙工具直接貼上
    if (currentTool === 'stamp') {
      stampPaw(startX, startY);
      saveHistory();
      isDrawing = false;
      return;
    }

    // 文字工具：如果點擊到空白處才開始拖曳畫出文字框
    // 如果點擊到已存在的文字圖層，上面的邏輯已經選中它了，這裡不執行
    if (currentTool === 'text') {
      console.log('📝 文字工具被點擊，開始拖曳畫文字框');
      textBoxStartX = startX;
      textBoxStartY = startY;
      // isDrawing 已經是 true，會進入 handleMouseMove
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

    // 如果正在縮放文字圖層
    if (resizingHandle !== null && selectedTextId !== null) {
      const textLayer = textLayers.find(t => t.id === selectedTextId);
      if (textLayer) {
        // 計算距離變化來調整字體大小
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        // 使用對角線距離來計算縮放
        let scaleFactor = 1;
        if (resizingHandle === 'se' || resizingHandle === 'nw') {
          scaleFactor = 1 + (deltaX + deltaY) / 200;
        } else if (resizingHandle === 'ne' || resizingHandle === 'sw') {
          scaleFactor = 1 + (deltaX - deltaY) / 200;
        }

        // 限制最小和最大字體大小
        const newSize = Math.max(12, Math.min(200, resizeStartSize * scaleFactor));
        textLayer.fontSize = newSize;
      }
      return;
    }

    // 如果選中了文字圖層，拖曳它
    if (selectedTextId !== null && resizingHandle === null) {
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      const textLayer = textLayers.find(t => t.id === selectedTextId);
      if (textLayer) {
        textLayer.x += deltaX;
        textLayer.y += deltaY;
      }

      startX = currentX;
      startY = currentY;
      return;
    }

    if (currentTool === 'pen') {
      drawLine(currentX, currentY);
    } else if (currentTool === 'rect' || currentTool === 'circle' || currentTool === 'text') {
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
    } else if (currentTool === 'text') {
      // 如果剛才只是選中文字圖層，不建立新的文字框
      if (justSelectedText) {
        console.log('只是選中文字圖層，不建立新文字框');
        justSelectedText = false;
      } else {
        // 文字工具：拖曳結束後顯示輸入框
        const displayStartX = (textBoxStartX / scaleX);
        const displayStartY = (textBoxStartY / scaleY);
        const displayEndX = (endX / scaleX);
        const displayEndY = (endY / scaleY);

        // 計算文字框的寬高
        const boxWidth = Math.abs(displayEndX - displayStartX);
        const boxHeight = Math.abs(displayEndY - displayStartY);

        // 只有當框的大小夠大時才建立文字輸入框（避免誤觸）
        if (boxWidth > 10 && boxHeight > 10) {
          // 計算左上角位置
          const boxX = Math.min(displayStartX, displayEndX);
          const boxY = Math.min(displayStartY, displayEndY);

          const canvasStartX = Math.min(textBoxStartX, endX);
          const canvasStartY = Math.min(textBoxStartY, endY);

          // 根據框的大小計算字體大小（高度的 70%）
          const fontSize = Math.max(12, Math.min(200, boxHeight * 0.7));

          console.log('文字框大小:', boxWidth, 'x', boxHeight, '字體大小:', fontSize);

          showTextInputWithSize(boxX, boxY, canvasStartX, canvasStartY, boxWidth, boxHeight, fontSize);
        }
      }
    } else if (currentTool === 'pen') {
      saveHistory();
    }

    isDrawing = false;
    resizingHandle = null;
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
   * 隨機角度、隨機大小（有大有小）、只顯示粉紅色貓爪
   */
  function stampPaw(x, y) {
    if (!pawImage || !pawImage.complete) {
      console.error('貓爪圖案尚未載入');
      return;
    }

    const baseSize = 60; // 基礎大小

    // 隨機大小 0.5～1.5（更大的變化範圍，有大有小）
    const randomScale = 0.5 + Math.random() * 1.0;
    const size = baseSize * randomScale;

    // 隨機角度 ±30°（增加旋轉變化）
    const randomAngle = (Math.random() * 60 - 30) * Math.PI / 180;

    // 保存當前狀態
    ctx.save();

    // 移動到貓爪位置
    ctx.translate(x, y);

    // 旋轉
    ctx.rotate(randomAngle);

    // 設定透明度
    ctx.globalAlpha = 0.85;

    // 直接繪製貓爪圖案（移除方框）
    ctx.drawImage(pawImage, -size / 2, -size / 2, size, size);

    // 恢復狀態
    ctx.restore();
  }

  /**
   * 讓文字輸入框可拖曳
   */
  function makeTextInputDraggable(textInput, canvasRect, containerRect) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const handleMouseDown = (e) => {
      // 只有在輸入框邊框區域才能拖曳（不影響文字編輯）
      if (e.target !== textInput) return;

      const rect = textInput.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 只有點擊邊緣才拖曳（上下左右 8px 範圍）
      const isEdge = clickX < 8 || clickX > rect.width - 8 ||
                     clickY < 8 || clickY > rect.height - 8;

      if (!isEdge && document.activeElement === textInput) return;

      isDragging = true;
      textInput.classList.add('dragging');

      startX = e.clientX;
      startY = e.clientY;
      initialLeft = parseFloat(textInput.style.left);
      initialTop = parseFloat(textInput.style.top);

      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newLeft = initialLeft + deltaX;
      const newTop = initialTop + deltaY;

      textInput.style.left = newLeft + 'px';
      textInput.style.top = newTop + 'px';

      // 更新畫布座標
      const scaleX = canvas.width / canvasRect.width;
      const scaleY = canvas.height / canvasRect.height;

      const displayX = newLeft - (canvasRect.left - containerRect.left);
      const displayY = newTop - (canvasRect.top - containerRect.top);

      textInput.dataset.canvasX = displayX * scaleX;
      textInput.dataset.canvasY = displayY * scaleY;
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        textInput.classList.remove('dragging');
      }
    };

    textInput.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 清理事件監聽器（儲存為屬性供後續使用）
    textInput.cleanupDrag = () => {
      textInput.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }

  /**
   * 顯示文字輸入框（帶指定大小）
   */
  function showTextInputWithSize(displayX, displayY, canvasX, canvasY, width, height, fontSize) {
    const textInput = document.getElementById('text-input');
    if (!textInput) {
      console.error('找不到文字輸入框元素');
      return;
    }

    // 取得畫布位置
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = canvas.parentElement.getBoundingClientRect();

    // 計算相對於 canvas-container 的位置
    const inputX = canvasRect.left - containerRect.left + displayX;
    const inputY = canvasRect.top - containerRect.top + displayY;

    // 設定輸入框位置和大小
    textInput.style.left = inputX + 'px';
    textInput.style.top = inputY + 'px';
    textInput.style.width = width + 'px';
    textInput.style.height = height + 'px';
    textInput.style.display = 'block';
    textInput.value = '';
    textInput.style.color = currentColor;
    textInput.style.fontSize = fontSize + 'px';

    // 延遲 focus 確保輸入框已顯示
    setTimeout(() => {
      textInput.focus();
    }, 10);

    // 儲存畫布座標和字體大小供後續使用
    textInput.dataset.canvasX = canvasX;
    textInput.dataset.canvasY = canvasY;
    textInput.dataset.fontSize = fontSize;

    console.log('文字輸入框已顯示於:', inputX, inputY, '大小:', width, 'x', height, '字體:', fontSize);

    // 按下 Enter 時創建文字圖層
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        const text = textInput.value.trim();
        if (text) {
          addTextLayer(
            text,
            parseFloat(textInput.dataset.canvasX),
            parseFloat(textInput.dataset.canvasY),
            currentColor,
            parseFloat(textInput.dataset.fontSize)
          );
        }
        // 重置輸入框樣式
        textInput.style.width = '';
        textInput.style.height = '';
        textInput.style.display = 'none';
        textInput.removeEventListener('keydown', handleEnter);
        textInput.removeEventListener('blur', handleBlur);
      }
    };

    // 失去焦點時也創建文字圖層
    const handleBlur = () => {
      setTimeout(() => {
        const text = textInput.value.trim();
        if (text) {
          addTextLayer(
            text,
            parseFloat(textInput.dataset.canvasX),
            parseFloat(textInput.dataset.canvasY),
            currentColor,
            parseFloat(textInput.dataset.fontSize)
          );
        }
        // 重置輸入框樣式
        textInput.style.width = '';
        textInput.style.height = '';
        textInput.style.display = 'none';
        textInput.removeEventListener('keydown', handleEnter);
        textInput.removeEventListener('blur', handleBlur);
      }, 100);
    };

    textInput.addEventListener('keydown', handleEnter);
    textInput.addEventListener('blur', handleBlur);
  }

  /**
   * 新增文字圖層
   */
  function addTextLayer(text, x, y, color, fontSize) {
    const textLayer = {
      id: textIdCounter++,
      text: text,
      x: x,
      y: y,
      color: color,
      fontSize: fontSize
    };

    textLayers.push(textLayer);
    console.log('✅ 新增文字圖層:', textLayer);
  }

  /**
   * 刪除選中的文字圖層
   */
  function deleteSelectedTextLayer() {
    if (selectedTextId === null) return;

    const index = textLayers.findIndex(t => t.id === selectedTextId);
    if (index !== -1) {
      const deletedLayer = textLayers.splice(index, 1)[0];
      console.log('🗑️ 刪除文字圖層:', deletedLayer.text);
      selectedTextId = null;
    }
  }

  /**
   * 檢查點擊位置是否在文字圖層上
   */
  function getTextLayerAtPoint(x, y) {
    // 從後往前檢查（後加入的圖層在上層）
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const layer = textLayers[i];

      // 創建臨時 context 測量文字
      ctx.save();
      ctx.font = `${layer.fontSize}px Nunito, Poppins, sans-serif`;
      const metrics = ctx.measureText(layer.text);
      const textWidth = metrics.width;
      const textHeight = layer.fontSize * 1.2; // 估算高度
      ctx.restore();

      // 檢查點是否在文字範圍內
      if (x >= layer.x && x <= layer.x + textWidth &&
          y >= layer.y && y <= layer.y + textHeight) {
        return layer;
      }
    }

    return null;
  }

  /**
   * 檢查點擊位置是否在縮放控制點上
   */
  function getResizeHandleAtPoint(x, y) {
    if (selectedTextId === null) return null;

    const textLayer = textLayers.find(t => t.id === selectedTextId);
    if (!textLayer) return null;

    // 測量文字尺寸
    ctx.save();
    ctx.font = `${textLayer.fontSize}px Nunito, Poppins, sans-serif`;
    const metrics = ctx.measureText(textLayer.text);
    const textWidth = metrics.width;
    const textHeight = textLayer.fontSize * 1.2;
    ctx.restore();

    const handleSize = 10; // 控制點大小
    const padding = 5;

    // 四個角的控制點位置
    const handles = {
      nw: { x: textLayer.x - padding, y: textLayer.y - padding },
      ne: { x: textLayer.x + textWidth + padding, y: textLayer.y - padding },
      sw: { x: textLayer.x - padding, y: textLayer.y + textHeight + padding },
      se: { x: textLayer.x + textWidth + padding, y: textLayer.y + textHeight + padding }
    };

    // 檢查是否點擊了某個控制點
    for (const [name, pos] of Object.entries(handles)) {
      if (x >= pos.x - handleSize / 2 && x <= pos.x + handleSize / 2 &&
          y >= pos.y - handleSize / 2 && y <= pos.y + handleSize / 2) {
        return name;
      }
    }

    return null;
  }

  /**
   * 渲染所有文字圖層
   */
  function renderTextLayers() {
    if (!canvas || !ctx) return;

    // 恢復到當前歷史狀態（清除之前的文字圖層渲染）
    if (historyStep >= 0) {
      const imageData = history[historyStep];
      ctx.putImageData(imageData, 0, 0);
    }

    // 繪製所有文字圖層
    textLayers.forEach(layer => {
      ctx.save();
      ctx.fillStyle = layer.color;
      ctx.font = `${layer.fontSize}px Nunito, Poppins, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(layer.text, layer.x, layer.y);

      // 如果是選中的圖層，顯示選擇框和縮放控制點
      if (layer.id === selectedTextId) {
        const metrics = ctx.measureText(layer.text);
        const textWidth = metrics.width;
        const textHeight = layer.fontSize * 1.2;

        const padding = 5;

        // 繪製虛線選擇框
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(layer.x - padding, layer.y - padding, textWidth + padding * 2, textHeight + padding * 2);
        ctx.setLineDash([]);

        // 繪製四個角的縮放控制點
        const handleSize = 10;
        const handles = [
          { x: layer.x - padding, y: layer.y - padding }, // 左上
          { x: layer.x + textWidth + padding, y: layer.y - padding }, // 右上
          { x: layer.x - padding, y: layer.y + textHeight + padding }, // 左下
          { x: layer.x + textWidth + padding, y: layer.y + textHeight + padding } // 右下
        ];

        handles.forEach(handle => {
          ctx.fillStyle = '#FF69B4';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(handle.x, handle.y, handleSize / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      }

      ctx.restore();
    });
  }

  /**
   * 重繪並顯示預覽（用於方框、圓形和文字框）
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
    } else if (currentTool === 'text') {
      // 預覽文字框（虛線框）
      const width = currentX - textBoxStartX;
      const height = currentY - textBoxStartY;

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(textBoxStartX, textBoxStartY, width, height);
      ctx.setLineDash([]);

      // 顯示提示文字
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = 0.3;
      ctx.font = '14px Arial';
      ctx.fillText('拖曳調整文字框大小', textBoxStartX + 10, textBoxStartY + 20);
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
   * 下載圖片（合併所有文字圖層）
   */
  function download() {
    try {
      // 創建臨時 canvas 用於合併圖層
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // 1. 繪製底圖（當前畫布狀態）
      if (historyStep >= 0) {
        const imageData = history[historyStep];
        tempCtx.putImageData(imageData, 0, 0);
      }

      // 2. 繪製所有文字圖層
      textLayers.forEach(layer => {
        tempCtx.save();
        tempCtx.fillStyle = layer.color;
        tempCtx.font = `${layer.fontSize}px Nunito, Poppins, sans-serif`;
        tempCtx.textBaseline = 'top';
        tempCtx.fillText(layer.text, layer.x, layer.y);
        tempCtx.restore();
      });

      // 3. 將合併後的 canvas 轉換為 blob 並下載
      tempCanvas.toBlob((blob) => {
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

        console.log('下載成功！已合併', textLayers.length, '個文字圖層');
      }, 'image/png');

    } catch (error) {
      console.error('下載失敗:', error);
      alert('下載失敗，請重試！');
    }
  }

})();
