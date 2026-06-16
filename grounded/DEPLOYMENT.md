# Grounded - Deployment Guide

Your fitness coaching platform is ready to deploy. Here's how to get it live in 15 minutes.

## What You Need

1. **GitHub account** (free) — to store your code
2. **Firebase account** (free) — database for your data
3. **Netlify account** (free) — hosting
4. **Claude API key** — for Coach ($0.01-0.05 per message)

## Step 1: Set Up Firebase (5 min)

1. Go to https://console.firebase.google.com
2. Click "Create a project" → name it "Grounded"
3. Enable Firestore Database (free tier)
4. Go to Project Settings (gear icon, top right)
5. Click "Service Accounts" tab
6. Click "Generate new private key"
7. A JSON file downloads — **save this, you'll need it**
8. Copy your Database URL from "Realtime Database" section (looks like: https://xxx.firebaseio.com)

## Step 2: Push Code to GitHub (5 min)

1. Go to https://github.com/new
2. Create a new repository named "grounded"
3. Follow the instructions to push code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/grounded.git
   git push -u origin main
   ```

## Step 3: Deploy to Netlify (3 min)

1. Go to https://app.netlify.com
2. Click "Connect to Git Repository"
3. Select GitHub → authorize → select "grounded" repo
4. Build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: . (current directory)
5. Click "Deploy site"

## Step 4: Add Environment Variables (2 min)

1. In Netlify, go to **Site settings** → **Build & deploy** → **Environment**
2. Click "Edit variables"
3. Add these variables:
   - **Name**: `ANTHROPIC_API_KEY` → **Value**: your Claude API key (get from https://console.anthropic.com/account/keys)
   - **Name**: `FIREBASE_CONFIG` → **Value**: Paste the entire JSON from the Firebase key file
   - **Name**: `FIREBASE_DB_URL` → **Value**: Your Firebase database URL

4. **Redeploy**: Go to "Deploys" tab, click "Trigger deploy" → "Deploy site"

## Step 5: Set Up Claude API (optional, but recommended)

1. Go to https://console.anthropic.com
2. Create an account (free, requires credit card for billing)
3. Go to API keys → Create new key
4. Copy it and add to Netlify environment variables (step above)

## You're Done!

Your app is live at: `https://xxx.netlify.app`

**Your data:**
- Automatically saved to Firebase
- Private and secure
- You own it completely
- Backs up in Firebase

**Coach:**
- Reads your weekly data
- Calls Claude API securely
- Remembers your conversations
- Costs ~$1.50-2/month if used daily

## Troubleshooting

**Coach says "Error"?**
- Check that `ANTHROPIC_API_KEY` is set in Netlify environment
- Redeploy the site

**Data not saving?**
- Check that `FIREBASE_CONFIG` and `FIREBASE_DB_URL` are in Netlify environment
- Open browser DevTools (F12) → Console tab → look for errors

**Need help?**
- Check Netlify build logs (Deploys tab)
- Check Firebase Firestore (any data collections created?)

## Cost Breakdown

- **Netlify**: $0 (generous free tier)
- **Firebase**: $0 (free tier covers everything)
- **Claude API**: ~$1.50-2/month (if using Coach daily)
- **Custom domain**: Optional, $12/year

## Next Steps

Once it's live:
1. Open your app URL on your phone
2. Start logging your daily workouts
3. Try Coach with "Analyze this week" on Sunday
4. Download your data backup from the Sunday tab

You've got this.
