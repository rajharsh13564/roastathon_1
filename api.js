// Gemini 2.5 Flash API Integration with Roasting System Prompt

// Note: GEMINI_API_KEY constant is initialized once, but getApiKey() function checks dynamically
// Priority: localStorage (Settings UI) > VITE_GEMINI_API_KEY (.env) > window.ROAST_CONFIG
const GEMINI_API_KEY = (() => {
  // First check localStorage (Settings UI - highest priority)
  const stored = localStorage.getItem('gemini_api_key');
  if (stored && stored.trim() !== '') {
    return stored;
  }
  
  // Then try Vite environment variable from .env file
  try {
    // Check if we're in a module context and import.meta is available
    if (typeof import.meta !== 'undefined' && 
        import.meta.env && 
        typeof import.meta.env === 'object' &&
        import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // import.meta not available or not accessible (not using Vite or opened as file://)
  }
  
  // Fallback to window.ROAST_CONFIG (set from localStorage in HTML)
  if (window.ROAST_CONFIG?.GEMINI_API_KEY) {
    return window.ROAST_CONFIG.GEMINI_API_KEY;
  }
  
  return '';
})();

const ROAST_STYLE = (() => {
  return window.ROAST_CONFIG?.ROAST_STYLE || localStorage.getItem('roast_style') || 'witty';
})();

/**
 * Get the roasting system prompt based on style
 */
function getRoastingSystemPrompt(style = ROAST_STYLE) {
  const stylePrompts = {
    witty: `You are a master of witty comebacks and sarcastic humor. Your job is to ROAST both the user's question AND the user themselves in a clever, witty way. Be sarcastic, sharp, and funny. Make fun of how they asked the question, the question's quality, and throw in some playful jabs at the user. Keep it entertaining and clever, not mean-spirited. Maximum 3-4 sentences.`,
    
    playful: `You are a playful roasting expert. Your mission is to playfully mock both the user's question and the user in a fun, lighthearted way. Make jokes about their question, question their intelligence playfully, and tease them in a friendly manner. Be creative with your roasts. Keep it fun and humorous. Maximum 3-4 sentences.`,
    
    savage: `You are the ultimate savage roaster. Destroy both the user's question quality AND the user themselves with brutal honesty wrapped in humor. Be savage but witty - no personal attacks, just clever burns about their question and them. This is a friendly roast battle, so keep it entertaining. Maximum 3-4 sentences.`,
    
    humorous: `You are a comedic roasting genius. Find the funniest way to roast both the user's question and the user themselves. Make people laugh while making fun of how they phrased their question, the question itself, and throw in some gentle jabs at the user. Be creative, funny, and entertaining. Maximum 3-4 sentences.`
  };

  return stylePrompts[style] || stylePrompts.witty;
}

/**
 * Generates a roasted response using Google Gemini 2.5 Flash API
 * @param {string} userMessage - The user's message to roast
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Promise<string>} - The roasted response
 */
async function generateRoast(userMessage, conversationHistory = []) {
  // Get API key dynamically (checks VITE_GEMINI_API_KEY first, then localStorage)
  const apiKey = getApiKey();
  
  if (!apiKey || apiKey === '') {
    throw new Error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY in .env file or in Settings.");
  }

  try {
    const systemPrompt = getRoastingSystemPrompt();
    
    // Build the conversation history for context
    const contents = [];
    
    // Add previous conversation history if available (before current message)
    if (conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }
      });
    }
    
    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    // Build request body with system instruction
    // Using systemInstruction field (preferred method for newer Gemini models)
    const requestBody = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Using Gemini 2.5 Flash - if this model name doesn't work, try:
    // - gemini-2.0-flash-exp (experimental)
    // - gemini-1.5-flash (stable)
    // - gemini-1.5-pro (more capable)
    const modelName = 'gemini-2.5-flash'; // Update if Gemini 2.5 Flash has a different model name
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `API Error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorBody);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        errorMessage += ` - ${errorBody}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Extract the response text
    const roast = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!roast) {
      // Check if response was blocked
      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error("Response was blocked due to safety settings. Try rephrasing your question.");
      }
      throw new Error("No response generated. Please try again.");
    }
    
    return roast;
  } catch (error) {
    console.error('Error generating roast:', error);
    throw error;
  }
}

// Update API key (stored in localStorage, overrides VITE_GEMINI_API_KEY from UI)
function updateApiKey(key) {
  localStorage.setItem('gemini_api_key', key);
  if (window.ROAST_CONFIG) {
    window.ROAST_CONFIG.GEMINI_API_KEY = key;
  }
}

// Get current API key (checks all sources)
// Priority: localStorage (Settings UI) > VITE_GEMINI_API_KEY (.env) > window.ROAST_CONFIG
function getApiKey() {
  // First check localStorage (Settings UI override - takes highest priority)
  const stored = localStorage.getItem('gemini_api_key');
  if (stored && stored.trim() !== '') {
    return stored;
  }
  
  // Then check Vite env var from .env file
  try {
    // Check if we're in a module context and import.meta is available
    if (typeof import.meta !== 'undefined' && 
        import.meta.env && 
        typeof import.meta.env === 'object' &&
        import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // import.meta not available or not accessible (not using Vite or opened as file://)
  }
  
  // Check window config (fallback)
  if (window.ROAST_CONFIG?.GEMINI_API_KEY) {
    return window.ROAST_CONFIG.GEMINI_API_KEY;
  }
  
  return '';
}

function updateRoastStyle(style) {
  localStorage.setItem('roast_style', style);
  window.ROAST_CONFIG.ROAST_STYLE = style;
}

// Export for use in main.js
window.RoastAPI = {
  generateRoast,
  updateApiKey,
  updateRoastStyle,
  getRoastingSystemPrompt,
  getApiKey
};

export { generateRoast, updateApiKey, updateRoastStyle, getApiKey };