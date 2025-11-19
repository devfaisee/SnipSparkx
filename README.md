SnipSparkx ⚡
CSS Snippet Collection Web App

A clean, developer-friendly tool I built for my Object Oriented Programming (OOP) course at Ziauddin University. It lets users save, preview, manage, and search CSS/HTML snippets with live sandbox previews—plus a secure admin panel.






📖 Overview

SnipSparkx is a lightweight, modern snippet management system where:

Each snippet is isolated inside a sandboxed iframe

Admins can add, update, delete snippets

Storage works locally (JSON) or through automatic GitHub commits

Everything follows OOP principles using JavaScript classes

The UI uses a frosted glass, modern Tailwind design.

✨ Features
🔥 Live Preview

Every snippet renders inside a secure iframe sandbox, so styles never spill into the main site.

🔐 Admin Panel

Includes login, JWT authentication, password hashing, and session storage.

💾 Smart Saving

Development: Saves snippets to a local JSON file

Production: Automatically commits changes to GitHub using the API

🔍 Search

Real-time search through all snippets.

🎨 Modern UI

Tailwind CSS + subtle glassmorphism + gradient borders + syntax highlighting.

🚀 Technologies Used

Frontend: HTML, Tailwind CSS, Vanilla JS (OOP)

Backend: Vercel Serverless Functions

Security: bcrypt hashing, JWT authentication

Tools: PostCSS, Highlight.js

Storage: JSON (local) + GitHub Repo Sync

🛠️ Setup & Installation
1. Clone the Repo
git clone https://github.com/devfaisee/SnipSparkx.git
cd SnipSparkx

2. Install Dependencies
npm install

3. Add Your Environment Variables

Create .env:

ADMIN_USER=admin
ADMIN_PASS_HASH=$2a$10$sd23zeZlmqV1val6HiXKguw3C.l5opNbaj3w2jqV/QdQsMRuPvKsm
JWT_SECRET=your_super_secret_key

# Optional GitHub Sync
GITHUB_TOKEN=your_github_pat
GITHUB_REPO=username/repo
GITHUB_BRANCH=main

4. Start Local Server
npm start


Visit:
http://localhost:3000

5. Admin Login

Username: admin

Password: admin123

Change these before real deployment.

📂 Project Structure
├── api/                     # Serverless backend functions
│   ├── addSnippet.js
│   ├── updateSnippet.js
│   ├── deleteSnippet.js
│   └── admin/               # Authentication utilities
│       └── auth.js
│
├── public/                  # Frontend files
│   ├── index.html
│   ├── admin.html
│   └── snippets.json
│
├── src/
│   └── input.css            # Tailwind config
│
└── package.json

🛡️ Security Highlights

Iframe sandboxing prevents malicious CSS/HTML from affecting UI

HTML input cleaning (removes <script> & inline events)

bcrypt password hashing

JWT authentication

Environment variables instead of hardcoded secrets

🎓 Academic Context

Developed for my OOP course at Ziauddin University. Built entirely using ES6 classes and modular components. The project demonstrates real-world OOP, API design, auth workflows, and secure sandbox rendering.

🧱 System Design
Class Diagram

(Properly padded + readable + non-overflowing)

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
        +_save(data, msg)
        +_commitToGitHub(data, msg)
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

CRUD Operation (End-to-End Flow)

The diagram below is now properly sized, clear, and non-scrollable.

CRUD Sequence Diagram

[ Admin Form ]
      |
      v
[ Browser Fetch ]
      |
      v
[ Vercel API Route ]
      |
      v
[ Auth Helper (JWT) ]
      |
      v
[ SnippetStore Class ]
      |
      |--- Save Locally (development)
      |
      |--- Commit to GitHub (production)
      |
      v
[ JSON Updated ]
      |
      v
[ UI Re-Fetches + Renders Snippets ]

🔄 System Flow Explained
1. Frontend

SnippetManager loads JSON

Creates Snippet objects

Renders cards with iframe previews

Modal shows full HTML/CSS

2. Admin Panel

JWT token stored in browser

Add/Edit/Delete actions

Preview before saving

3. Backend

All API routes share SnippetStore

AuthHelper validates tokens

Files written locally or GitHub Sync

4. Live Updates

UI instantly updates on next fetch

No server restart needed
