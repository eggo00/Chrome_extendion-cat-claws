// 肉墊顏色主題管理模組
(function() {
  'use strict';

  /**
   * 主題定義
   */
  const THEMES = {
    classic: {
      name: 'Classic Pink',
      displayName: '經典粉',
      paw: '#F6B6C8',
      accent: '#FFDDE7',
      emoji: '🌸'
    },
    milktea: {
      name: 'Milk Tea',
      displayName: '奶茶',
      paw: '#D8B4A0',
      accent: '#F1E3D3',
      emoji: '🧋'
    },
    matcha: {
      name: 'Matcha',
      displayName: '抹茶',
      paw: '#9CC7B8',
      accent: '#DDF2EA',
      emoji: '🍵'
    },
    cocoa: {
      name: 'Cocoa',
      displayName: '可可',
      paw: '#8B6F61',
      accent: '#CBB5A7',
      emoji: '🍫'
    }
  };

  /**
   * 當前主題
   */
  let currentTheme = 'classic';

  /**
   * 設定肉墊主題
   * @param {string} themeName - 主題名稱
   */
  window.setPawTheme = function(themeName) {
    if (!THEMES[themeName]) {
      console.warn(`未知的主題: ${themeName}`);
      return;
    }

    const theme = THEMES[themeName];
    currentTheme = themeName;

    // 更新 CSS 變數
    document.documentElement.style.setProperty('--paw-color', theme.paw);
    document.documentElement.style.setProperty('--paw-accent', theme.accent);

    // 設定 data 屬性（用於特殊樣式）
    document.documentElement.dataset.pawTheme = themeName;

    // 儲存到狀態
    if (typeof updateState === 'function') {
      updateState({ pawTheme: themeName });
    }

    console.log(`🐾 肉墊主題已切換至: ${theme.displayName}`);

    // 觸發主題切換事件
    const event = new CustomEvent('pawThemeChanged', { detail: { theme: themeName } });
    document.dispatchEvent(event);
  };

  /**
   * 取得當前主題
   */
  window.getCurrentPawTheme = function() {
    return currentTheme;
  };

  /**
   * 取得所有主題
   */
  window.getAllPawThemes = function() {
    return { ...THEMES };
  };

  /**
   * 取得主題資訊
   * @param {string} themeName - 主題名稱
   */
  window.getPawThemeInfo = function(themeName) {
    return THEMES[themeName] ? { ...THEMES[themeName] } : null;
  };

  /**
   * 初始化主題系統
   */
  window.initPawThemes = async function() {
    // 從狀態載入主題
    if (typeof loadState === 'function') {
      const state = await loadState();
      if (state.pawTheme) {
        setPawTheme(state.pawTheme);
      } else {
        setPawTheme('classic');
      }
    } else {
      setPawTheme('classic');
    }

    console.log('🐾 肉墊主題系統已初始化');
  };

  console.log('🐾 肉墊主題管理模組已載入');

})();
