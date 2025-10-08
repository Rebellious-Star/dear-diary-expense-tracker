# Dear Diary Expense Tracker (Student Edition)

A comprehensive expense tracking web app for students with a farm aesthetic theme, community forum with moderation, tips chatbot, and offline support.

## Features

- Authentication
  - Email/Password with local persistence (mock, for demo)
  - OTP-based registration and password reset (via EmailJS optional)
- Expenses
  - Add income/expenses with categories
  - INR currency display; CSV export; keyboard shortcuts (N = new, / = search)
  - Daily streaks (basic gamification)
  - Multi-currency (planned): per-transaction currency with INR conversion
- Forum
  - Global forum (posts visible to all accounts in the same browser profile)
  - Moderation: 3 strikes (warn → 24h temp ban → permanent ban), appeal link
- Tips
  - Personalized suggestions from your spending
  - What-if simulations (e.g., "Reduce Food & Dining by 10%")
- Design & UX
  - Cartoonish farm aesthetic with animations
  - Dark mode toggle; responsive layout
  - Offline (PWA) basic caching
- Admin & Support
  - Contact messages stored locally with admin reply via EmailJS (if configured)
  - Basic moderation panel in Forum and admin view in Contact

## Getting Started

Prereqs:
- Node.js LTS (recommended) or Docker

Install & Run (Node):
```bash
npm install
npm start
```

Run via Docker (no Node installed):
```powershell
docker run --rm -it -p "3000:3000" -v "${PWD}:/app" -w /app -e HOST=0.0.0.0 node:22-alpine sh -lc "npm ci || npm install && npm start"
```

Build:
```bash
npm run build
```

## Project Structure

```
src/
  components/
    Navbar.tsx
    ProtectedRoute.tsx
  contexts/
    AuthContext.tsx
  pages/
    HomePage.tsx
    LoginPage.tsx
    ExpenseTrackerPage.tsx
    ForumPage.tsx
    TipsPage.tsx
    ContactPage.tsx
  App.tsx
  index.tsx
  index.css
public/
  index.html
  manifest.json
  sw.js
```

## Configuration

### EmailJS (optional)
Used for OTP emails and admin replies.
- Create an EmailJS account and a service/template.
- Add environment variables (CRA-style):
  - `REACT_APP_EMAILJS_PUBLIC_KEY`
  - `REACT_APP_EMAILJS_SERVICE_ID`
  - `REACT_APP_EMAILJS_TEMPLATE_ID` (OTP template)
  - `REACT_APP_EMAILJS_RESET_TEMPLATE_ID` (optional password reset template)
  - `REACT_APP_EMAILJS_REPLY_TEMPLATE_ID` (optional contact reply template)
The app falls back gracefully if EmailJS is not configured.

### PWA
- Service worker `public/sw.js` is registered on load.
- Provides basic cache-then-network for core assets.

### Dark Mode
- Toggle in navbar.
- Preference stored in `localStorage.theme`.

## Data Persistence & Scopes

- Users: `localStorage.users` (hashed passwords with bcryptjs; demo only)
- Auth session: `localStorage.userData`, `localStorage.authToken` (mock)
- Expenses per user: `localStorage["expenses:{userId}"]`
  - Migrates legacy `expenses` to per-user on next login
- Forum (global): `localStorage.forumPosts`
- Bans/Warnings: `localStorage.bannedUsers`, `localStorage.userWarnings`
- Contact messages: `localStorage.contactMessages`
- Streaks per user: `localStorage["streak:{userId}"]`

Note: All storage is per browser profile. Incognito/another browser will not share data.

## Keyboard Shortcuts

- Expenses page:
  - `N`: open add transaction form
  - `/`: focus search

## Security Notes

- This is a demo app using localStorage and client-side auth. Do not use as-is in production.
- Replace with a real backend, secure auth (sessions/JWT), and a database for real deployments.

## Roadmap

- Multi-currency (per-transaction) with editable FX rates and normalized totals
- Budget limits/alerts and trend reports
- Receipt OCR and bank CSV import
- Shared budgets and split transactions
- Full admin dashboard and role-based access control

## License

Educational/demonstration use.









