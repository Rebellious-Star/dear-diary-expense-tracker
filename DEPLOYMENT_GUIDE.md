# Deployment Guide - Dear Diary Expense Tracker

## **Architecture**
- **Frontend**: React app (deploy to Netlify)
- **Backend**: Node.js/Express API (deploy to Render/Railway/Heroku)
- **Database**: MongoDB Atlas (already hosted)

## **Step 1: Push to GitHub**

### **1.1 Initialize Git (if not already done)**
```bash
cd C:\Users\dhruv\dear-diary-expense-tracker
git init
git add .
git commit -m "Initial commit - Dear Diary Expense Tracker"
```

### **1.2 Create GitHub Repository**
1. Go to https://github.com/new
2. Repository name: `dear-diary-expense-tracker`
3. Description: "A comprehensive expense tracking website for students"
4. **Keep it Public** (or Private if you prefer)
5. **DO NOT** initialize with README (you already have one)
6. Click "Create repository"

### **1.3 Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/dear-diary-expense-tracker.git
git branch -M main
git push -u origin main
```

**IMPORTANT**: Replace `YOUR_USERNAME` with your actual GitHub username!

---

## **Step 2: Deploy Backend (Choose ONE)**

### **Option A: Deploy to Render (Recommended - Free)**

1. **Go to https://render.com**
2. **Sign up/Login** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Name**: `dear-diary-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`

6. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   MONGO_URI=mongodb+srv://dhruveloper2005_db_user:gM2JjhaJH3DOzQNN@cluster0.j3irp3w.mongodb.net/dear-diary?retryWrites=true&w=majority
   MONGO_DB=dear-diary
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   PORT=4000
   ```

7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy your backend URL**: `https://dear-diary-backend.onrender.com`

### **Option B: Deploy to Railway (Alternative - Free)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (same as above)
6. Railway will auto-detect and deploy

---

## **Step 3: Deploy Frontend to Netlify**

### **3.1 Update Frontend API URL**

**BEFORE deploying**, update your frontend to use the deployed backend URL:

1. **Edit `src/api.ts`** (or wherever you create axios instance):
   ```typescript
   const API_URL = process.env.REACT_APP_API_URL || 'https://dear-diary-backend.onrender.com/api';
   ```

2. **Commit the change**:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

### **3.2 Deploy to Netlify**

1. **Go to https://netlify.com**
2. **Sign up/Login** with GitHub
3. **Click "Add new site" → "Import an existing project"**
4. **Choose GitHub** and authorize
5. **Select your repository**: `dear-diary-expense-tracker`
6. **Configure build settings:**
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

7. **Add Environment Variables** (Site settings → Environment variables):
   ```
   REACT_APP_API_URL=https://dear-diary-backend.onrender.com/api
   ```

8. **Click "Deploy site"**
9. **Wait for deployment** (2-5 minutes)

### **3.3 Get Your Netlify URL**
- Your site will be at: `https://random-name-12345.netlify.app`
- You can change it: **Site settings → Domain management → Change site name**
- Example: `https://dear-diary-expense.netlify.app`

---

## **Step 4: Update Backend CORS**

After getting your Netlify URL, update the backend environment variable:

1. **Go to Render dashboard**
2. **Select your backend service**
3. **Environment → Edit**
4. **Update `CORS_ORIGIN`**:
   ```
   CORS_ORIGIN=https://dear-diary-expense.netlify.app
   ```
5. **Save** (this will redeploy the backend)

---

## **Step 5: Add Custom Domain (Optional)**

### **Buy a domain** (e.g., from Namecheap, GoDaddy, Google Domains)
- Example: `deardiaryexpense.com`

### **Connect to Netlify:**
1. **Netlify Dashboard** → Your site → **Domain settings**
2. **Add custom domain** → Enter your domain
3. **Follow DNS instructions** to point your domain to Netlify
4. **Enable HTTPS** (automatic with Netlify)

### **Update Backend CORS again:**
```
CORS_ORIGIN=https://deardiaryexpense.com
```

---

## **Step 6: MongoDB Atlas - Whitelist IPs**

Your backend will have a new IP address. Update MongoDB Atlas:

1. **Go to https://cloud.mongodb.com**
2. **Network Access** → **Add IP Address**
3. **Allow Access from Anywhere**: `0.0.0.0/0` (for testing)
4. Or add specific Render/Railway IPs (check their docs)

---

## **Step 7: Test Your Deployed App**

1. **Visit your Netlify URL**
2. **Register a new account**
3. **Test all features:**
   - ✅ Login/Register
   - ✅ Add expenses
   - ✅ Forum posts
   - ✅ Admin panel
   - ✅ Profanity detection

---

## **Troubleshooting**

### **Backend not connecting to MongoDB**
- Check MongoDB Atlas IP whitelist
- Verify `MONGO_URI` in Render environment variables

### **Frontend can't reach backend**
- Check `REACT_APP_API_URL` in Netlify
- Check `CORS_ORIGIN` in Render
- Open browser DevTools → Network tab to see errors

### **500 errors on backend**
- Check Render logs: Dashboard → Your service → Logs
- Look for MongoDB connection errors

---

## **Quick Commands Reference**

### **Push updates to GitHub:**
```bash
git add .
git commit -m "Your commit message"
git push
```

### **Netlify auto-deploys** when you push to GitHub!

### **Render auto-deploys** when you push to GitHub!

---

## **Your URLs After Deployment**

- **Frontend**: `https://dear-diary-expense.netlify.app`
- **Backend**: `https://dear-diary-backend.onrender.com`
- **API Endpoint**: `https://dear-diary-backend.onrender.com/api`

---

## **Cost**

- **MongoDB Atlas**: Free (512MB)
- **Render**: Free (sleeps after 15min inactivity)
- **Netlify**: Free (100GB bandwidth/month)
- **Domain** (optional): ~$10-15/year

**Total**: **FREE** (or ~$10/year with custom domain)

---

## **Important Notes**

⚠️ **NEVER commit `.env` files to GitHub!** (already in `.gitignore`)

⚠️ **Change `JWT_SECRET`** to a strong random string in production

⚠️ **Render free tier sleeps** after 15 minutes of inactivity (first request takes ~30 seconds to wake up)

✅ **MongoDB Atlas connection** should be stable on Render (better than local development)

---

Good luck with your deployment! 🚀
