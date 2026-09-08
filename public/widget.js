(function () {
  var scriptTag = document.currentScript;
  var chatbotId = scriptTag.getAttribute('data-chatbot-id');
  if (!chatbotId) {
    console.error('Ceyra widget: missing data-chatbot-id attribute.');
    return;
  }

  var API_BASE = 'https://assist.ceyra.ai';
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

  // --- Inject styles ---
  var style = document.createElement('style');
  style.textContent = `
    .ceyra-bubble { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
      border-radius: 50%; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center; z-index: 999999;
      transition: transform 0.2s ease; border: none; }
    .ceyra-bubble:hover { transform: scale(1.08); }
    .ceyra-bubble svg { width: 26px; height: 26px; }
    .ceyra-window { position: fixed; bottom: 90px; right: 20px; width: 340px; max-width: calc(100vw - 40px);
      height: 480px; max-height: calc(100vh - 120px); background: #0E0E12; border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.35); display: none; flex-direction: column;
      overflow: hidden; z-index: 999999; font-family: -apple-system, sans-serif; }
    .ceyra-window.open { display: flex; }
    .ceyra-header { padding: 14px; color: #fff; display: flex; align-items: center; gap: 10px; }
    .ceyra-header img, .ceyra-header .ceyra-avatar-fallback { width: 32px; height: 32px; border-radius: 8px;
      object-fit: cover; background: rgba(255,255,255,0.2); }
    .ceyra-header-text { font-size: 13px; font-weight: 700; }
    .ceyra-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px;
      background: #0A0A0B; }
    .ceyra-msg { max-width: 80%; padding: 9px 12px; border-radius: 14px; font-size: 13px; line-height: 1.4; }
    .ceyra-msg.bot { background: rgba(255,255,255,0.06); color: #e5e5e5; align-self: flex-start; border-bottom-left-radius: 4px; }
    .ceyra-msg.user { color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .ceyra-input-row { display: flex; gap: 8px; padding: 10px; background: #0E0E12; border-top: 1px solid rgba(255,255,255,0.08); }
    .ceyra-input { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 8px 10px; color: #fff; font-size: 13px; outline: none; }
    .ceyra-send { border: none; border-radius: 10px; width: 34px; height: 34px; color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ceyra-typing { display: flex; gap: 3px; padding: 8px 12px; align-self: flex-start; }
    .ceyra-typing span { width: 5px; height: 5px; border-radius: 50%; background: #8B5CF6; animation: ceyra-bounce 1s infinite; }
    .ceyra-typing span:nth-child(2) { animation-delay: 0.15s; }
    .ceyra-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes ceyra-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
    .ceyra-unavailable { padding: 16px; color: #999; font-size: 12px; text-align: center; }
  `;
  document.head.appendChild(style);

  // --- Build DOM ---
  var bubble = document.createElement('button');
  bubble.className = 'ceyra-bubble';
  bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

  var win = document.createElement('div');
  win.className = 'ceyra-window';

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  function renderUnavailable() {
    win.innerHTML = '<div class="ceyra-unavailable">Chat is currently unavailable.</div>';
  }

  function renderWindow() {
    var color = config.primaryColor;
    var avatarHtml = config.avatarUrl
      ? '<img src="' + config.avatarUrl + '" alt="" />'
      : '<div class="ceyra-avatar-fallback"></div>';

    win.innerHTML =
      '<div class="ceyra-header" style="background:' + color + '">' +
        avatarHtml +
        '<div class="ceyra-header-text">' + config.name + '</div>' +
      '</div>' +
      '<div class="ceyra-body" id="ceyra-body">' +
        '<div class="ceyra-msg bot">' + config.welcomeMessage + '</div>' +
      '</div>' +
      '<div class="ceyra-input-row">' +
        '<input class="ceyra-input" id="ceyra-input" type="text" placeholder="Type a message..." />' +
        '<button class="ceyra-send" id="ceyra-send" style="background:' + color + '">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>' +
        '</button>' +
      '</div>';

    var input = document.getElementById('ceyra-input');
    var sendBtn = document.getElementById('ceyra-send');

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
          appendMessage(data.reply || 'Sorry, something went wrong.', 'bot', color);
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
  }

  function appendMessage(text, sender, color) {
    var body = document.getElementById('ceyra-body');
    var el = document.createElement('div');
    el.className = 'ceyra-msg ' + sender;
    if (sender === 'user') el.style.background = color;
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

  bubble.addEventListener('click', function () {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);

    if (isOpen && !isConfigured) {
      fetch(API_BASE + '/api/widget-config?chatbotId=' + encodeURIComponent(chatbotId))
        .then(function (r) {
          if (!r.ok) throw new Error('config fetch failed');
          return r.json();
        })
        .then(function (data) {
          config = data;
          isConfigured = true;
          renderWindow();
        })
        .catch(function () {
          renderUnavailable();
        });
    }
  });
})();
