# SnipSparkx ⚡  
### CSS Snippet Collection Web App

A clean, developer-friendly tool I built for my Object Oriented Programming (OOP) course at **Ziauddin University**. It lets users save, preview, manage, and search CSS/HTML snippets with live sandbox previews—plus a secure admin panel.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-success)
![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black)

---

## 📖 Overview

SnipSparkx is a lightweight, modern snippet management system where:

- Each snippet is isolated inside a sandboxed iframe  
- Admins can add, update, delete snippets  
- Storage works locally (JSON) or through automatic GitHub commits  
- Everything follows OOP principles using **JavaScript classes**

The UI uses a frosted glass, modern Tailwind design.

---

## ✨ Features

### 🔥 Live Preview  
Every snippet renders inside a secure `iframe sandbox`, so styles never spill into the main site.

### 🔐 Admin Panel  
Includes login, JWT authentication, password hashing, and session storage.

### 💾 Smart Saving  
- **Development:** Saves snippets to a local JSON file  
- **Production:** Automatically commits changes to GitHub using the API

### 🔍 Search  
Real-time search through all snippets.

### 🎨 Modern UI  
Tailwind CSS + subtle glassmorphism + gradient borders + syntax highlighting.

---

## 🚀 Technologies Used

- **Frontend:** HTML, Tailwind CSS, Vanilla JS (OOP)
- **Backend:** Vercel Serverless Functions  
- **Security:** bcrypt hashing, JWT authentication  
- **Tools:** PostCSS, Highlight.js  
- **Storage:** JSON (local) + GitHub Repo Sync

---

## 🛠️ Setup & Installation

### **1. Clone the Repo**
```bash
git clone https://github.com/devfaisee/SnipSparkx.git
cd SnipSparkx
