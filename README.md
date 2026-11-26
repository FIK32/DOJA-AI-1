# DOJA AI

A responsive AI workspace starter built with FastAPI, HTML, CSS, JavaScript,
and the OpenAI-compatible Groq API.

## Files

- `app.py` — FastAPI web app and chat API
- `ai_engine.py` — Groq chat integration
- `index.html` — app interface
- `static/style.css` — responsive DOJA theme and styling
- `static/app.js` — chat and theme interactions
- `requirements.txt` — Python dependencies
- `.env.example` — environment variable names
- `render.yaml` — Render web service configuration

## Run locally

1. Install Python 3.10 or later.
2. Install dependencies: `pip install -r requirements.txt`
3. Set `GROQ_API_KEY` in your environment.
4. Start the server: `uvicorn app:app --reload`
5. Open `http://127.0.0.1:8000`

Without `GROQ_API_KEY`, the website and health endpoint still run, but chat
returns a configuration message.

## Environment variables

- `GROQ_API_KEY` — secret API key from Groq
- `GROQ_MODEL` — optional model name supported by your Groq account

Never commit real API keys. Add secrets through your local environment or the
hosting provider's environment-variable settings.

## Next steps

Appwrite authentication, account profiles, conversation history, projects,
and file storage are not connected yet. They can be added as a separate
implementation milestone.
