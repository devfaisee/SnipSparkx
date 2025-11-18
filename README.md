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

GitHub-backed persistence (recommended, industry-grade)

This project supports committing new snippets directly to the repository using the GitHub Contents API. This provides durable storage (snippets persisted in the repo) and is a minimal, dependency-free way to make storage persistent.

To enable GitHub-backed persistence on Vercel:

1. Create a GitHub personal access token with `repo` scope (or `public_repo` for public repos only).
2. Set the following Environment Variables in your Vercel project settings:
	- `GITHUB_TOKEN`: your token
	- `GITHUB_REPO`: the repository in `owner/repo` format (e.g. `devfaisee/SnipSparkx`)
	- Optional: `GITHUB_BRANCH` (defaults to `main`)

When these variables are present the serverless function at `api/addSnippet.js` will attempt to update `public/snippets.json` in the repository. If the GitHub upload fails, the function falls back to writing the file on the function's filesystem (useful for local `vercel dev`).

Security note: keep `GITHUB_TOKEN` secret. Use Vercel's Environment Variables UI to store it.

## Admin & deployment (env vars)

To enable admin-only snippet creation you must set these environment variables (for example in Vercel):

- `ADMIN_USER` — admin username
- `ADMIN_PASS_HASH` — bcrypt hash of the admin password (store this in Vercel envs)
- `JWT_SECRET` — secret used to sign tokens (keep this secret)
- `GITHUB_TOKEN` and `GITHUB_REPO` — optional: used by the server to commit `public/snippets.json` back to the repo for persistence

When `ADMIN_USER`, `ADMIN_PASS_HASH`, and `JWT_SECRET` are all present, `/api/addSnippet` requires a Bearer token issued by POSTing credentials to `/api/admin/login`.

Generating a bcrypt password hash (example)

Install `bcryptjs` locally or use a small Node snippet to generate a hash. Example using a quick Node one-liner (you can run this locally):

```bash
# install temporarily if needed
npm install bcryptjs
node -e "const b=require('bcryptjs');console.log(b.hashSync(process.argv[1], 10));" 'your-strong-password'
```

Copy the output and set it as the `ADMIN_PASS_HASH` environment variable in Vercel.

For local development you can run `vercel dev` and export these envs locally. If the envs are not set the server will accept snippet posts (for local convenience), but for production you should set them to enforce admin-only creation.
