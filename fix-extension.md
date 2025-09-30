# 🔧 Fix Extension Loading Issues

## The `chrome-extension://invalid/` Error Fix

This error usually means the extension isn't loading properly. Follow these steps:

### Step 1: Remove and Reload Extension
1. Go to `chrome://extensions/`
2. Find "LinkedIn AI Bot Detector"
3. Click **"Remove"** to uninstall it
4. Click **"Load unpacked"** again
5. Select the folder: `C:\Users\dalmu\repo\linkedin-ai-detector`

### Step 2: Check for Errors
After reloading, look for any red error messages in the extensions page.

### Step 3: Verify Files
Make sure all these files exist in the extension folder:
- ✅ manifest.json
- ✅ content.js
- ✅ background.js
- ✅ popup.html
- ✅ popup.js
- ✅ popup.css
- ✅ styles.css
- ✅ icons/icon16.png
- ✅ icons/icon48.png
- ✅ icons/icon128.png

### Step 4: Test Basic Functionality
1. Go to LinkedIn.com
2. Open Developer Tools (F12)
3. Check Console for: `🚀 LinkedIn AI Detector initialized`
4. Enable Test Mode in extension popup
5. Look for red 🤖 icons on profiles with names starting with 'A'

## Common Causes of This Error:

1. **Missing files** - Extension can't find required files
2. **Invalid manifest** - JSON syntax errors
3. **Permission issues** - Chrome can't access files
4. **Corrupted extension** - Files got corrupted during copy

## If Still Not Working:

1. **Try a different folder** - Copy extension to a new location
2. **Check file permissions** - Make sure Chrome can read all files
3. **Restart Chrome** - Sometimes Chrome needs a restart
4. **Check Chrome version** - Ensure you're using Chrome 88+

## Quick Test:
After reloading, go to LinkedIn and run this in the console:
```javascript
console.log('Extension loaded:', !!window.linkedinAIDetector);
```
