// 懸浮貓爪按鈕 - Content Script
(function() {
  'use strict';

  // 防止重複注入
  if (window.catPawInjected) return;
  window.catPawInjected = true;

  // 創建貓爪按鈕
  function createCatPawButton() {
    const button = document.createElement('div');
    button.id = 'cat-paw-button';
    button.title = '喵～截圖一下？';

    // 載入貓爪 SVG 圖示
    const pawIcon = document.createElement('img');
    pawIcon.src = chrome.runtime.getURL('assets/paw.svg');
    pawIcon.alt = '貓爪';
    button.appendChild(pawIcon);

    document.body.appendChild(button);

    // 初始化拖曳功能
    initDragging(button);

    // 點擊截圖功能
    button.addEventListener('click', handleScreenshot);

    return button;
  }

  // 拖曳功能
  function initDragging(button) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    button.hasMoved = false;

    button.addEventListener('mousedown', (e) => {
      // 只允許左鍵拖曳
      if (e.button !== 0) return;

      isDragging = true;
      button.hasMoved = false;
      button.classList.add('dragging');

      // 記錄初始位置
      startX = e.clientX;
      startY = e.clientY;

      const rect = button.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      // 防止文字選取
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // 如果移動超過 5px，視為拖曳
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        button.hasMoved = true;
      }

      // 更新位置
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;

      // 限制在視窗範圍內
      const maxX = window.innerWidth - button.offsetWidth;
      const maxY = window.innerHeight - button.offsetHeight;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      button.style.left = boundedX + 'px';
      button.style.top = boundedY + 'px';
      button.style.right = 'auto';
      button.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        button.classList.remove('dragging');

        // 如果有移動，則取消點擊事件
        if (button.hasMoved) {
          setTimeout(() => {
            button.hasMoved = false;
          }, 100);
        }
      }
    });
  }

  // 處理截圖
  function handleScreenshot(e) {
    // 如果是拖曳後的點擊，不觸發截圖
    if (e.target.closest('#cat-paw-button').hasMoved) return;

    const button = document.getElementById('cat-paw-button');

    // 添加點擊動畫
    button.classList.add('clicking');
    setTimeout(() => {
      button.classList.remove('clicking');
    }, 300);

    // 顯示「啾」提示動畫
    showMeowPopup(e.clientX, e.clientY);

    // 發送截圖請求到 background script
    chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
      if (response && response.success) {
        console.log('截圖成功！');
      } else {
        console.error('截圖失敗:', response?.error);
        alert('截圖失敗，請重試！');
      }
    });
  }

  // 顯示「啾」提示動畫
  function showMeowPopup(x, y) {
    const popup = document.createElement('div');
    popup.className = 'meow-popup';
    popup.textContent = '啾～';
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';

    document.body.appendChild(popup);

    // 1秒後移除
    setTimeout(() => {
      popup.remove();
    }, 1000);
  }

  // 初始化
  function init() {
    // 等待 DOM 完全載入
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createCatPawButton);
    } else {
      createCatPawButton();
    }
  }

  // 執行初始化
  init();

})();
