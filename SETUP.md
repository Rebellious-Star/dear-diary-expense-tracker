# Setup Instructions for Dear Diary Expense Tracker

## Prerequisites

Before running this project, you need to install Node.js and npm:

### 1. Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (recommended for most users)
3. Run the installer and follow the setup wizard
4. This will also install npm (Node Package Manager)

### 2. Verify Installation
Open a new terminal/command prompt and run:
```bash
node --version
npm --version
```

Both commands should return version numbers.

## Project Setup

### 1. Install Dependencies
Navigate to the project directory and run:
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## Project Features

### 🌾 Farm-Themed Design
- Beautiful beige color palette
- Floating farm animations (wheat, tractors, barns)
- Translucent cards and text effects
- Professional animations throughout

### 💰 Expense Tracking
- Add income and expenses with categories
- Visual analytics and summaries
- Filter and search functionality
- Data persistence in localStorage

### 💬 Community Forum
- 3-strike ban system for inappropriate content
- Word filtering and content moderation
- Temporary and permanent bans
- Discord appeal system for banned users

### 🤖 AI-Powered Tips
- Personalized financial advice based on spending data
- Interactive chatbot interface
- Quick question suggestions
- Financial overview sidebar

### 🔐 Authentication
- Secure login and registration system
- User context management
- Protected routes for authenticated users

## File Structure

```
dear-diary-expense-tracker/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ExpenseTrackerPage.tsx
│   │   ├── ForumPage.tsx
│   │   ├── TipsPage.tsx
│   │   └── ContactPage.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   - The app will automatically suggest using a different port
   - Or stop the process using port 3000

2. **Dependencies not installing**
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` folder and `package-lock.json`
   - Run `npm install` again

3. **TypeScript errors**
   - Make sure all dependencies are installed
   - Check that `tsconfig.json` is properly configured

## Development Notes

- The project uses localStorage for data persistence
- Authentication is mocked for demonstration purposes
- All animations are optimized for performance
- The design is fully responsive

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance

- Optimized animations using Framer Motion
- Efficient state management
- Minimal bundle size
- Fast loading times

Enjoy using Dear Diary Expense Tracker! 🌾












