// Main application logic for ChatGPT-like interface

let currentConversationId = null;
let conversations = [];
let conversationMessages = new Map(); // Map of conversationId -> messages array

// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const newChatBtn = document.getElementById('newChatBtn');
const conversationsList = document.getElementById('conversationsList');
const chatTitle = document.getElementById('chatTitle');
const editChatBtn = document.getElementById('editChatBtn');
const chatMessages = document.getElementById('chatMessages');
const emptyState = document.getElementById('emptyState');
const inputForm = document.getElementById('inputForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const roastStyleSelect = document.getElementById('roastStyleSelect');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadConversations();
  setupEventListeners();
  updateSendButton();
  
  // Load API key if available (from localStorage - VITE_GEMINI_API_KEY takes precedence)
  const savedApiKey = localStorage.getItem('gemini_api_key');
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
    if (window.RoastAPI) {
      window.RoastAPI.updateApiKey(savedApiKey);
    }
  } else if (window.RoastAPI && window.RoastAPI.getApiKey) {
    // Check if VITE_GEMINI_API_KEY is set from .env file
    const envApiKey = window.RoastAPI.getApiKey();
    if (envApiKey) {
      apiKeyInput.placeholder = 'API key loaded from .env file (VITE_GEMINI_API_KEY)';
    }
  }
  
  // Load roast style
  const savedStyle = localStorage.getItem('roast_style') || 'witty';
  roastStyleSelect.value = savedStyle;
  
  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
    updateSendButton();
  });
  
  // Initialize with a new conversation if none exists
  if (conversations.length === 0 && !currentConversationId) {
    createNewConversation();
  }
  
  // Focus input
  messageInput.focus();
});

// Load conversations from localStorage
function loadConversations() {
  const saved = localStorage.getItem('conversations');
  if (saved) {
    conversations = JSON.parse(saved);
    conversations.forEach(conv => {
      const messages = localStorage.getItem(`conversation_${conv.id}_messages`);
      if (messages) {
        conversationMessages.set(conv.id, JSON.parse(messages));
      }
    });
    renderConversationsList();
  }
}

// Save conversations to localStorage
function saveConversations() {
  localStorage.setItem('conversations', JSON.stringify(conversations));
  conversationMessages.forEach((messages, id) => {
    localStorage.setItem(`conversation_${id}_messages`, JSON.stringify(messages));
  });
}

// Create new conversation
function createNewConversation() {
  const id = Date.now().toString();
  const conversation = {
    id,
    title: 'New Chat',
    createdAt: new Date().toISOString()
  };
  
  conversations.unshift(conversation);
  conversationMessages.set(id, []);
  currentConversationId = id;
  
  chatTitle.textContent = conversation.title;
  chatMessages.innerHTML = '';
  emptyState.classList.remove('hidden');
  
  saveConversations();
  renderConversationsList();
  messageInput.focus();
}

// Render conversations list in sidebar
function renderConversationsList() {
  conversationsList.innerHTML = '';
  
  conversations.forEach(conv => {
    const item = document.createElement('div');
    item.className = `conversation-item ${conv.id === currentConversationId ? 'active' : ''}`;
    
    item.innerHTML = `
      <span class="conversation-item-title">${escapeHtml(conv.title)}</span>
      <div class="conversation-item-actions">
        <button class="conversation-action-btn delete-conversation" data-id="${conv.id}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6h8M6 6v6M10 6v6M5.5 6l.5-2h4l.5 2M7 8.5h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;
    
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.conversation-action-btn')) {
        loadConversation(conv.id);
      }
    });
    
    const deleteBtn = item.querySelector('.delete-conversation');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteConversation(conv.id);
    });
    
    conversationsList.appendChild(item);
  });
}

// Load a conversation
function loadConversation(id) {
  currentConversationId = id;
  const conversation = conversations.find(c => c.id === id);
  
  if (conversation) {
    chatTitle.textContent = conversation.title;
    
    const messages = conversationMessages.get(id) || [];
    renderMessages(messages);
    
    saveConversations();
    renderConversationsList();
  }
}

// Delete a conversation
function deleteConversation(id) {
  conversations = conversations.filter(c => c.id !== id);
  conversationMessages.delete(id);
  localStorage.removeItem(`conversation_${id}_messages`);
  
  if (currentConversationId === id) {
    if (conversations.length > 0) {
      loadConversation(conversations[0].id);
    } else {
      createNewConversation();
    }
  }
  
  saveConversations();
  renderConversationsList();
}

// Render messages
function renderMessages(messages) {
  chatMessages.innerHTML = '';
  
  if (messages.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  messages.forEach(msg => {
    addMessageToUI(msg.role, msg.content, false);
  });
  
  scrollToBottom();
}

// Add message to UI
function addMessageToUI(role, content, animate = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? 'U' : 'R';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  textDiv.textContent = content;
  
  contentDiv.appendChild(textDiv);
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  
  if (animate) {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
  }
  
  chatMessages.appendChild(messageDiv);
  emptyState.classList.add('hidden');
  
  if (animate) {
    requestAnimationFrame(() => {
      messageDiv.style.transition = 'opacity 0.3s, transform 0.3s';
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateY(0)';
    });
  }
  
  scrollToBottom();
  return messageDiv;
}

// Show typing indicator
function showTypingIndicator() {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant';
  messageDiv.id = 'typing-indicator';
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = 'R';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  
  contentDiv.appendChild(typingDiv);
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  
  chatMessages.appendChild(messageDiv);
  emptyState.classList.add('hidden');
  scrollToBottom();
  
  return messageDiv;
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Scroll to bottom
function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Send message
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !window.RoastAPI) return;
  
  // Create new conversation if none exists
  if (!currentConversationId) {
    createNewConversation();
  }
  
  // Add user message
  addMessageToUI('user', text);
  
  // Save user message
  const messages = conversationMessages.get(currentConversationId) || [];
  messages.push({ role: 'user', content: text });
  conversationMessages.set(currentConversationId, messages);
  
  // Update conversation title if it's still "New Chat"
  if (messages.length === 1) {
    const title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (conversation) {
      conversation.title = title;
      chatTitle.textContent = title;
      saveConversations();
      renderConversationsList();
    }
  }
  
  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';
  updateSendButton();
  
  // Disable input
  messageInput.disabled = true;
  sendBtn.disabled = true;
  
  // Show typing indicator
  const typingIndicator = showTypingIndicator();
  
  try {
    // Get conversation history (last 10 messages for context)
    const recentHistory = messages.slice(-10);
    
    // Generate roast
    const response = await window.RoastAPI.generateRoast(text, recentHistory);
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add assistant message
    addMessageToUI('assistant', response);
    
    // Save assistant message
    messages.push({ role: 'assistant', content: response });
    conversationMessages.set(currentConversationId, messages);
    saveConversations();
  } catch (error) {
    removeTypingIndicator();
    const errorMsg = `Error: ${error.message}`;
    addMessageToUI('assistant', errorMsg);
  } finally {
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Update send button state
function updateSendButton() {
  sendBtn.disabled = !messageInput.value.trim();
}

// Setup event listeners
function setupEventListeners() {
  // Menu toggle (mobile)
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
  
  // New chat
  newChatBtn.addEventListener('click', () => {
    createNewConversation();
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('active');
    }
  });
  
  // Input form
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
  });
  
  // Shift+Enter for new line, Enter to send
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.value.trim()) {
        sendMessage();
      }
    }
  });
  
  // Settings
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
  });
  
  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });
  
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('active');
    }
  });
  
  // Save settings
  saveSettingsBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const roastStyle = roastStyleSelect.value;
    
    if (window.RoastAPI) {
      if (apiKey) {
        window.RoastAPI.updateApiKey(apiKey);
      }
      window.RoastAPI.updateRoastStyle(roastStyle);
    }
    
    settingsModal.classList.remove('active');
    
    // Show success message
    alert('Settings saved!');
  });
  
  // Help button
  helpBtn.addEventListener('click', () => {
    alert('Roastathon - AI Roasting Chat\n\nThis app uses Gemini 2.5 Flash to roast your questions and you!\n\nSet your API key in Settings to get started.');
  });
  
  // Edit chat title (future feature)
  editChatBtn.addEventListener('click', () => {
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (conversation) {
      const newTitle = prompt('Enter new chat title:', conversation.title);
      if (newTitle && newTitle.trim()) {
        conversation.title = newTitle.trim();
        chatTitle.textContent = conversation.title;
        saveConversations();
        renderConversationsList();
      }
    }
  });
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}