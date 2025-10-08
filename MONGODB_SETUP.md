# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a free account**: Go to https://www.mongodb.com/cloud/atlas/register
2. **Create a free cluster**: 
   - Choose "M0 Sandbox" (free tier)
   - Select a region close to you
   - Click "Create Cluster"
3. **Create a database user**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Username: `deardiaryuser`
   - Password: (generate a strong password)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"
4. **Whitelist your IP**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your specific IP)
   - Click "Confirm"
5. **Get your connection string**:
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `dear-diary`
6. **Update your .env file**:
   ```
   MONGO_URI=mongodb+srv://deardiaryuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dear-diary?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB

1. **Install MongoDB Community Edition**:
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for Windows
2. **Start MongoDB**:
   ```bash
   mongod
   ```
3. **Your .env is already configured** for local MongoDB:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/dear-diary
   ```

## After Setup

1. **Restart your backend server**: Stop (`Ctrl+C`) and run `npm run dev` again
2. **Clear users**: Run `node server/clearUsers.js` to remove old users
3. **Register a new account**: Try signing up again!
