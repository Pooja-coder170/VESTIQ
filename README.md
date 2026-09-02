# VESTIQ

VESTIQ is a full-stack wardrobe and personal style app built with HTML5, CSS3, vanilla JavaScript, Node.js, and Express.

## Structure

```text
VESTIQ/
  backend/
    data/wardrobe.json
    server.js
  frontend/
    index.html
    script.js
    style.css
  uploads/.gitkeep
  .env.example
  .gitignore
  package.json
  README.md
```

## Run locally

1. Install Node.js 18 or newer from https://nodejs.org/.
2. Open PowerShell in the VESTIQ folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Optionally set `AI_API_KEY` in `.env`. The key is read only by `backend/server.js`; it is never sent to the browser.
6. Run `npm start`.
7. Open `http://localhost:3000` in Google Chrome.

The app works without an AI key using its local wardrobe composer. With a compatible OpenAI-style API key, the backend asks the model to select wardrobe item IDs and still renders the user's actual uploaded images. Uploaded files and metadata remain local in `uploads/` and `backend/data/wardrobe.json`.

For development, use `npm run dev` to restart the server when backend files change.