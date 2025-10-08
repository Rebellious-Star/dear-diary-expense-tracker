# Testing Guide - Forum & Authentication

## Problem X Fix: Registration/Login Issues After Clearing Database

### Root Cause
When you clear the database using `clearUsers.js`, the backend server keeps running with cached connections. This causes "user already exists" errors even though the database is empty.

### Solution: Always Restart Backend After Clearing Database

## Complete Testing Workflow

### Step 1: Reset Database
```bash
cd server
node resetDatabase.js
```

This will:
- Clear all users
- Clear all forum posts
- Verify the deletion
- Remind you to restart the server

### Step 2: Restart Backend Server
**CRITICAL**: You MUST restart your backend server after clearing the database.

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Clear Browser Data (Optional but Recommended)
- Clear localStorage in browser DevTools
- Or use incognito/private window

### Step 4: Test Registration Flow
1. Register admin account (first account becomes admin automatically)
   - Email: `dhruveloper2005@gmail.com`
   - Username: `AdminDD`
   - Password: your choice

2. Logout

3. Register user account
   - Email: `dhruvpandeyofficial03@gmail.com`
   - Username: `JojoBa`
   - Password: your choice

### Step 5: Test Forum Profanity Detection
1. Login as user account
2. Post profanity once → Should show **Warning 1/3** (post NOT created)
3. Post profanity again → Should show **24-hour ban** (post NOT created)
4. Try to post anything → Should show "You are banned" message
5. Logout

### Step 6: Test Admin Login
1. Login as admin account
2. Should login successfully
3. Check forum - should see no profanity posts (they were blocked)

### Step 7: Test Post Deletion
1. Create a normal post as admin
2. Click delete
3. Post should be removed from database
4. Other posts should remain visible

## Expected Behavior

### Profanity Detection (FIXED)
- ✅ First profanity: Warning shown, post NOT created
- ✅ Second profanity: 24-hour ban, post NOT created
- ✅ Third profanity: Permanent ban, post NOT created
- ✅ Banned users cannot post or reply

### Login/Registration (FIXED)
- ✅ After clearing database and restarting server, registration works
- ✅ Login works with correct credentials
- ✅ Ban status is checked on login
- ✅ Expired bans are automatically lifted

### Post Deletion (FIXED)
- ✅ Deleting a post removes it from database
- ✅ Other posts remain visible
- ✅ Only post author or admin can delete

## Common Issues

### "Email already exists" after clearing database
**Solution**: Restart your backend server

### "Invalid credentials" for existing account
**Solution**: Restart your backend server after clearing database

### Profanity posts still being created
**Solution**: Clear browser cache and reload the page

### All posts disappear when deleting one
**Solution**: This was fixed - posts now have proper IDs from backend

## Quick Commands

```bash
# Full reset (from server directory)
node resetDatabase.js

# Clear users only
node clearUsers.js

# Restart backend
npm run dev

# Check what's in database
node clearUsers.js
# (Don't worry, it shows before deleting)
```

## Notes
- Forum bans do NOT prevent login (by design)
- Banned users can login but cannot post/reply
- First registered user automatically becomes admin
- Ban status syncs from backend on forum page load
