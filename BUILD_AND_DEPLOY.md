# BANF PWA - Build & Deploy Guide

## Overview

The BANF Progressive Web App (PWA) is a lightweight, installable web application that works on **both iOS and Android** — no app store fees required. Users can "Add to Home Screen" and it behaves like a native app.

## Project Structure

```
pwa/
├── index.html          # SPA shell (single page app)
├── manifest.json       # Web app manifest (installability)
├── sw.js               # Service worker (offline + caching)
├── css/
│   └── app.css         # Complete stylesheet with dark mode
├── js/
│   ├── api.js          # API service + auth storage
│   ├── radio.js        # Radio streaming player
│   ├── router.js       # Hash-based SPA router
│   ├── pages.js        # All 13 page renderers
│   └── app.js          # Main initialization
├── icons/
│   ├── icon.svg        # Source SVG icon
│   └── (generated PNGs)
└── BUILD_AND_DEPLOY.md # This file
```

## Features

- **Installable** — Add to Home Screen on iOS & Android
- **Offline Support** — Service worker caches static assets
- **Radio Streaming** — Live radio with lock screen controls
- **Events** — Browse, search, filter, and register
- **Magazine** — Read digital issues
- **Dark Mode** — Automatic based on system preference
- **Push Notifications** — Event reminders (where supported)
- **No App Store Fees** — Completely free to publish

---

## Step 1: Generate Icon PNGs

The PWA needs PNG icons at multiple sizes. Use the SVG source to generate them.

### Option A: Online Tool (Easiest)
1. Go to https://realfavicongenerator.net
2. Upload `icons/icon.svg`
3. Download the generated package
4. Copy the PNG files to `pwa/icons/`

### Option B: Using ImageMagick (CLI)
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick

cd pwa/icons

for size in 72 96 128 144 152 192 384 512; do
  magick icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

### Option C: Using Sharp (Node.js)
```bash
npm install sharp
```
```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of sizes) {
  sharp('icons/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`icons/icon-${size}x${size}.png`);
}
```

Required sizes: `72, 96, 128, 144, 152, 192, 384, 512`

---

## Step 2: Choose a Hosting Platform

PWAs require **HTTPS** to work. Here are free hosting options:

### Option A: GitHub Pages (Recommended — Free)

1. Create a new repo or use existing:
   ```bash
   cd pwa
   git init
   git add .
   git commit -m "BANF PWA initial commit"
   ```

2. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/banf-pwa.git
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to repo → Settings → Pages
   - Source: Deploy from branch → `main` → `/ (root)`
   - Save

4. Your PWA will be available at:
   ```
   https://YOUR_USERNAME.github.io/banf-pwa/
   ```

5. **Custom Domain (Optional):**
   - In repo Settings → Pages → Custom domain
   - Enter `app.jaxbengali.org`
   - Add CNAME record in your DNS

### Option B: Netlify (Free Tier)

1. Go to https://netlify.com
2. Drag & drop the `pwa/` folder
3. Get a free URL like `banf-pwa.netlify.app`
4. Optionally connect a custom domain

### Option C: Vercel (Free Tier)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy:
   ```bash
   cd pwa
   vercel
   ```

### Option D: Embed in Wix Site

1. In Wix Editor, add a new page (e.g., `/app`)
2. Add an HTML iFrame element
3. Set the source to your hosted PWA URL
4. Or use Wix's custom code to serve the PWA files

---

## Step 3: Update API URLs

If hosting on a different domain than `jaxbengali.org`, you may need to update CORS settings in the Wix backend.

In `js/api.js`, the API URLs are:
```javascript
const PRIMARY_URL = 'https://www.jaxbengali.org/_functions';
const FALLBACK_URL = 'https://banfwix.wixsite.com/banf1/_functions';
```

Ensure your Wix site allows CORS from your PWA domain.

### Adding CORS in Wix (if needed)

In Wix backend `http-functions.js`, ensure headers include:
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

---

## Step 4: Test the PWA

### Local Testing
```bash
# Option 1: Python
cd pwa
python -m http.server 8080

# Option 2: Node.js
npx serve pwa

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Visit `http://localhost:8080` in Chrome.

### PWA Checklist (Chrome DevTools)

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check:
   - ✅ Manifest loads correctly
   - ✅ Service Worker is registered
   - ✅ "Installable" appears in Manifest section
4. Go to **Lighthouse** tab
5. Run PWA audit — aim for all green checks

### Install Testing

- **Android Chrome:** Menu → "Add to Home Screen" or install banner
- **iOS Safari:** Share button → "Add to Home Screen"
- **Desktop Chrome:** Install icon in address bar

---

## Step 5: Set Up Custom Domain (Optional)

For a professional URL like `app.jaxbengali.org`:

### DNS Configuration
Add a CNAME record:
```
Type: CNAME
Name: app
Value: YOUR_USERNAME.github.io (or netlify/vercel domain)
```

### Update manifest.json
Change `start_url` and `scope` if needed:
```json
{
  "start_url": "https://app.jaxbengali.org/",
  "scope": "https://app.jaxbengali.org/"
}
```

---

## Step 6: Share with Users

### Installation Instructions for Users

**Android:**
1. Open Chrome browser
2. Go to `https://YOUR-PWA-URL`
3. Tap "Add to Home Screen" when prompted
4. Or tap ⋮ menu → "Install app"

**iPhone/iPad:**
1. Open Safari browser
2. Go to `https://YOUR-PWA-URL`
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add"

**Desktop:**
1. Open Chrome
2. Go to `https://YOUR-PWA-URL`
3. Click the install icon (⊕) in the address bar

---

## PWA vs Native App Comparison

| Feature | PWA | iOS App | Android App |
|---------|-----|---------|-------------|
| **Cost** | Free | $99/year | $25 one-time |
| **Install** | Browser | App Store | Play Store |
| **Updates** | Instant | Review required | Review required |
| **Offline** | ✅ Cached | ✅ Full | ✅ Full |
| **Push Notifications** | ✅ Android/Desktop, ❌ iOS* | ✅ | ✅ |
| **Camera/GPS** | ✅ | ✅ | ✅ |
| **Background Audio** | ⚠️ Limited | ✅ | ✅ |
| **App Store Presence** | ❌ | ✅ | ✅ |

*iOS 16.4+ supports push notifications for PWAs added to Home Screen

---

## Maintenance

### Updating the PWA
1. Edit the files in the `pwa/` directory
2. **Important:** Update the cache version in `sw.js`:
   ```javascript
   const CACHE_NAME = 'banf-pwa-v2'; // Increment version
   ```
3. Push to your hosting platform
4. Users will get the update automatically on next visit

### Monitoring
- Use Chrome DevTools → Application → Service Workers to debug
- Check Console for API errors
- Use Lighthouse for periodic PWA audits

---

## Quick Deploy Summary

```bash
# 1. Generate icons
cd pwa/icons
# (use one of the methods above)

# 2. Test locally
cd pwa
npx serve .

# 3. Deploy to GitHub Pages
git init
git add .
git commit -m "BANF PWA"
git remote add origin https://github.com/YOUR_USERNAME/banf-pwa.git
git push -u origin main
# Then enable Pages in repo settings

# Done! Your PWA is live at:
# https://YOUR_USERNAME.github.io/banf-pwa/
```

**Total cost: $0** 🎉
