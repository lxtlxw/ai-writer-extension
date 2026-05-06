// ====== API Key 管理 ======
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const testApiKeyBtn = document.getElementById('testApiKey');
const apiStatus = document.getElementById('apiStatus');

// 加载已保存的 Key
chrome.storage.sync.get(['apiKey'], (result) => {
  if (result.apiKey) {
    apiKeyInput.value = result.apiKey;
    apiStatus.textContent = '✅ API Key 已配置';
    apiStatus.className = 'status success';
  }
});

// 保存 API Key
saveApiKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    apiStatus.textContent = '❌ 请输入 API Key';
    apiStatus.className = 'status error';
    return;
  }
  if (!key.startsWith('sk-ant-')) {
    apiStatus.textContent = '❌ API Key 格式不正确，应以 sk-ant- 开头';
    apiStatus.className = 'status error';
    return;
  }

  chrome.storage.sync.set({ apiKey: key }, () => {
    apiStatus.textContent = '✅ API Key 已保存！';
    apiStatus.className = 'status success';
    setTimeout(() => {
      apiStatus.textContent = '';
    }, 2000);
  });
});

// 测试 API 连接
testApiKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    apiStatus.textContent = '❌ 请先输入 API Key';
    apiStatus.className = 'status error';
    return;
  }

  apiStatus.textContent = '⏳ 测试连接中...';
  apiStatus.className = 'status';

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'say ok' }]
      })
    });

    if (resp.ok) {
      apiStatus.textContent = '✅ API 连接成功！Key 有效';
      apiStatus.className = 'status success';
    } else {
      const err = await resp.text();
      apiStatus.textContent = `❌ API 错误: ${resp.status} - ${err}`;
      apiStatus.className = 'status error';
    }
  } catch (err) {
    apiStatus.textContent = `❌ 网络错误: ${err.message}`;
    apiStatus.className = 'status error';
  }
});

// ====== 许可证管理 ======
const licenseInput = document.getElementById('licenseKey');
const activateBtn = document.getElementById('activateLicense');
const licenseStatus = document.getElementById('licenseStatus');
const buyLicenseLink = document.getElementById('buyLicense');

// 加载已保存的许可证
chrome.storage.sync.get(['licenseKey'], (result) => {
  if (result.licenseKey) {
    licenseInput.value = result.licenseKey;
    licenseStatus.textContent = '✅ Pro 会员已激活';
    licenseStatus.className = 'status success';
  }
});

// 激活许可证
activateBtn.addEventListener('click', async () => {
  const key = licenseInput.value.trim();
  if (!key) {
    licenseStatus.textContent = '❌ 请输入许可证密钥';
    licenseStatus.className = 'status error';
    return;
  }

  licenseStatus.textContent = '⏳ 验证中...';
  licenseStatus.className = 'status';

  try {
    const resp = await fetch(
      `https://api.lemonsqueezy.com/v1/licenses/validate?license_key=${key}`
    );
    const data = await resp.json();

    if (data.valid) {
      chrome.storage.sync.set({ licenseKey: key }, () => {
        licenseStatus.textContent = '✅ Pro 会员激活成功！';
        licenseStatus.className = 'status success';
      });
    } else {
      licenseStatus.textContent = '❌ 许可证无效或已过期';
      licenseStatus.className = 'status error';
    }
  } catch {
    // 离线激活：允许本地缓存
    chrome.storage.sync.set({ licenseKey: key }, () => {
      licenseStatus.textContent = '⚠️ 已保存（离线模式），联网后将自动验证';
      licenseStatus.className = 'status';
    });
  }
});

// 购买链接
buyLicenseLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.storage.sync.get(['storeUrl'], (result) => {
    const url = result.storeUrl || 'https://your-lemonsqueezy-store.com/checkout';
    chrome.tabs.create({ url });
  });
});

// ====== 商店 URL 管理 ======
const storeUrlInput = document.getElementById('storeUrl');
const saveStoreUrlBtn = document.getElementById('saveStoreUrl');
const storeStatus = document.getElementById('storeStatus');

chrome.storage.sync.get(['storeUrl'], (result) => {
  if (result.storeUrl) {
    storeUrlInput.value = result.storeUrl;
  }
});

saveStoreUrlBtn.addEventListener('click', () => {
  const url = storeUrlInput.value.trim();
  if (!url) {
    storeStatus.textContent = '❌ 请输入商店 URL';
    storeStatus.className = 'status error';
    return;
  }
  chrome.storage.sync.set({ storeUrl: url }, () => {
    storeStatus.textContent = '✅ 商店 URL 已保存！';
    storeStatus.className = 'status success';
    setTimeout(() => { storeStatus.textContent = ''; }, 2000);
  });
});
