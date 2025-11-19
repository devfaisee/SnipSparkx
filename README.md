# SnipSparkx ⚡

> A modern, serverless CSS snippet manager built for quick experimentation and easy sharing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-success)
![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black)

## 📖 Overview
SnipSparkx is a web application that allows developers to store, preview, and copy CSS snippets. It features a **live isolated sandbox** for every snippet, ensuring that styles don't conflict. The project is built with a focus on **Object-Oriented Programming (OOP)** in JavaScript and modern **Serverless Architecture**.

### ✨ Key Features
- **Live Preview:** Code is rendered in secure, sandboxed iframes.
- **Admin Dashboard:** Secure JWT-based authentication for adding new content.
- **Dual Persistence:** 
  - *Development:* Saves to local JSON files.
  - *Production:* Commits directly to GitHub repository via API (Git-as-a-Database).
- **Search:** Real-time client-side filtering.
- **Design:** Glassmorphism UI using **Tailwind CSS**.

## 🚀 Tech Stack
- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6+ OOP).
- **Backend:** Vercel Serverless Functions (Node.js).
- **Security:** `bcrypt` for password hashing, `jsonwebtoken` for sessions, strict Content Security Policy (CSP) in sandboxes.
- **Tools:** PostCSS, Highlight.js for syntax highlighting.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+
- A Vercel account (optional, for deployment)

### 1. Clone the repository
```bash
git clone https://github.com/devfaisee/SnipSparkx.git
cd SnipSparkx
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory (see `.env.example`):
```env
# Admin Credentials
ADMIN_USER=admin
# Hash for 'admin123': $2a$10$sd23zeZlmqV1val6HiXKguw3C.l5opNbaj3w2jqV/QdQsMRuPvKsm
ADMIN_PASS_HASH=$2a$10$sd23zeZlmqV1val6HiXKguw3C.l5opNbaj3w2jqV/QdQsMRuPvKsm
JWT_SECRET=your_super_secret_key

# GitHub Storage (Optional)
GITHUB_TOKEN=your_github_pat
GITHUB_REPO=username/repo
GITHUB_BRANCH=main
```

### 4. Run Locally
```bash
# Starts the Vercel dev server and Tailwind watcher
npm start
```
Visit `http://localhost:3000`.

### 5. Admin Access
- Go to `/admin.html` or click "Open Admin Panel".
- **Username:** `admin`
- **Password:** `admin123`

## 📂 Project Structure
```
├── api/                # Serverless Backend Functions
│   ├── addSnippet.js   # Handles snippet creation & persistence
│   └── admin/          # Auth routes
├── public/             # Static Frontend Assets
│   ├── index.html      # Main UI (SnippetManager Class)
│   ├── admin.html      # Admin Dashboard
│   └── snippets.json   # Data store
├── src/                # Source Styles
│   └── input.css       # Tailwind directives
└── package.json        # Dependencies & Scripts
```

## 🛡️ Security Measures
1.  **Sandboxing:** User-generated HTML/CSS is rendered in `iframe` elements with `sandbox="allow-scripts"` to prevent XSS attacks on the main application.
2.  **Sanitization:** Input is sanitized on both client and server to strip `<script>` tags and event handlers.
3.  **Environment Variables:** Sensitive credentials are never hardcoded.

## 🎓 Acknowledgments
Developed for [Ziauddin University/ Object Oriented Programming].

## 🧱 System Design Overview

### Class Diagram
```mermaid
classDiagram
    direction LR

    class Snippet {
        +id
        +title
        +description
        +code
        +html
        +getSrcDoc()
        +renderCard(onPreview)
        +_esc(text)
    }

    class SnippetManager {
        -container
        -modal
        -modalContent
        -modalBackdrop
        -modalClose
        -search
        +init()
        +fetchSnippets()
        +renderSnippets()
        +openModal(snippet)
        +closeModal()
        +_wireEvents()
    }

    class SnippetStore {
        -filePath
        -githubToken
        -githubRepo
        -branch
        +constructor(rootDir)
        +read()
        +write(data)
        +add(snippetPayload)
        +update(id, payload)
        +delete(id)
        +_save(data, message)
        +_commitToGitHub(data, message)
        +static cleanHtml(html)
    }

    class AuthHelper {
        +verify(req,res) bool
    }

    class AddSnippetAPI {
        +handler(req,res)
    }

    class UpdateSnippetAPI {
        +handler(req,res)
    }

    class DeleteSnippetAPI {
        +handler(req,res)
    }

    class AdminDashboard {
        -tokenKey
        +checkAuth()
        +fetchSnippets()
        +renderList()
        +loadSnippet(snippet)
        +resetForm()
        +setMsg(text,type)
    }

    SnippetManager "1" --> "*" Snippet : renders
    AdminDashboard --> SnippetStore : via API
    AddSnippetAPI --> SnippetStore : uses
    UpdateSnippetAPI --> SnippetStore : uses
    DeleteSnippetAPI --> SnippetStore : uses
    AddSnippetAPI --> AuthHelper : verifies
    UpdateSnippetAPI --> AuthHelper
    DeleteSnippetAPI --> AuthHelper
```

### Labeled Workflow
1. **Visitor Experience**
   - `SnippetManager.init()` fetches `public/snippets.json`, instantiates `Snippet` objects, and renders responsive cards with live iframe previews.
   - Clicking a card launches the modal split view showing the sandboxed preview alongside HTML/CSS tabs with copy buttons.
2. **Admin Lifecycle**
   - `admin.html` checks for a JWT in `localStorage` to toggle between login form and dashboard.
   - Login calls `/api/admin/login` (bcrypt + JWT). Authenticated admins can create/update/delete snippets via the form, live-preview drafts, and filter existing entries.
3. **Serverless Backend**
   - CRUD handlers (`/api/addSnippet`, `/api/updateSnippet`, `/api/deleteSnippet`) call the shared `SnippetStore` after verifying the token through `auth.js`.
   - `SnippetStore` sanitizes HTML, writes changes to `public/snippets.json`, and optionally syncs to GitHub using the configured PAT/branch.
4. **Data Propagation**
   - Updated `snippets.json` is immediately consumed by both the public UI (on next fetch) and the admin list refresh, keeping the experience consistent without manual rebuilds.

