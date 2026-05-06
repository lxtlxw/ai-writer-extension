// ====== 提示词模板 ======
const PROMPT_TEMPLATES = {
  xiaohongshu: (text, tone) => `你是小红书爆款文案专家。请将以下内容改写成小红书风格的爆款文案。

要求：
- 标题要抓人眼球，使用emoji和数字
- 正文用口语化、有亲和力的语气
- 适当使用emoji排版增加可读性
- 加入话题标签 #xxx
- 整体风格：${tone === 'casual' ? '轻松像朋友聊天' : tone === 'persuasive' ? '有说服力、种草感强' : tone === 'emotional' ? '走心、引发共鸣' : '专业但亲切'}

原文内容：
${text}

请输出：
【标题】
【正文】
【标签】`,

  douyin: (text, tone) => `你是抖音短视频脚本专家。请根据以下内容，生成一个完整的抖音口播脚本。

要求：
- 开头3秒要抓住注意力（钩子）
- 脚本包含：画面描述 + 口播台词 + 字幕重点
- 节奏紧凑，时长控制在60秒以内
- 整体风格：${tone === 'casual' ? '轻松搞笑' : tone === 'persuasive' ? '干货分享、说服力强' : tone === 'emotional' ? '走心故事' : '专业知识分享'}
- 结尾引导互动（点赞/关注/评论）

原文内容：
${text}

请输出：
【视频标题】
【开头钩子（3秒）】
【脚本正文（画面+台词）】
【结尾引导】
【标签】`,

  seo: (text, tone) => `你是SEO内容优化专家。请将以下内容优化为搜索引擎友好的高质量文章。

要求：
- 优化标题，包含核心关键词
- 合理使用H1/H2/H3层级标题
- 段落简洁，每段不超过100字
- 包含关键词密度建议
- 整体风格：${tone === 'professional' ? '专业权威' : tone === 'casual' ? '通俗易懂' : '有说服力'}
- 输出元描述（meta description）
- 输出SEO标题（title tag）

原文内容：
${text}

请输出：
【SEO标题】
【元描述】
【文章正文（Markdown格式）】
【关键词建议】
【内链建议】`,

  wechat: (text, tone) => `你是微信朋友圈/公众号营销文案专家。请将以下内容改写成朋友圈营销文案。

要求：
- 开头用问句或引人深思的话抓住注意力
- 正文有故事感，不要硬广
- 植入产品/服务时自然不生硬
- 结尾引导私信或点击
- 整体风格：${tone === 'persuasive' ? '专业背书型' : tone === 'casual' ? '朋友聊天型' : tone === 'emotional' ? '情感故事型' : '价值干货型'}
- 控制在200字以内（朋友圈）
- 配图建议

原文内容：
${text}

请输出：
【朋友圈文案】
【配图建议】
【评论区引导语】`,

  summary: (text, tone) => `你是专业摘要专家。请提取以下内容的精华，生成一份高质量摘要。

要求：
- 核心观点（3-5条，每条一句话）
- 关键数据/事实
- 行动建议（如有）
- 整体风格：${tone === 'professional' ? '精炼客观' : '通俗易懂'}
- 摘要长度控制在原文的20%以内

原文内容：
${text}

请输出：
【核心观点】
【关键数据】
【行动建议】`,

  translate: (text, tone) => `你是一名专业翻译。请将以下内容翻译为目标语言。

目标语言：${document?.getElementById('languageOption')?.value === 'en' ? '英文' : document?.getElementById('languageOption')?.value === 'ja' ? '日文' : document?.getElementById('languageOption')?.value === 'ko' ? '韩文' : '英文'}

要求：
- 准确性优先，信达雅
- 专业术语使用行业标准译法
- 保持原文的语气和风格
- ${tone === 'professional' ? '正式书面语' : '自然口语化'}

原文内容：
${text}

请输出：【翻译结果】`,

  rewrite: (text, tone) => `你是专业文字润色专家。请优化以下内容。

要求：
- 修正语法和用词不当
- 优化句子结构，提高可读性
- 保持原意不变
- 整体风格：${tone === 'professional' ? '正式专业' : tone === 'casual' ? '轻松自然' : tone === 'persuasive' ? '更有说服力' : '更有感染力'}

原文内容：
${text}

请输出：【优化后文本】`,

  amazon: (text, tone) => `你是跨境电商Listing优化专家。请将以下内容优化为亚马逊/速卖通产品Listing。

要求：
- 优化标题（包含核心关键词，150字符以内）
- 五点描述（Bullet Points，每个15-30词）
- 产品描述（SEO优化，100-200词）
- 关键词后台（Search Terms）
- 整体风格：${tone === 'professional' ? '专业正式' : '亲和有说服力'}

原文内容：
${text}

请输出：
【优化标题】
【五点描述】
【产品描述】
【后台关键词】`
};

// ====== DOM 引用 ======
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const outputSection = document.getElementById('outputSection');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const clearOutputBtn = document.getElementById('clearOutputBtn');
const wordCount = document.getElementById('wordCount');
const settingsLink = document.getElementById('settingsLink');
const tierBadge = document.getElementById('tierBadge');
const proBanner = document.getElementById('proBanner');
const upgradeBtn = document.getElementById('upgradeBtn');
const toneOption = document.getElementById('toneOption');
const languageOption = document.getElementById('languageOption');

let currentMode = 'xiaohongshu';
let isPro = false;

// ====== 初始化 ======
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 检查是否有从右键菜单传入的文本
  const data = await chrome.storage.session.get(['selectedText', 'activeMode']);
  if (data.selectedText) {
    inputText.value = data.selectedText;
    if (data.activeMode) {
      currentMode = data.activeMode;
      updateModeButtons(data.activeMode);
    }
    chrome.storage.session.remove(['selectedText', 'activeMode']);
  }

  // 2. 检查许可证
  const license = await chrome.storage.sync.get(['licenseKey']);
  if (license.licenseKey) {
    const result = await chrome.runtime.sendMessage({
      action: 'checkLicense',
      licenseKey: license.licenseKey
    });
    if (result.valid) {
      isPro = true;
      tierBadge.textContent = '✨ Pro 会员';
      tierBadge.classList.add('pro');
      proBanner.classList.add('hidden');
    } else {
      showProBanner();
    }
  } else {
    showProBanner();
  }

  // 3. 读取上次使用的API Key状态
  const apiSettings = await chrome.storage.sync.get(['apiKey']);
  if (!apiSettings.apiKey) {
    // 没有配API Key，提示设置
    if (!inputText.value) {
      inputText.placeholder = '⚠️ 请先点击底部 ⚙️ 设置 配置 API Key\n\n然后粘贴或输入需要处理的文字...';
    }
  }

  updateWordCount();
});

// ====== 模式切换 ======
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentMode = btn.dataset.mode;
    updateModeButtons(currentMode);

    // 翻译模式显示语言选项
    if (currentMode === 'translate') {
      languageOption.classList.remove('hidden');
    } else {
      languageOption.classList.add('hidden');
    }
  });
});

function updateModeButtons(mode) {
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
}

// ====== 文本输入统计 ======
inputText.addEventListener('input', updateWordCount);
function updateWordCount() {
  const text = inputText.value.trim();
  wordCount.textContent = text ? `${text.length} 字` : '0 字';
}

// ====== 清空按钮 ======
clearBtn.addEventListener('click', () => {
  inputText.value = '';
  updateWordCount();
});
clearOutputBtn.addEventListener('click', () => {
  outputText.textContent = '';
  outputSection.classList.add('hidden');
});

// ====== 复制按钮 ======
copyBtn.addEventListener('click', async () => {
  const text = outputText.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    const orig = copyBtn.textContent;
    copyBtn.textContent = '✅';
    setTimeout(() => copyBtn.textContent = orig, 1500);
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
});

// ====== 生成主逻辑 ======
generateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) {
    inputText.placeholder = '⚠️ 请先输入或粘贴文字！';
    inputText.style.borderColor = '#ef4444';
    setTimeout(() => {
      inputText.style.borderColor = '';
      inputText.placeholder = '输入或粘贴需要处理的文字...';
    }, 2000);
    return;
  }

  // 检查API Key
  const settings = await chrome.storage.sync.get(['apiKey']);
  if (!settings.apiKey) {
    // 尝试打开选项页
    chrome.runtime.openOptionsPage();
    return;
  }

  // 检查Pro限制
  if (!isPro && text.length > 500) {
    proBanner.textContent = '⭐ 免费版限制500字。升级 Pro 可处理最多10000字！';
    proBanner.classList.remove('hidden');
    return;
  }

  // 开始生成
  setLoading(true);
  outputSection.classList.remove('hidden');
  outputText.textContent = '⏳ 正在生成中...';

  try {
    const templateFn = PROMPT_TEMPLATES[currentMode];
    const prompt = templateFn(text, toneOption.value);

    const result = await chrome.runtime.sendMessage({
      action: 'callAI',
      prompt: prompt,
      apiKey: settings.apiKey
    });

    if (result.success) {
      outputText.textContent = result.data;
    } else {
      outputText.textContent = `❌ 生成失败：${result.error}`;
    }
  } catch (err) {
    outputText.textContent = `❌ 出错：${err.message}`;
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  if (loading) {
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    generateBtn.disabled = true;
  } else {
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
    generateBtn.disabled = false;
  }
}

// ====== Pro 升级 ======
function showProBanner() {
  proBanner.classList.remove('hidden');
}
upgradeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.storage.sync.get(['storeUrl'], (result) => {
    const url = result.storeUrl || 'https://your-lemonsqueezy-store.com/checkout';
    chrome.tabs.create({ url });
  });
});

// ====== 设置页面 ======
settingsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
