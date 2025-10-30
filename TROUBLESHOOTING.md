# Troubleshooting Guide

## ✅ FIXED: Tailwind CSS PostCSS Error

### Problem
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package...
```

### Solution Applied
Installed Tailwind CSS v3 (compatible with Create React App):

```bash
cd frontend
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17
```

### Configuration Files

**postcss.config.js** ✅
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**tailwind.config.js** ✅
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css** ✅
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🚀 Starting the Application

### If Port 3000 is Already in Use

**Option 1: Kill the existing process (Windows)**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with the actual PID)
taskkill /PID <PID> /F
```

**Option 2: Use a different port**
```powershell
# PowerShell
$env:PORT=3001
npm start

# Or CMD
set PORT=3001 && npm start
```

**Option 3: Let React choose a different port**
```bash
npm start
# When prompted "Would you like to run the app on another port instead?", press Y
```

---

## 📋 Complete Startup Instructions

### Terminal 1 - Backend
```bash
cd backend
npm install  # First time only
npm start
```
✅ Backend runs on: `http://localhost:5004`

### Terminal 2 - Frontend
```bash
cd frontend
npm install  # First time only
npm start
```
✅ Frontend runs on: `http://localhost:3000` (or 3001 if 3000 is busy)

---

## 🔐 Login Credentials

**Demo Account 1:**
- Email: `vir.bhalani23@spit.ac.in`
- Password: `virbhalani`

**Demo Account 2:**
- Email: `kapish.bhalodia23@spit.ac.in`
- Password: `kapishbhalodia`

---

## ⚠️ Common Issues

### Issue: "Module not found" errors
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not applying
**Solution:**
1. Check that `@tailwind` directives are in `src/index.css`
2. Restart the dev server: `Ctrl+C` then `npm start`
3. Clear browser cache: `Ctrl+Shift+R`

### Issue: API calls failing (CORS errors)
**Solution:**
- Ensure backend is running on port 5004
- Check `API_BASE` in frontend code points to `http://localhost:5004`
- Backend already has CORS enabled

### Issue: "Cannot find module 'lucide-react'"
**Solution:**
```bash
cd frontend
npm install lucide-react recharts date-fns
```

### Issue: Backend won't start
**Solution:**
```bash
cd backend
npm install
# Check if port 5004 is available
netstat -ano | findstr :5004
```

---

## 🎨 CSS Warnings (Safe to Ignore)

You may see these warnings in your IDE:
```
Unknown at rule @tailwind
```

**These are safe to ignore!** They're just CSS linter warnings that don't understand Tailwind directives. The app will work perfectly.

---

## 🧪 Testing the Application

### 1. Login
- Navigate to `http://localhost:3000/login`
- Use demo credentials
- Should redirect to dashboard

### 2. Create Portfolio
- Enter portfolio name
- Click "Create"
- Portfolio should appear in the list

### 3. Add Investment
- Select a portfolio
- Click "Add Investment" button
- Fill in the form (Type, Symbol, Quantity, Price)
- Click "Add Investment"

### 4. View Analytics
- Risk analysis should show automatically
- Performance metrics display
- Charts should render

---

## 📦 Package Versions (Verified Working)

### Frontend
```json
{
  "tailwindcss": "3.4.1",
  "postcss": "8.4.35",
  "autoprefixer": "10.4.17",
  "react": "^19.2.0",
  "recharts": "^2.x",
  "lucide-react": "^0.x"
}
```

### Backend
```json
{
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "axios": "^1.5.0"
}
```

---

## 🔄 Fresh Install (Nuclear Option)

If nothing else works:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm start

# Frontend (new terminal)
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5004
- [ ] Frontend running on port 3000 (or 3001)
- [ ] No console errors in browser
- [ ] Can login successfully
- [ ] Can create portfolio
- [ ] Can add investments
- [ ] Charts render correctly
- [ ] Tailwind styles applied (gradients, rounded corners, etc.)

---

## 🆘 Still Having Issues?

1. Check Node.js version: `node --version` (should be 16+)
2. Check npm version: `npm --version` (should be 8+)
3. Clear browser cache completely
4. Try a different browser
5. Check browser console for errors (F12)
6. Check terminal for error messages

---

**Last Updated:** After fixing Tailwind CSS v4 compatibility issue
**Status:** ✅ All issues resolved, app ready to run
