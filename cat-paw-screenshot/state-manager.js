// 狀態管理模組 - 記住用戶偏好設定
(function() {
  'use strict';

  /**
   * 預設狀態
   */
  const DEFAULT_STATE = {
    theme: 'light',           // 主題：light / dark
    pawTheme: 'classic',      // 肉墊主題：classic / milktea / matcha / cocoa
    lastTool: 'pen',          // 最後使用的工具
    lastColor: '#F6B6C8',     // 最後使用的顏色
    lastSize: 3,              // 最後使用的粗細
    catMood: 'idle'           // 貓咪表情
  };

  /**
   * 儲存狀態到 chrome.storage
   * @param {Object} state - 要儲存的狀態
   */
  window.saveState = async function(state) {
    try {
      await chrome.storage.local.set({ catClawsState: state });
      console.log('✅ 狀態已儲存:', state);
    } catch (error) {
      console.error('❌ 儲存狀態失敗:', error);
    }
  };

  /**
   * 載入狀態從 chrome.storage
   * @returns {Object} 載入的狀態（若無則返回預設值）
   */
  window.loadState = async function() {
    try {
      const result = await chrome.storage.local.get(['catClawsState']);
      const state = result.catClawsState || DEFAULT_STATE;
      console.log('✅ 狀態已載入:', state);
      return state;
    } catch (error) {
      console.error('❌ 載入狀態失敗:', error);
      return DEFAULT_STATE;
    }
  };

  /**
   * 更新部分狀態
   * @param {Object} updates - 要更新的欄位
   */
  window.updateState = async function(updates) {
    try {
      const currentState = await loadState();
      const newState = { ...currentState, ...updates };
      await saveState(newState);
      return newState;
    } catch (error) {
      console.error('❌ 更新狀態失敗:', error);
    }
  };

  /**
   * 重置狀態到預設值
   */
  window.resetState = async function() {
    try {
      await saveState(DEFAULT_STATE);
      console.log('✅ 狀態已重置為預設值');
      return DEFAULT_STATE;
    } catch (error) {
      console.error('❌ 重置狀態失敗:', error);
    }
  };

  /**
   * 取得預設狀態
   */
  window.getDefaultState = function() {
    return { ...DEFAULT_STATE };
  };

  console.log('💾 狀態管理系統已載入');

})();
