// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  const chatHistory = document.getElementById('chatHistory');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const inputForm = document.getElementById('inputForm');

  // Helpers
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  const escapeHtml = (s) =>
    String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  function ensureEmptyStateRemoved() {
    const empty = chatHistory.querySelector('.empty');
    if (empty) empty.remove();
  }

  function pushEmptyState() {
    if (!chatHistory.querySelector('.empty') && chatHistory.children.length === 0) {
      const node = el('div', 'empty', 'Say hi — the roast bot is waiting.');
      chatHistory.appendChild(node);
    }
  }

  function appendMessage(who, text, opts = {}) {
    ensureEmptyStateRemoved();
    const row = el('div', `chat-message ${who === 'user' ? 'user-message' : 'bot-message'}`);
    const avatar = el('div', `avatar ${who === 'user' ? 'user' : 'bot'}`, who === 'user' ? 'U' : 'R');
    const bubble = el('div', 'bubble', opts.html ? text : escapeHtml(text));
    if (opts.smallMeta) {
      const meta = el('span', 'msg-meta', escapeHtml(opts.smallMeta));
      bubble.appendChild(meta);
    }
    if (who === 'user') {
      row.appendChild(bubble);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubble);
    }
    chatHistory.appendChild(row);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return row;
  }

  function showTyping() {
    ensureEmptyStateRemoved();
    const row = el('div', 'chat-message bot-message');
    const avatar = el('div', 'avatar bot', 'R');
    const bubble = el('div', 'bubble typing');
    bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    row.appendChild(avatar);
    row.appendChild(bubble);
    chatHistory.appendChild(row);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return row;
  }

  async function callRoastAPI(prompt) {
    if (window.RoastAPI && typeof window.RoastAPI.generateRoast === 'function') {
      return await window.RoastAPI.generateRoast(prompt);
    }
    // clear guidance if API missing
    throw new Error('Roast API unavailable. Ensure src/js/api.js is loaded and exposes window.RoastAPI.generateRoast.');
  }

  async function sendMessage(rawText) {
    const text = rawText?.trim();
    if (!text) return;
    appendMessage('user', text);
    messageInput.value = '';
    messageInput.disabled = true;
    sendBtn.disabled = true;

    const typingNode = showTyping();
    try {
      const reply = await callRoastAPI(text);
      typingNode.remove();
      appendMessage('bot', reply || 'Hmm, I have nothing to say.');
    } catch (err) {
      typingNode.remove();
      appendMessage('bot', `Error: ${err?.message || String(err)}`);
    } finally {
      messageInput.disabled = false;
      sendBtn.disabled = false;
      messageInput.focus();
      if (chatHistory.children.length === 0) pushEmptyState();
    }
  }

  // Events
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(messageInput.value);
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  clearBtn.addEventListener('click', () => {
    chatHistory.innerHTML = '';
    pushEmptyState();
    messageInput.focus();
  });

  // Initial UI state
  pushEmptyState();

  // Accessibility: focus input on load
  messageInput.focus();

  // Optional: Ctrl+K to focus input
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      messageInput.focus();
      messageInput.select();
    }
  });
});
// ...existing code...