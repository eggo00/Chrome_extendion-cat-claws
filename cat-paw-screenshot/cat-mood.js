// 貓咪表情管理模組
(function() {
  'use strict';

  /**
   * 表情狀態對應表
   */
  const MOODS = {
    idle: 'expression-idle',       // 微笑 - 編輯頁面初始
    hover: 'expression-hover',     // 好奇 - 滑鼠移到工具列
    capture: 'expression-capture', // 驚喜 - 截圖完成瞬間
    draw: 'expression-draw',       // 認真 - 使用畫筆
    sticker: 'expression-sticker', // 開心 - 蓋貓爪
    undo: 'expression-undo',       // 小失落 - 復原
    download: 'expression-download', // 得意 - 下載完成
    night: 'expression-night'      // 睡覺 - 夜間模式
  };

  /**
   * 設定貓咪表情
   * @param {string} mood - 表情類型
   */
  window.setCatMood = function(mood) {
    const activeExpression = document.getElementById('active-expression');

    if (!activeExpression) {
      console.warn('找不到貓咪表情元素');
      return;
    }

    const expressionId = MOODS[mood];

    if (!expressionId) {
      console.warn(`未知的表情: ${mood}`);
      return;
    }

    // 切換表情
    activeExpression.setAttribute('href', `#${expressionId}`);

    // 添加切換動畫
    const catDecoration = document.querySelector('.cat-decoration');
    if (catDecoration) {
      catDecoration.style.animation = 'none';
      setTimeout(() => {
        catDecoration.style.animation = 'catFloat 3s ease-in-out infinite, expressionChange 0.3s ease-out';
      }, 10);
    }

    console.log(`貓咪表情切換至: ${mood}`);
  };

  /**
   * 自動恢復到閒置表情
   * @param {number} delay - 延遲時間（毫秒）
   */
  window.setCatMoodTemporary = function(mood, delay = 2000) {
    setCatMood(mood);
    setTimeout(() => {
      setCatMood('idle');
    }, delay);
  };

  /**
   * 取得當前表情
   */
  window.getCurrentCatMood = function() {
    const activeExpression = document.getElementById('active-expression');
    if (!activeExpression) return null;

    const href = activeExpression.getAttribute('href');
    const expressionId = href.replace('#', '');

    for (let [mood, id] of Object.entries(MOODS)) {
      if (id === expressionId) return mood;
    }

    return null;
  };

  console.log('貓咪表情系統已載入');

})();
