# Roastathon - ChatGPT-like Interface with Gemini 2.5 Flash

A ChatGPT-like web interface that uses Google's Gemini 2.5 Flash API to roast users and their questions with witty, sarcastic, and humorous responses.

## Features

- **ChatGPT-like Interface**: Complete sidebar with conversation history, settings, and modern UI
- **Gemini 2.5 Flash Integration**: Powered by Google's latest Gemini model
- **Roasting System Prompt**: AI roasts both your questions and you in a fun, entertaining way
- **Multiple Roasting Styles**: Choose from Witty, Playful, Savage, or Humorous styles
- **Conversation Management**: Create, save, and manage multiple conversations
- **Local Storage**: All conversations and settings are saved locally in your browser
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
roastathon_1/
├── index.html      # Main HTML structure with ChatGPT-like interface
├── styles.css      # Complete styling matching ChatGPT's design
├── main.js         # Application logic for chat, conversations, and UI
├── api.js          # Gemini 2.5 Flash API integration with roasting prompts
├── package.json    # Project dependencies
└── README.md       # This file
```

## Setup Instructions

1. **Install Dependencies** (if using Vite)
   ```bash
   npm install
   ```

2. **Get Your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the API key

3. **Configure the API Key**

   **Option A: Using .env file (Recommended for Vite)**
   - Create a `.env` file in the root directory
   - Add your API key:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - The API key will be automatically loaded when you run the app
   - **Important**: Never commit your `.env` file to version control!

   **Option B: Using Settings UI**
   - Click the "Settings" button in the sidebar
   - Paste your Gemini API key in the input field
   - Select your preferred roasting style
   - Click "Save"
   - Note: Settings UI key takes precedence over .env file if both are set

4. **Run the Project**

   **Using Vite (Recommended)**
   ```bash
   npm start
   # or
   npm run dev
   ```
   Then open the URL shown in the terminal (usually `http://localhost:5173`)

   **Or open directly in browser**
   - Simply open `index.html` in a modern web browser
   - Note: .env file won't work when opening HTML directly - use Settings UI instead

5. **Start Chatting**
   - Click "New chat" to start a conversation
   - Type your message and press Enter or click Send
   - Watch as the AI roasts your question and you!

## Usage

- **New Chat**: Click the "New chat" button to start a fresh conversation
- **Conversation History**: Previous conversations appear in the sidebar
- **Delete Conversations**: Hover over a conversation and click the delete icon
- **Edit Chat Title**: Click the edit icon in the chat header
- **Settings**: Click the settings icon in the sidebar to manage your API key and roasting style
- **Mobile Menu**: On mobile devices, use the hamburger menu to toggle the sidebar

## Roasting Styles

1. **Witty**: Sarcastic and clever comebacks with sharp humor
2. **Playful**: Lighthearted mocking in a fun, friendly way
3. **Savage**: Brutally honest roasts wrapped in humor
4. **Humorous**: Comedy-focused roasting that makes people laugh

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks required)
- **Backend**: Direct API calls to Google Gemini API from the browser
- **Storage**: Uses browser localStorage for conversations and settings
- **API Model**: Gemini 2.0 Flash Experimental (configurable in `api.js`)
- **System Prompt**: Configured to roast both questions and users in an entertaining way

## API Model Configuration

The default model is set to `gemini-2.0-flash-exp`. If you need to use a different model, edit `api.js` and change the `modelName` variable:

```javascript
const modelName = 'gemini-2.0-flash-exp'; // Change this to your preferred model
```

Available models:
- `gemini-2.0-flash-exp` (experimental, latest)
- `gemini-1.5-flash` (stable, fast)
- `gemini-1.5-pro` (more capable, slower)

## System Prompt

The system prompt is configured to roast both the user's question quality and the user themselves. It's designed to be entertaining and humorous while remaining respectful. You can customize the roasting styles in `api.js` in the `getRoastingSystemPrompt()` function.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

## Privacy & Security

- All API keys are stored locally in your browser's localStorage
- No data is sent to any server except Google's Gemini API
- Conversations are stored only in your browser
- You can clear all data by clearing your browser's localStorage

## Environment Variables

The project uses Vite environment variables. Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important Notes:**
- Only variables prefixed with `VITE_` are exposed to the client-side code
- The `.env` file should be added to `.gitignore` to avoid committing your API key
- **API Key Priority Order:**
  1. Settings UI (localStorage) - highest priority
  2. `VITE_GEMINI_API_KEY` from `.env` file
  3. Window config (fallback)
- Settings UI key will override `.env` file if both are set (allows overriding for testing)

## Troubleshooting

**API Key Error**
- Make sure you've set `VITE_GEMINI_API_KEY` in your `.env` file OR entered it in Settings
- Check that your API key has the necessary permissions
- If using Vite, restart the dev server after changing `.env` file

**No Response**
- Verify your internet connection
- Check browser console for error messages
- Ensure your API key is valid and has not exceeded rate limits

**Model Not Found**
- If you get a "model not found" error, try changing the model name in `api.js`
- Use `gemini-1.5-flash` as a fallback if experimental models aren't available

**.env file not working**
- Make sure you're using Vite dev server (`npm start`) and not opening HTML directly
- Ensure the variable name is exactly `VITE_GEMINI_API_KEY` (case-sensitive)
- Restart the Vite dev server after creating/modifying the `.env` file

## License

MIT License - Feel free to use and modify as needed!

## Contributing

Feel free to submit issues or improvements. This is a fun project for learning and entertainment!

---

**Enjoy getting roasted! 🔥**