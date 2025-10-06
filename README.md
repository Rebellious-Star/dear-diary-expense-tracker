# Dear Diary Expense Tracker

A comprehensive expense tracking website for students with a beautiful farm aesthetic theme.

## Team members
- Ruchi Pasayat
- Amrit Acharya
- Dhruv Pandey

## Features

- **User Authentication**: Secure login and registration system
- **Expense Tracking**: Add, categorize, and track income and expenses
- **Visual Analytics**: Charts and summaries of spending patterns
- **Community Forum**: Connect with fellow students (with moderation system)
- **AI-Powered Tips**: Personalized financial advice based on spending data
- **Contact & Support**: Multiple ways to reach out for help
- **Farm Theme**: Beautiful beige aesthetic with farm animations
- **Responsive Design**: Works perfectly on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Framer Motion
- **Styling**: CSS3 with custom farm theme
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **Charts**: Chart.js with React Chart.js 2

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   ├── ExpenseTrackerPage.tsx
│   ├── ForumPage.tsx
│   ├── TipsPage.tsx
│   └── ContactPage.tsx
├── App.tsx             # Main app component
├── index.tsx          # Entry point
└── index.css          # Global styles
```

## Key Features Explained

### Authentication System
- Mock authentication system for demonstration
- User context management
- Protected routes for authenticated users

### Expense Tracking
- Add income and expenses with categories
- Visual analytics and summaries
- Filter and search functionality
- Data persistence in localStorage

### Forum with Moderation
- 3-strike ban system for inappropriate content
- Word filtering and content moderation
- Temporary and permanent bans
- Discord appeal system for banned users

### AI Tips System
- Personalized financial advice based on spending data
- Interactive chatbot interface
- Quick question suggestions
- Financial overview sidebar

### Farm Aesthetic Theme
- Beige color palette with farm elements
- Floating animations (wheat, tractors, barns)
- Translucent cards and text effects
- Professional animations throughout

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Features to add
- strong password system
- otp feature
- email validation check


## Contributing

This is a demonstration project showcasing modern React development practices with a unique farm aesthetic theme.
