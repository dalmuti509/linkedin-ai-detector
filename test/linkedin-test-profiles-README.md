# LinkedIn Test Profiles - Extension Testing

## Overview
This test page simulates different LinkedIn profile scenarios so you can test the LinkedIn AI Detector extension on various profile types. You can switch between different profiles to see how the extension behaves.

## How to Use

### 1. **Load the Extension**
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode" if not already enabled
- Click "Load unpacked" and select the extension folder
- The extension should now be loaded and active

### 2. **Navigate to Test Page**
- Open `test/linkedin-test-profiles.html` in your browser
- The page will load with a "Normal Profile" by default

### 3. **Switch Between Profile Types**
- Use the colored buttons at the top to switch between different profile scenarios:
  - **Normal Profile** (Gray): Regular profile, no overlays expected
  - **Suspicious Profile** (Red): AI bot indicators, should show red robot overlay
  - **Verified Profile** (Green): Legitimate profile, should show green checkmark
  - **Test Mode Profile** (Yellow): Name starts with 'A', should show test mode overlay
  - **Mixed Scenarios** (Blue): Overview of all profile types

### 4. **Test Extension Features**
- **Watch for overlays**: The extension should add overlay icons to suspicious/verified profiles
- **Test popup dialogs**: Click on flagged profiles to see popup dialogs
- **Enable test mode**: Use the extension popup to enable test mode and see names starting with 'A' flagged
- **Check console logs**: Open browser dev tools to see extension debugging information

## Profile Types

### 🔵 **Normal Profile**
- **Name**: John Smith
- **Title**: Marketing Manager at TechCorp
- **Location**: Chicago, IL
- **Connections**: 50+
- **Profile Age**: 2 years
- **Expected Result**: No overlay (normal profile)

### 🔴 **Suspicious Profile**
- **Name**: Alex Thompson
- **Title**: Software Engineer
- **Location**: New York, NY
- **Connections**: 3
- **Profile Age**: 5 days
- **Suspicious Indicators**:
  - Very new profile (5 days)
  - Very low connections (3)
  - Location mismatch (NY vs company in SF)
- **Expected Result**: Red robot overlay (⚠️) - AI bot detected

### 🟢 **Verified Profile**
- **Name**: Sarah Johnson
- **Title**: Senior Software Engineer at Microsoft
- **Location**: Seattle, WA
- **Connections**: 500+
- **Profile Age**: 3 years
- **Verified Indicators**:
  - Established profile (3 years)
  - High connection count (500+)
  - Location consistency (Seattle matches company)
- **Expected Result**: Green checkmark overlay (✓) - Verified profile

### 🟡 **Test Mode Profile**
- **Name**: Alexander Smith
- **Title**: Software Engineer at Google
- **Location**: Mountain View, CA
- **Connections**: 200+
- **Profile Age**: 2 years
- **Test Mode Indicator**: Name starts with 'A'
- **Expected Result**: Test mode overlay (🧪) - Flagged for testing

## Extension Features to Test

### **Overlay Icons**
- **Red robot (⚠️)**: Appears on suspicious profiles
- **Green checkmark (✓)**: Appears on verified profiles
- **Test mode (🧪)**: Appears on profiles with names starting with 'A' when test mode is enabled
- **Positioning**: Top-right corner of profile avatars
- **Animation**: Pulsing effect to draw attention

### **Popup Dialogs**
- **Trigger**: Click on flagged profiles
- **Content**: Detailed explanation of why profile is considered suspicious
- **Actions**: "Go Back" or "Continue" buttons
- **Behavior**: Prevents page interaction until user makes choice

### **Test Mode**
- **Enable**: Use extension popup to toggle test mode
- **Effect**: Flags profiles with names starting with 'A'
- **Override**: Works regardless of other indicators
- **Visual**: Shows test mode overlay icon

## Testing Scenarios

### **Scenario 1: Basic Detection**
1. Load the test page
2. Switch to "Suspicious Profile"
3. Watch for red robot overlay
4. Check console for detection logs

### **Scenario 2: Verified Detection**
1. Switch to "Verified Profile"
2. Watch for green checkmark overlay
3. Verify no suspicious indicators

### **Scenario 3: Test Mode**
1. Enable test mode in extension popup
2. Switch to "Test Mode Profile"
3. Watch for test mode overlay
4. Disable test mode and verify overlay disappears

### **Scenario 4: Popup Dialog**
1. Switch to "Suspicious Profile"
2. Click on the profile to trigger popup
3. Test "Go Back" and "Continue" buttons
4. Verify popup closes and page interaction resumes

### **Scenario 5: Mixed Scenarios**
1. Switch between different profile types
2. Observe how overlays appear/disappear
3. Test extension behavior across different scenarios

## Debugging

### **Console Logs**
Open browser dev tools (F12) and check the console for:
- Extension loading messages
- Profile detection logs
- Overlay application logs
- Error messages

### **Common Issues**
- **No overlays appearing**: Check if extension is loaded and active
- **Overlays not positioned correctly**: Check CSS selectors in extension
- **Popup not working**: Check if popup dialog is being created
- **Test mode not working**: Check if test mode is enabled in extension popup

### **Extension Status**
- Check `chrome://extensions/` to ensure extension is loaded
- Look for any error messages in the extension details
- Verify the extension has the correct permissions

## Technical Details

### **HTML Structure**
The test page uses LinkedIn-style HTML structure:
- `.pv-top-card`: Main profile card
- `.pv-top-card__photo`: Profile photo section
- `.pv-top-card-profile-picture__image`: Profile image
- `.pv-top-card__title`: Profile name
- `.pv-top-card__headline`: Job title
- `.pv-top-card__location`: Location
- `.pv-top-card__connections`: Connection count
- `.pv-top-card__joined-date`: Profile creation date

### **CSS Classes**
The extension looks for specific CSS classes:
- Profile photo selectors
- Name and title selectors
- Location and connection selectors
- Menu and button selectors

### **Data Attributes**
Profile information is extracted from:
- Image alt text
- Text content of specific elements
- Data attributes
- Aria labels

## Troubleshooting

### **Extension Not Working**
1. Check if extension is loaded in `chrome://extensions/`
2. Verify extension has correct permissions
3. Check console for error messages
4. Try reloading the extension

### **Overlays Not Appearing**
1. Check if profile selectors match the test page structure
2. Verify extension is detecting the profile correctly
3. Check console logs for detection messages
4. Ensure extension is running on the correct page

### **Popup Not Working**
1. Check if popup dialog is being created
2. Verify popup CSS is loaded
3. Check for JavaScript errors
4. Ensure popup is positioned correctly

## Future Enhancements

Potential improvements:
- **Real-time profile switching**: Update profile data dynamically
- **More profile types**: Add additional test scenarios
- **Performance testing**: Test extension with multiple profiles
- **Accessibility testing**: Ensure overlays are accessible
- **Mobile testing**: Test extension on mobile devices
