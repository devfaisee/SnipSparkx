# SnipSparkx ⚡

**A CSS Snippet Manager with Live Preview**

Built as my final project for the Object-Oriented Programming course at Ziauddin University. This web application lets you create, manage, and preview CSS snippets in real-time using sandboxed iframes and a complete admin dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-success)
![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black)

---

## 📋 Table of Contents

- [What This Project Does](#-what-this-project-does)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [System Architecture](#-system-architecture)
- [How It Works](#-how-it-works)
- [Backend Logging](#-backend-logging)
- [Security Implementation](#-security-implementation)
- [Project Structure](#-project-structure)
- [About This Project](#-about-this-project)

---

## 🎯 What This Project Does

SnipSparkx is a web-based platform where developers can:
- **Store CSS snippets** with optional HTML markup for testing
- **Preview snippets live** in sandboxed iframes for security
- **Manage content** through a secure admin panel with JWT authentication
- **Search and filter** snippets in real-time
- **Copy code** with one click for quick reuse

The project demonstrates key OOP principles through JavaScript classes, serverless architecture with Vercel functions, and full CRUD operations with persistent storage.

---

## ✨ Features

### For Visitors
- **Live Preview Cards**: Every snippet renders in an isolated iframe showing exactly how the CSS looks
- **Code Modal**: Click any card to see the full HTML + CSS with syntax highlighting
- **One-Click Copy**: Copy buttons for both HTML and CSS with visual feedback
- **Search**: Real-time filtering as you type

### For Admins
- **Secure Login**: JWT-based authentication with bcrypt password hashing
- **Full CRUD Dashboard**: Create, read, update, and delete snippets
- **Live Preview Before Save**: Test your snippet before adding it to the collection
- **Smart Form**: Autofills when editing existing snippets
- **Instant Updates**: Changes reflect immediately without rebuilding

---

## 🛠️ Tech Stack

### Frontend
- **HTML/CSS/JavaScript** - Vanilla JS with ES6 classes (no frameworks)
- **Tailwind CSS** - Utility-first styling with custom config
- **Highlight.js** - Syntax highlighting for code blocks

### Backend
- **Vercel Serverless Functions** - Node.js runtime for API endpoints
- **JSON File Storage** - Simple persistence with `public/snippets.json`
- **Optional GitHub Sync** - Auto-commits to repo for backup

### Security & Auth
- **bcrypt** - Password hashing (salted, 10 rounds)
- **jsonwebtoken** - JWT tokens for admin sessions (1-hour expiry)
- **HTML Sanitization** - Strips `<script>` tags and event handlers

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+ 
- npm or yarn
- (Optional) Vercel account for deployment

### 1. Clone the Repository
```bash
git clone https://github.com/devfaisee/SnipSparkx.git
cd SnipSparkx
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Admin Credentials
ADMIN_USER=admin
ADMIN_PASS_HASH=$2a$10$sd23zeZlmqV1val6HiXKguw3C.l5opNbaj3w2jqV/QdQsMRuPvKsm

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_key_here

# Optional: GitHub Sync
GITHUB_TOKEN=your_personal_access_token
GITHUB_REPO=username/repo
GITHUB_BRANCH=main
```

> **Note**: The default password hash is for `admin123`. Generate your own using:
> ```bash
> node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
> ```

### 4. Build CSS
```bash
npm run build:css
```

### 5. Start Development Server
```bash
npm start
```

Visit `http://localhost:3000` to see the app!

### 6. Access Admin Panel
- Navigate to `/admin.html`
- **Username**: `admin`
- **Password**: `admin123` (or whatever you set)

---

## 🏗️ System Architecture

### Class Diagram
![Class Diagram](./docs/diagrams/class-diagram.png)

**Structure Breakdown:**

#### Frontend Classes (Browser)
1. **Snippet** - Represents a single CSS snippet with all its data
   - Properties: `id`, `title`, `description`, `code` (CSS), `html`
   - Methods: `getSrcDoc()` generates iframe content, `renderCard()` creates the preview card DOM
   
2. **SnippetManager** - Controls the main snippet grid and modal
   - Fetches all snippets from the API
   - Renders cards dynamically
   - Handles search filtering
   - Opens/closes the preview modal with tabs

3. **AdminDashboard** - Manages the admin panel UI
   - Checks authentication via JWT in localStorage
   - Renders the snippet list with edit/delete buttons
   - Handles form submission for add/update operations
   - Shows toast messages for feedback

#### Backend Classes (Vercel Serverless)
1. **SnippetStore** - Core data management class
   - Reads from `public/snippets.json`
   - Writes changes with optional GitHub sync
   - Implements all CRUD methods: `add()`, `update()`, `delete()`, `read()`
   - Static method `cleanHtml()` for sanitization

2. **AuthHelper** - JWT token verification
   - Validates `Authorization: Bearer <token>` headers
   - Returns user payload if valid, false otherwise

3. **API Endpoints** - Serverless functions
   - `POST /api/addSnippet` - Create new snippet
   - `PUT /api/updateSnippet` - Modify existing snippet
   - `DELETE /api/deleteSnippet` - Remove snippet
   - `POST /api/admin/login` - Authenticate and issue JWT

**Connections:**
- SnippetManager creates Snippet instances for each item
- AdminDashboard makes HTTP requests to API endpoints
- API endpoints verify auth via AuthHelper, then call SnippetStore methods
- SnippetStore persists data locally and optionally to GitHub

---

### CRUD Sequence Diagram
![CRUD Sequence](./docs/diagrams/crud-sequence.png)

**Flow Explanation (Add/Update/Delete):**

1. **Admin User** fills out the form (title, description, CSS, HTML) and clicks Save/Update/Delete
2. **Browser/UI** (AdminDashboard) packs the data and JWT token from localStorage
3. **API Endpoint** receives the `fetch()` POST/PUT/DELETE request
4. **AuthHelper** validates the JWT token from `Authorization` header
5. **API** sanitizes any HTML input to strip dangerous tags
6. **SnippetStore** is called with the appropriate method (`add`, `update`, or `delete`)
7. **Data Persistence**: SnippetStore writes to `public/snippets.json` (and optionally commits to GitHub)
8. **SnippetStore** returns the result (new/updated snippet or success flag)
9. **API** sends JSON response back (200 OK with data, or error)
10. **Browser/UI** displays a toast notification and refreshes the snippet list
11. **Admin User** sees the updated collection immediately

**Key Points:**
- Every request requires valid JWT authentication
- HTML is sanitized before saving
- All backend operations log to console (see [Backend Logging](#-backend-logging))
- Changes are instant - no build step needed

---

## 🔍 How It Works

### Visitor Experience
1. **Landing Page**: Grid of snippet cards, each showing a live preview
2. **Click a Card**: Modal opens with tabbed view (CSS/HTML)
3. **Copy Code**: Click "Copy CSS" or "Copy HTML" - button shows checkmark
4. **Search**: Type in search box - cards filter in real-time

### Admin Workflow
1. **Login**: Navigate to `/admin.html`, enter credentials
2. **Dashboard**: See all snippets in a table with action buttons
3. **Create New**: Fill form at top, click "Add Snippet"
4. **Edit Existing**: Click "Edit" on any row - form auto-fills
5. **Delete**: Click "Delete" - confirmation dialog, then removed
6. **Preview**: Click "Preview" to test snippet before saving

### Data Flow
```
Admin Form → AdminDashboard.handleSubmit() 
  → fetch('/api/addSnippet', { body: {...}, headers: { Authorization: 'Bearer <JWT>' } })
    → API verifies JWT via AuthHelper
      → API calls SnippetStore.add()
        → SnippetStore writes to snippets.json
          → Returns new snippet
      → API sends JSON response
    → AdminDashboard shows success toast & refreshes
```

---

## 📊 Backend Logging

Every API endpoint and SnippetStore operation logs to the console with structured messages:

### Log Format
```
[ENDPOINT_NAME] Message
```

### Example Console Output
```
[ADD SNIPPET] Request received
[ADD SNIPPET] Method: POST
[ADD SNIPPET] Verifying authentication...
[ADD SNIPPET] ✓ Authentication successful
[ADD SNIPPET] Payload received: { title: 'Gradient Button', descriptionLength: 45, codeLength: 234, htmlLength: 67 }
[ADD SNIPPET] Sanitizing HTML input...
[ADD SNIPPET] ✓ HTML sanitized
[ADD SNIPPET] Saving to SnippetStore...
[SnippetStore] Adding new snippet: Gradient Button
[SnippetStore] Reading snippets from: E:\snip-sparkx\SnipSparkx\public\snippets.json
[SnippetStore] ✓ Loaded 5 snippets from local file
[SnippetStore] Saving with message: feat: add snippet "Gradient Button"
[SnippetStore] Writing 6 snippets to: E:\snip-sparkx\SnipSparkx\public\snippets.json
[SnippetStore] ✓ Successfully wrote to local file
[SnippetStore] ✓ Snippet added with ID: 1732025789345
[ADD SNIPPET] ✓ Snippet saved successfully. ID: 1732025789345
[ADD SNIPPET] → Response sent: 201 Created
```

### What Gets Logged
- **Request Method**: POST, PUT, DELETE, etc.
- **Authentication Steps**: Token verification status
- **Payload Info**: Title, content lengths (not actual content for security)
- **Data Operations**: Read/write/update/delete actions
- **Success/Failure**: Clear ✓ or ❌ indicators
- **Response Status**: HTTP status codes sent back

### What Does NOT Get Logged
- Passwords or JWT tokens (security)
- Full code content (just lengths)
- Sensitive environment variables

---

## 🛡️ Security Implementation

### 1. Input Sanitization
**Location**: `api/_lib/store.js` → `SnippetStore.cleanHtml()`

```javascript
// Strips <script> tags
clean = clean.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

// Removes event handlers (onclick, onload, etc.)
clean = clean.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
```

### 2. Iframe Sandboxing
**Location**: `public/index.html` → `Snippet.renderCard()`

```javascript
iframe.setAttribute('sandbox', 'allow-scripts');
```

This prevents the iframe from:
- Submitting forms
- Opening popups
- Accessing parent window
- Executing plugins

### 3. JWT Authentication
**Flow**:
1. Admin logs in → `POST /api/admin/login`
2. Password verified with bcrypt → `bcrypt.compare(password, hash)`
3. JWT issued with 1-hour expiry → `jwt.sign({ user }, secret, { expiresIn: '1h' })`
4. Token stored in localStorage → `localStorage.setItem('snip_admin_token', token)`
5. Every API call includes → `Authorization: Bearer <token>`
6. AuthHelper verifies → `jwt.verify(token, secret)`

### 4. Environment Variables
All secrets live in `.env`:
- `JWT_SECRET` - Never hardcoded
- `ADMIN_PASS_HASH` - Bcrypt hash, not plain text
- `GITHUB_TOKEN` - Optional, for GitHub sync

---

## 📂 Project Structure

```
SnipSparkx/
│
├── api/                          # Serverless backend functions
│   ├── _lib/                     # Shared utilities
│   │   ├── auth.js              # JWT verification helper
│   │   └── store.js             # SnippetStore class (CRUD operations)
│   │
│   ├── admin/                   # Admin-specific endpoints
│   │   └── login.js             # POST /api/admin/login - Authentication
│   │
│   ├── addSnippet.js            # POST /api/addSnippet - Create snippet
│   ├── updateSnippet.js         # PUT /api/updateSnippet - Modify snippet
│   └── deleteSnippet.js         # DELETE /api/deleteSnippet - Remove snippet
│
├── public/                       # Frontend static files
│   ├── index.html               # Main page (visitor view)
│   ├── admin.html               # Admin dashboard
│   ├── style.css                # Compiled Tailwind CSS
│   └── snippets.json            # Data storage (JSON file)
│
├── src/                          # CSS source
│   └── input.css                # Tailwind directives & custom styles
│
├── docs/                         # Documentation
│   └── diagrams/                # Architecture diagrams
│       ├── class-diagram.svg    # Class structure diagram
│       ├── class-diagram.png
│       ├── crud-sequence.svg    # CRUD flow diagram
│       └── crud-sequence.png
│
├── .env                          # Environment variables (gitignored)
├── .gitignore                   # Git ignore rules
├── package.json                  # Dependencies & scripts
├── tailwind.config.js           # Tailwind configuration
└── README.md                     # This file
```

### Key Files Explained

**Backend**
- `api/_lib/store.js` - The heart of data management. Handles reading/writing snippets.json and optional GitHub sync.
- `api/_lib/auth.js` - Simple JWT verification. Returns user payload or false.
- `api/addSnippet.js` - Creates new snippet after auth check and sanitization.
- `api/updateSnippet.js` - Updates existing snippet by ID.
- `api/deleteSnippet.js` - Removes snippet by ID.
- `api/admin/login.js` - Compares bcrypt hash, issues JWT on success.

**Frontend**
- `public/index.html` - Visitor-facing page. Contains `Snippet` and `SnippetManager` classes.
- `public/admin.html` - Admin dashboard. Contains `AdminDashboard` logic.
- `public/snippets.json` - Flat JSON array of snippet objects. Modified by SnippetStore.

---

## 🎓 About This Project

### Course Context
Built for the **Object-Oriented Programming** course at **Ziauddin University** in Fall 2024. The assignment required:
- Use of OOP principles (classes, encapsulation, methods)
- A working full-stack application
- Persistent data storage
- Security considerations

### What I Learned
- **JavaScript OOP**: Creating classes, instance methods, static methods
- **Serverless Architecture**: How Vercel Functions work vs. traditional servers
- **Authentication**: JWT tokens, bcrypt hashing, secure password handling
- **API Design**: RESTful principles, HTTP methods, status codes
- **Security**: XSS prevention, iframe sandboxing, input sanitization
- **Git Workflows**: GitHub as a database, committing via API

### Challenges Faced
1. **Iframe Auto-Resize**: Making the preview adjust to content height took a lot of trial and error
2. **HTML Sanitization**: Balancing security with functionality - stripping dangerous code without breaking valid HTML
3. **JWT Storage**: Deciding between localStorage vs. cookies for token storage
4. **GitHub API**: Figuring out the Base64 encoding and SHA requirements for commits

### Future Improvements
- [ ] Add tags/categories for snippets
- [ ] Implement user accounts (multi-admin)
- [ ] Export snippets as JSON or ZIP
- [ ] Dark mode toggle
- [ ] More themes for syntax highlighting

---

## 📜 License

MIT License - feel free to use this project for learning!

---

## 🙏 Acknowledgments

- **Professor** - For guiding the OOP concepts
- **Classmates** - For testing and feedback
- **Tailwind CSS** - For making styling enjoyable
- **Vercel** - For free serverless hosting

---

**Made with ☕ and 🎵 by a student trying to understand async/await**

If you found this helpful, give it a ⭐ on [GitHub](https://github.com/devfaisee/SnipSparkx)!
