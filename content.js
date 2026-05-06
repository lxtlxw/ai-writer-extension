// 内容脚本 - 监听文本选择和快捷键
(function() {
  'use strict';

  let selectedText = '';

  document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    selectedText = selection ? selection.toString().trim() : '';
  });

  // 接收来自 background 的请求
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
      sendResponse({ text: selectedText });
    }
  });
})();
