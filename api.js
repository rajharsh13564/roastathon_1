// Client-side Gemini API wrapper (using Vite env vars or window.ROAST_CONFIG)

const GEMINI_API_KEY = (() => {
  // Try Vite env first
  try {
    if (import.meta?.env?.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // import.meta not available
  }
  // Fallback to window.ROAST_CONFIG
  return window.ROAST_CONFIG?.GEMINI_API_KEY || null;
})();

const ROASTING_STYLES = [
  "sarcastic and witty",
  "playfully mocking",
  "with clever wordplay",
  "in a deadpan, unimpressed tone",
  "like a snarky best friend",
  "with exaggerated shock",
  "using ironic comparisons",
  "like a bored genius",
  "with backhanded compliments",
  "like a disappointed teacher"
];

function getRandomRoastStyle() {
  return ROASTING_STYLES[Math.floor(Math.random() * ROASTING_STYLES.length)];
}

/**
 * Generates a roasted response using Google Gemini API
 * @param {string} userMessage - The user's message to roast
 * @returns {Promise<string>} - The roasted response
 */
async function generateRoast(userMessage) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key missing. Set VITE_GEMINI_API_KEY in .env or inject window.ROAST_CONFIG in HTML.");
  }

  try {
    const roastStyle = getRandomRoastStyle();

    const prompt = `You are a master of comebacks with a sharp wit.
Respond to the user's message with a ${roastStyle} roast.
Do NOT use hateful, violent, sexual, or discriminatory language.
Keep it under 3 sentences and reference parts of the user's message when possible.

User's message: "${userMessage}"`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      config: { temperature: 0.9 }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to generate roast: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const roast = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return roast || "Oh please, give me something more interesting to work with than that!";
  } catch (error) {
    console.error('Error generating roast:', error);
    throw error;
  }
}

window.RoastAPI = {
  generateRoast
};

export { generateRoast };