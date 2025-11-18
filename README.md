# SnipSparkx

This repository is a ready-to-deploy static site for managing CSS snippets with live previews.

Structure:

- `public/` - static files served by Vercel
	- `index.html` - main UI
	- `style.css` - site styling
	- `snippets.json` - stored CSS snippets
- `api/` - Vercel serverless functions
	- `addSnippet.js` - POST endpoint to add snippets
- `package.json` - scripts for `vercel dev`

Deploy:

1. Push this repo to GitHub.
2. Import the repo into Vercel (https://vercel.com) and deploy — Vercel will serve the `public/` folder and the `api/` functions automatically.

Local dev:

Install the Vercel CLI and run:

```bash
npm install -g vercel
npm run dev
```

Visit `http://localhost:3000` (or the port shown by `vercel dev`).

Notes:

- The serverless function writes to `public/snippets.json` when adding snippets. On Vercel deployments this filesystem change may be ephemeral; for persistent storage integrate a database or external storage.
