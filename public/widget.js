(function () {
  var scriptTag = document.currentScript;
  var chatbotId = scriptTag.getAttribute('data-chatbot-id');
  if (!chatbotId) {
    console.error('Ceyra widget: missing data-chatbot-id attribute.');
    return;
  }

  var API_BASE = 'https://ceyra-assist.vercel.app';
  var storageKeyVisitor = 'ceyra_visitor_' + chatbotId;
  var storageKeyConvo = 'ceyra_convo_' + chatbotId;

  function getOrCreateVisitorId() {
    var id = localStorage.getItem(storageKeyVisitor);
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(storageKeyVisitor, id);
    }
    return id;
  }

  var visitorId = getOrCreateVisitorId();
  var conversationId = localStorage.getItem(storageKeyConvo) || null;
  var config = null;
  var isOpen = false;
  var isConfigured = false; // becomes true once config successfully loads

  // --- Colour helpers: keep text readable on any brand colour ---
  function hexToRgb(hex) {
    var h = (hex || '').replace('#', '');
    if (h.length === 3) {
      h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    }
    var n = parseInt(h.slice(0, 6), 16);
    if (isNaN(n)) n = 0x8b5cf6;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function isLightColor(hex) {
    var c = hexToRgb(hex);
    return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255 > 0.62;
  }
  function contrastText(hex) {
    return isLightColor(hex) ? '#16161d' : '#ffffff';
  }
  function shade(hex, percent) {
    var c = hexToRgb(hex);
    var t = percent < 0 ? 0 : 255;
    var p = Math.abs(percent) / 100;
    var r = Math.round((t - c.r) * p + c.r);
    var g = Math.round((t - c.g) * p + c.g);
    var b = Math.round((t - c.b) * p + c.b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>';

  // --- Inject styles ---
  var style = document.createElement('style');
  style.textContent = `
    .ceyra-widget, .ceyra-widget * { box-sizing: border-box; }

    .ceyra-bubble { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
      border-radius: 50%; cursor: pointer; border: none; color: #fff;
      display: flex; align-items: center; justify-content: center; z-index: 999999;
      box-shadow: 0 6px 22px rgba(0,0,0,0.30);
      transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .ceyra-bubble:hover { transform: scale(1.07); box-shadow: 0 9px 28px rgba(0,0,0,0.35); }
    .ceyra-bubble:active { transform: scale(0.97); }
    .ceyra-bubble svg { width: 24px; height: 24px; }

    .ceyra-window { position: fixed; bottom: 90px; right: 20px; width: 370px; max-width: calc(100vw - 32px);
      height: 520px; max-height: calc(100vh - 110px); border-radius: 18px; overflow: hidden;
      display: none; flex-direction: column; z-index: 999999;
      border: 1px solid var(--ceyra-border); background: var(--ceyra-bg);
      backdrop-filter: blur(20px) saturate(1.6);
      -webkit-backdrop-filter: blur(20px) saturate(1.6);
      box-shadow: 0 18px 50px rgba(0,0,0,0.30);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      transform-origin: bottom right; animation: ceyra-pop 0.18s ease-out;
      overscroll-behavior: contain; }
    .ceyra-window.open { display: flex; }
    @keyframes ceyra-pop { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: none; } }

    /* Light theme — lighter frosted glass; the host site softly shows through */
    .ceyra-window { --ceyra-bg: rgba(255,255,255,0.84); --ceyra-border: rgba(17,17,26,0.08);
      --ceyra-text: #17171f;
      --ceyra-bot-text: #26262e;
      --ceyra-input-bg: rgba(255,255,255,0.72); --ceyra-input-border: rgba(17,17,26,0.10);
      --ceyra-muted: #6d6d7a; }
    /* Dark theme — follows visitors (and dark host sites) automatically */
    @media (prefers-color-scheme: dark) {
      .ceyra-window { --ceyra-bg: rgba(26,26,34,0.82); --ceyra-border: rgba(255,255,255,0.09);
        --ceyra-text: #f1f1f5;
        --ceyra-bot-text: #e9e9ef;
        --ceyra-input-bg: rgba(255,255,255,0.08); --ceyra-input-border: rgba(255,255,255,0.13);
        --ceyra-muted: #9c9caa; }
    }
    /* Browsers without backdrop-filter fall back to a near-solid surface */
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      .ceyra-window { --ceyra-bg: rgba(255,255,255,0.97); }
      @media (prefers-color-scheme: dark) {
        .ceyra-window { --ceyra-bg: rgba(15,15,20,0.97); }
      }
    }

    .ceyra-header { padding: 13px 14px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .ceyra-header img, .ceyra-header .ceyra-avatar-fallback { width: 38px; height: 38px; border-radius: 11px;
      object-fit: cover; background: rgba(255,255,255,0.25); flex-shrink: 0; }
    .ceyra-avatar-fallback { display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; color: #fff; }
    .ceyra-header-meta { flex: 1; min-width: 0; }
    .ceyra-header-name { font-size: 13.5px; font-weight: 700; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ceyra-header-status { font-size: 11px; opacity: 0.9; display: flex; align-items: center; gap: 5px; margin-top: 1px; }
    .ceyra-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80;
      box-shadow: 0 0 0 3px rgba(74,222,128,0.22); flex-shrink: 0; }
    .ceyra-close { border: none; width: 27px; height: 27px; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      background: rgba(255,255,255,0.18); color: inherit; transition: background 0.15s ease; }
    .ceyra-close:hover { background: rgba(255,255,255,0.32); }
    .ceyra-close svg { width: 12px; height: 12px; }
    .ceyra-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
      background: transparent; overscroll-behavior: contain;
      scrollbar-width: thin; scrollbar-color: rgba(130,130,150,0.45) transparent; }
    .ceyra-body::-webkit-scrollbar { width: 6px; }
    .ceyra-body::-webkit-scrollbar-track { background: transparent; }
    .ceyra-body::-webkit-scrollbar-thumb { background: rgba(130,130,150,0.45); border-radius: 999px; }
    .ceyra-body::-webkit-scrollbar-thumb:hover { background: rgba(130,130,150,0.7); }
    .ceyra-msg { max-width: 82%; font-size: 13px; line-height: 1.5;
      word-wrap: break-word; white-space: pre-wrap; }
    /* Bot replies: transparent, clean — no bubble chrome, brand-tinted label only */
    .ceyra-msg.bot { background: transparent; color: var(--ceyra-bot-text); align-self: flex-start; padding: 2px 2px; }
    .ceyra-msg.user { background: var(--ceyra-brand, #8B5CF6); color: var(--ceyra-on-brand, #ffffff);
      padding: 9px 12px; border-radius: 14px; align-self: flex-end; border-bottom-right-radius: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.14); }

    .ceyra-input-row { display: flex; gap: 8px; padding: 10px; background: var(--ceyra-input-bg);
      border-top: 1px solid var(--ceyra-border); flex-shrink: 0; }
    .ceyra-input { flex: 1; background: var(--ceyra-input-bg); border: 1px solid var(--ceyra-input-border);
      border-radius: 10px; padding: 9px 11px; color: var(--ceyra-text); font-size: 13px; outline: none;
      transition: border-color 0.15s ease; }
    .ceyra-input::placeholder { color: var(--ceyra-muted); }
    .ceyra-input:focus { border-color: var(--ceyra-brand, #8B5CF6); }
    .ceyra-send { border: none; border-radius: 10px; width: 36px; height: 36px; color: var(--ceyra-on-brand, #fff); cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: filter 0.15s ease, transform 0.1s ease; }
    .ceyra-send svg { width: 16px; height: 16px; }
    .ceyra-send:hover { filter: brightness(1.1); }
    .ceyra-send:active { transform: scale(0.95); }

    .ceyra-typing { display: flex; gap: 3px; padding: 11px 13px; align-self: flex-start;
      background: var(--ceyra-input-bg); border: 1px solid var(--ceyra-border);
      border-radius: 14px; border-bottom-left-radius: 5px; }
    .ceyra-typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--ceyra-brand, #8B5CF6); animation: ceyra-bounce 1s infinite; }
    .ceyra-typing span:nth-child(2) { animation-delay: 0.15s; }
    .ceyra-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes ceyra-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

    .ceyra-footer { padding: 6px 12px 9px; text-align: center; background: transparent;
      border-top: 1px solid var(--ceyra-border); flex-shrink: 0; }
    .ceyra-footer a { font-size: 10px; font-weight: 600; letter-spacing: 0.02em;
      color: var(--ceyra-muted); text-decoration: none; }
    .ceyra-footer a:hover { color: var(--ceyra-brand, #8B5CF6); }

    .ceyra-unavailable { padding: 24px 16px; color: var(--ceyra-muted); font-size: 12.5px;
      text-align: center; line-height: 1.6; }
  `;
  document.head.appendChild(style);

  // --- Build DOM ---
  var bubble = document.createElement('button');
  bubble.className = 'ceyra-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = ICON_CHAT;
  bubble.style.background = 'linear-gradient(135deg, #8B5CF6, #7C3AED)'; // recoloured once config loads

  var win = document.createElement('div');
  win.className = 'ceyra-window';

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  function renderUnavailable() {
    win.innerHTML = '<div class="ceyra-unavailable">Chat is currently unavailable.<br/>Please try again later.</div>';
  }

  // --- Config caching + branding ---
  var CONFIG_CACHE_KEY = 'ceyra_cfg_' + chatbotId;
  var CONFIG_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  function cachedConfig() {
    try {
      var raw = localStorage.getItem(CONFIG_CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed._ts && Date.now() - parsed._ts < CONFIG_CACHE_TTL && parsed.name) {
        return parsed;
      }
    } catch (e) {
      /* corrupted cache — ignore */
    }
    return null;
  }

  function cacheConfig(cfg) {
    try {
      localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(Object.assign({}, cfg, { _ts: Date.now() })));
    } catch (e) {
      /* storage full/unavailable — caching is best-effort */
    }
  }

  // Applies the user's selected brand colour to the bubble instantly.
  function applyBrand() {
    if (!config) return;
    var color = /^#[0-9a-fA-F]{3,8}$/.test(config.primaryColor || '') ? config.primaryColor : '#8B5CF6';
    bubble.style.background = 'linear-gradient(135deg,' + color + ',' + shade(color, -18) + ')';
    bubble.style.color = contrastText(color);
  }

  function fetchConfig() {
    // Serve from the cache first so the bubble is on-brand immediately
    var cached = cachedConfig();
    if (cached && !isConfigured) {
      config = cached;
      isConfigured = true;
      applyBrand();
      if (isOpen) renderWindow();
    }
    if (cached && isConfigured) return Promise.resolve();

    return fetch(API_BASE + '/api/widget-config?chatbotId=' + encodeURIComponent(chatbotId))
      .then(function (r) {
        if (!r.ok) throw new Error('config fetch failed');
        return r.json();
      })
      .then(function (data) {
        config = data;
        isConfigured = true;
        cacheConfig(data);
        applyBrand();
        if (isOpen) renderWindow();
      })
      .catch(function () {
        if (!config) renderUnavailable();
      });
  }

  function renderWindow() {
    var color = /^#[0-9a-fA-F]{3,8}$/.test(config.primaryColor || '') ? config.primaryColor : '#8B5CF6';
    var onBrand = contrastText(color);
    var initials = String(config.name || 'AI')
      .split(/\s+/)
      .slice(0, 2)
      .map(function (w) { return w.charAt(0); })
      .join('')
      .toUpperCase();
    var avatarHtml = config.avatarUrl
      ? '<img src="' + escapeHtml(config.avatarUrl) + '" alt="" />'
      : '<div class="ceyra-avatar-fallback">' + escapeHtml(initials) + '</div>';

    win.innerHTML =
      '<div class="ceyra-header" style="background:linear-gradient(135deg,' + color + ',' + shade(color, -18) + ');color:' + onBrand + '">' +
        avatarHtml +
        '<div class="ceyra-header-meta">' +
          '<div class="ceyra-header-name">' + escapeHtml(config.name) + '</div>' +
          '<div class="ceyra-header-status"><span class="ceyra-status-dot"></span>Online now</div>' +
        '</div>' +
        '<button class="ceyra-close" id="ceyra-close" title="Close chat">' + ICON_CLOSE + '</button>' +
      '</div>' +
      '<div class="ceyra-body" id="ceyra-body">' +
        '<div class="ceyra-msg bot">' + escapeHtml(config.welcomeMessage) + '</div>' +
      '</div>' +
      '<div class="ceyra-input-row">' +
        '<input class="ceyra-input" id="ceyra-input" type="text" placeholder="Type a message..." />' +
        '<button class="ceyra-send" id="ceyra-send" style="background:' + color + '" title="Send">' + ICON_SEND + '</button>' +
      '</div>' +
      '<div class="ceyra-footer"><a href="https://ceyra.ai" target="_blank" rel="noopener">Powered by Ceyra AI</a></div>';

    // Apply the brand colour across bubble + window accents
    win.style.setProperty('--ceyra-brand', color);
    bubble.style.background = 'linear-gradient(135deg,' + color + ',' + shade(color, -18) + ')';
    bubble.style.color = onBrand;

    var input = document.getElementById('ceyra-input');
    var sendBtn = document.getElementById('ceyra-send');
    var closeBtn = document.getElementById('ceyra-close');

    function send() {
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      appendMessage(text, 'user', color);
      showTyping();

      fetch(API_BASE + '/api/widget-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: chatbotId,
          message: text,
          conversationId: conversationId,
          visitorId: visitorId,
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          hideTyping();
          if (data.conversationId && data.conversationId !== conversationId) {
            conversationId = data.conversationId;
            localStorage.setItem(storageKeyConvo, conversationId);
          }
          appendMessage(data.reply || data.error || 'Sorry, something went wrong.', 'bot', color);
        })
        .catch(function () {
          hideTyping();
          appendMessage('Sorry, having trouble connecting. Please try again.', 'bot', color);
        });
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') send();
    });
    closeBtn.addEventListener('click', toggleWindow);
    setTimeout(function () { input.focus(); }, 60);
  }

  function appendMessage(text, sender, color) {
    var body = document.getElementById('ceyra-body');
    var el = document.createElement('div');
    el.className = 'ceyra-msg ' + sender;
    if (sender === 'user') {
      el.style.background = color;
      el.style.color = contrastText(color);
    }
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var body = document.getElementById('ceyra-body');
    var el = document.createElement('div');
    el.className = 'ceyra-typing';
    el.id = 'ceyra-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('ceyra-typing-indicator');
    if (el) el.remove();
  }

  function toggleWindow() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    bubble.innerHTML = isOpen ? ICON_CLOSE : ICON_CHAT;

    // Only (re)render when the window body isn't built yet — reopening must
    // preserve the visitor's chat history.
    if (isOpen && !win.querySelector('.ceyra-body')) {
      if (isConfigured) {
        renderWindow();
      } else {
        fetchConfig(); // renders the window when the config arrives
      }
    }
  }

  bubble.addEventListener('click', toggleWindow);

  // Preload branding on page load so the bubble shows the user's selected
  // colour immediately (cached for 10 minutes to avoid repeat requests).
  fetchConfig();

  // Close with Escape — handy when the widget overlaps host content
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) toggleWindow();
  });
})();
