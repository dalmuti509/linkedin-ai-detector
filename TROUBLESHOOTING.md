# 🔧 LinkedIn AI Detector - Troubleshooting Guide

## Quick Debugging Steps

### 1. **Check Extension is Loaded**
1. Go to `chrome://extensions/`
2. Make sure "LinkedIn AI Bot Detector" is **enabled** (toggle ON)
3. Check for any error messages in red

### 2. **Test on LinkedIn**
1. Go to **LinkedIn.com** (www.linkedin.com)
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Look for these messages:
   - `🚀 LinkedIn AI Detector initialized`
   - `🔍 Scanning for profiles...`
   - `🔍 Total profile elements found: X`

### 3. **Enable Test Mode**
1. Click the **extension icon** in Chrome toolbar
2. Toggle **"Test Mode"** ON
3. This will flag ALL profiles with names starting with 'A'
4. Refresh LinkedIn page
5. Look for red 🤖 icons on profiles

### 4. **Manual Test**
In the Console, type:
```javascript
testLinkedInDetector()
```
This will manually trigger a scan.

### 5. **Check Console Logs**
Look for these debug messages:
- `🔍 Scanning for profiles...`
- `Found X elements with selector: ...`
- `🔍 Processing profile element:`
- `📋 Profile info extracted:`
- `🎯 Adding overlay icon to element:`

## Common Issues & Solutions

### Issue 1: Extension Not Loading
**Symptoms:** No console messages, extension icon not visible
**Solution:**
1. Reload the extension in `chrome://extensions/`
2. Check manifest.json syntax
3. Ensure all files are in the correct folder

### Issue 2: No Profile Elements Found
**Symptoms:** Console shows "Total profile elements found: 0"
**Solution:**
1. Make sure you're on LinkedIn.com
2. Wait for page to fully load
3. Try scrolling to load more content
4. Check if LinkedIn has changed their HTML structure

### Issue 3: Elements Found But No Icons
**Symptoms:** Console shows elements found but no overlay icons
**Solution:**
1. Check if CSS is loading properly
2. Look for console errors
3. Try test mode to see if basic functionality works

### Issue 4: Icons Not Visible
**Symptoms:** Console shows icons being added but not visible
**Solution:**
1. Check if parent containers have `position: relative`
2. Look for z-index conflicts
3. Try refreshing the page

## Debug Commands

### Check Extension Status
```javascript
// In console
console.log('Detector instance:', window.linkedinAIDetector);
```

### Force Rescan
```javascript
// In console
window.testLinkedInDetector();
```

### Check Processed Profiles
```javascript
// In console
console.log('Processed profiles:', window.linkedinAIDetector.processedProfiles.size);
```

### Enable Test Mode via Console
```javascript
// In console
window.linkedinAIDetector.testMode = true;
window.linkedinAIDetector.detectAIBots();
```

## Expected Behavior

### Test Mode ON:
- ALL profiles with names starting with 'A' should show red 🤖 icon
- Console should show: `🧪 Test mode: Flagging profile with name starting with A`

### Normal Mode:
- Profiles meeting 2+ suspicious criteria show red 🤖 icon
- Profiles meeting 3+ positive criteria show green ✓ icon
- Console should show detection reasoning

## Still Not Working?

1. **Check file permissions** - Make sure all files are readable
2. **Verify file paths** - Ensure all files are in the correct directory
3. **Check Chrome version** - Extension requires Chrome 88+
4. **Try incognito mode** - Disable other extensions that might interfere
5. **Check LinkedIn changes** - LinkedIn frequently updates their HTML structure

## Contact Support

If none of these steps work, please provide:
1. Console log output
2. Chrome version
3. LinkedIn page URL where you're testing
4. Any error messages
