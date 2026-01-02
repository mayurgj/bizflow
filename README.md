# BizFlow

A high-performance CRM Dashboard built as a Google Apps Script (GAS) web application. BizFlow bridges the gap between Google's ecosystem and modern web development by integrating a reactive Vue.js frontend with a robust Supabase backend.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue.js (v2.x) |
| State Management | Vuex (v3.x) |
| UI Framework | Vuetify (v2.x) |
| Routing | Vue Router (v3.x) |
| Visualizations | Chart.js |
| Backend/DB | Supabase (PostgreSQL + PostgREST) |
| Environment | Google Apps Script (GAS) |

## 📦 Dependency CDNs

Include these in your `index.html` to power the application logic and styling:

### Core Frameworks
```html
<!-- Vue.js (v2) -->
<script src="https://cdn.jsdelivr.net/npm/vue@2"></script>

<!-- Vuex (v3) -->
<script src="https://unpkg.com/vuex@3"></script>

<!-- Vue Router (v3) -->
<script src="https://unpkg.com/vue-router@3"></script>
```

### UI & Aesthetics
```html
<!-- Vuetify (v2) -->
<link href="https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

## ✨ Key Architectural Features

### 1. Custom Supabase Client for GAS

Built a specialized lightweight JavaScript client to handle Supabase communication via Google's `UrlFetchApp`.

- **Builder Pattern**: Supports fluent chained filtering (e.g., `.from('table').eq('id', 1).select()`).
- **Multi-Schema Support**: Seamlessly switch between `public` and `reporting` schemas.
- **Error Handling**: Robust implementation of exponential backoff for API reliability.

### 2. Strategic State Management (Vuex)

- **Generic Mutations**: Uses a unified `SET_DATA` pattern to reduce boilerplate when scaling tables.
- **Reactive Auth**: User sessions are managed in a central store, synchronized with `localStorage` for 2-hour persistence.
- **Global Loading/Snackbars**: Unified notification and loading systems accessible from any view.

### 3. Business-First Dashboarding

- **Fiscal Calendar Logic**: Automated grouping for Indian Financial Years (April to March).
- **Interactive Tiles**: Summary cards with dynamic Bar/Line chart switching and primary color theme integration.
- **Navigation Guards**: Secure routing that redirects unauthorized users to login while protecting the dashboard.

### 4. Optimized Frontend Views

- **Global Mixins**: Shared logic for Indian numbering systems (`en-IN`), date formatting, and value prettification (Crores/Lakhs).
- **Responsive Layout**: A "Master-Detail" layout with a dynamic navigation drawer that groups routes by business module.

## 🛠️ Installation & Setup

1. **GAS Script Properties**: Add the following keys in your Apps Script Settings:
   - `SUPABASE_URL`: Your project URL.
   - `SUPABASE_ANON_KEY`: Your project's anonymous API key.
   - `HASH_SALT`: A random secret string used for password security.

2. **Schema Requirement**: Ensure your PostgreSQL instance has the following views/tables:
   - `users`: (id, email_id, full_name, user_name, password_hash, is_active).
   - `reporting.voucher`: Aggregated transaction data.
   - `reporting.stock`: Live inventory levels.

3. **Deployment**: Deploy as a Web App. Set access to "Anyone" to enable user logins.

## 🔒 Security

- **Password Hashing**: SHA-256 implementation with a custom Salt/Pepper.
- **API Guarding**: Every backend fetch is guarded by `muteHttpExceptions` and server-side response code validation.