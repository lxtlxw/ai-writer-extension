// AI 爆款文案 Chrome Extension - Background Service Worker

// ====== 右键菜单 ======
chrome.runtime.onInstalled.addListener(() => {
  // 主菜单
  chrome.contextMenus.create({
    id: "ai-writer-root",
    title: "AI 爆款文案",
    contexts: ["selection"]
  });

  // 子菜单项
  const items = [
    { id: "xiaohongshu", title: "📕 小红书爆款文案" },
    { id: "douyin",      title: "🎬 抖音口播脚本" },
    { id: "seo",         title: "🔍 SEO 优化文章" },
    { id: "wechat",      title: "💬 朋友圈营销文案" },
    { id: "summary",     title: "📝 智能总结摘要" },
    { id: "translate",   title: "🌐 多语言翻译" },
    { id: "rewrite",     title: "✏️ 专业润色改写" },
    { id: "amazon",      title: "🛒 跨境电商Listing" },
  ];

  items.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      parentId: "ai-writer-root",
      title: item.title,
      contexts: ["selection"]
    });
  });
});

// ====== 处理右键点击 ======
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText) return;

  const modeMap = {
    xiaohongshu: "xiaohongshu",
    douyin: "douyin",
    seo: "seo",
    wechat: "wechat",
    summary: "summary",
    translate: "translate",
    rewrite: "rewrite",
    amazon: "amazon"
  };

  const mode = modeMap[info.menuItemId];
  if (!mode) return;

  // 保存选中文本和模式，打开弹窗
  chrome.storage.session.set({
    selectedText: info.selectionText,
    activeMode: mode
  }).then(() => {
    chrome.action.openPopup();
  });
});

// ====== 处理来自 popup 的 API 请求 ======
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callAI") {
    callClaudeAPI(request.prompt, request.apiKey)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // 保持通道开放
  }

  if (request.action === "checkLicense") {
    checkLicense(request.licenseKey)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ valid: false, error: err.message }));
    return true;
  }
});

// ====== Claude API 调用 ======
async function callClaudeAPI(prompt, apiKey) {
  const key = apiKey || (await chrome.storage.sync.get(["apiKey"])).apiKey;
  if (!key) throw new Error("请先在设置中配置 API Key");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 错误: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ====== 许可证校验 (LemonSqueezy) ======
async function checkLicense(licenseKey) {
  if (!licenseKey) return { valid: false, tier: "free" };

  try {
    const resp = await fetch(
      `https://api.lemonsqueezy.com/v1/licenses/validate?license_key=${licenseKey}`,
      { method: "GET" }
    );
    const data = await resp.json();
    if (data.valid) {
      return { valid: true, tier: data.meta?.tier || "pro" };
    }
    return { valid: false, tier: "free" };
  } catch {
    // 离线模式：用本地缓存
    const cached = await chrome.storage.local.get(["cachedLicense"]);
    if (cached.cachedLicense === licenseKey) {
      return { valid: true, tier: "pro", offline: true };
    }
    return { valid: false, tier: "free" };
  }
}
