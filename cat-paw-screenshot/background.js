// Background Service Worker - 處理截圖邏輯
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🔔 收到訊息:', request);

  // 處理截圖請求
  if (request.action === 'capture') {
    console.log('📸 開始處理截圖請求...');
    handleCapture(sender.tab.id)
      .then(() => {
        console.log('✅ 截圖成功');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('❌ 截圖錯誤:', error);
        sendResponse({ success: false, error: error.message });
      });

    // 返回 true 表示會異步發送回應
    return true;
  }
});

/**
 * 處理截圖流程
 * @param {number} tabId - 當前分頁 ID
 */
async function handleCapture(tabId) {
  try {
    console.log('📷 步驟 1: 開始截取可見分頁...');
    // 1. 截取可見分頁
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });
    console.log('✓ 步驟 1 完成: 截圖已捕獲');

    console.log('💾 步驟 2: 儲存截圖到 storage...');
    // 2. 將截圖資料存到 chrome.storage
    await chrome.storage.local.set({
      screenshot: dataUrl,
      timestamp: Date.now()
    });
    console.log('✓ 步驟 2 完成: 截圖已儲存');

    console.log('🚀 步驟 3: 開啟編輯頁面...');
    // 3. 開啟編輯頁面（使用新分頁）
    await chrome.tabs.create({
      url: chrome.runtime.getURL('editor.html'),
      active: true
    });
    console.log('✓ 步驟 3 完成: 編輯頁面已開啟');

    console.log('🎉 截圖成功，已開啟編輯頁面');

  } catch (error) {
    console.error('💥 截圖處理失敗:', error);
    throw error;
  }
}

/**
 * Extension 安裝時的處理
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('貓爪截圖工具已安裝！喵～');
  } else if (details.reason === 'update') {
    console.log('貓爪截圖工具已更新！');
  }
});
