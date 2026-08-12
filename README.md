# 🍳 RecipeCraft — Modern Recipe Sharing Web Application

<div align="center">

  ![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

  <p align="center">
    A full-stack, highly responsive, mobile-first Web Application designed for home chefs to discover, publish, rate, and bookmark gourmet recipes seamlessly.
  </p>
</div>

---

## 🌟 Key Highlights

- 📱 **Mobile-First App Experience:** Designed with responsive viewports, touch-friendly touch targets, dynamic layout grids, and optimized typography for smartphone users.
- ⚡ **Lightning Fast Development Stack:** Powered by Vite & React 18 with instantaneous HMR and optimized asset bundling.
- 🛡️ **Robust Authentication:** Secure identity management with Supabase Auth (Email/Password registration & persistent session management).
- 🗄️ **Relational PostgreSQL Backend:** Scalable database structure linking users, recipes, step-by-step instructions, ingredients, ratings, and user favorites.
- 📤 **Native Share Capabilities:** Integrated Web Share API with intelligent fallback to desktop clipboard copying.

---

## ✨ Application Features

### 🔐 1. Authentication & Route Protection
* **Secure Access Control:** Guest users can browse recipes, but creating, editing, deleting, or reviewing requires authentication.
* **Persistent Sessions:** Automated token management via Supabase Auth Client.

### 📖 2. Complete Recipe Management (CRUD)
* **Visual Card Views:** Interactive cards rendering prep time, cooking duration, servings, categories, and average community ratings.
* **Granular Recipe Details:** Structured listing for ingredients with measurement units, ordered instruction steps with optional step timers.
* **Image Management:** Direct image URL rendering and cloud asset compatibility.

### ⭐ 3. Community Ratings & Reviews
* **Dynamic Star Rating System:** Interactive rating collection with real-time score updates.
* **Verified Reviews:** Instant user feedback submission with dedicated review management.

### 🔖 4. Bookmarks & Native Interactions
* **Favorites System:** One-tap recipe saving tied directly to user profiles.
* **Cross-Platform Sharing:** Native mobile share drawer invocation with automated fallback to URL copying for desktop browser environments.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | Declarative component-based UI layer |
| **Build Tool** | Vite 5 | Rapid dev server & production bundler |
| **Styling** | Tailwind CSS 3 | Utility-first responsive dark theme design |
| **Backend & DB** | Supabase | Managed PostgreSQL, Row-Level Security & Auth |
| **Icons** | Lucide React | Clean, scalable vector icon library |
| **Client Routing** | React Router DOM v6 | Single Page Application (SPA) navigation |

---

## 📂 Project Architecture

```text
recipe-sharing-app/
├── public/
├── src/
│   ├── assets/           # Static media assets & brand SVGs
│   ├── components/       # Reusable UI Components
│   │   ├── ImageUpload.jsx
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeFilter.jsx
│   │   ├── RecipeReviews.jsx
│   │   └── ShareButton.jsx
│   ├── hooks/            # Custom Utility Hooks (e.g., useDebounce.js)
│   ├── lib/              # Supabase Client Configuration
│   │   └── supabase.js
│   ├── pages/            # View Routes
│   │   ├── AddRecipe.jsx
│   │   ├── Auth.jsx
│   │   ├── EditRecipe.jsx
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   └── RecipeDetail.jsx
│   ├── App.jsx           # Main Router & Provider Layout
│   ├── main.jsx          # React DOM Root Entry Point
│   └── index.css         # Tailwind Directive Imports
├── .env                  # Environment Credentials (Git Ignored)
├── package.json
└── vite.config.js