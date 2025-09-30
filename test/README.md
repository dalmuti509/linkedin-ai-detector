# LinkedIn AI Detector - Test Suite

This directory contains comprehensive testing tools for the LinkedIn AI Bot Detector Chrome Extension.

## Test Files

### 1. `download-page.html`
- **Purpose**: Download and clean LinkedIn profile pages for offline testing
- **Usage**: Open in browser, enter LinkedIn profile URL, download cleaned HTML
- **Features**:
  - Removes tracking scripts and external resources
  - Replaces external images with placeholders
  - Adds mock Chrome APIs for testing
  - Preserves LinkedIn's DOM structure

### 2. `test-suite.html`
- **Purpose**: Comprehensive automated testing suite
- **Usage**: Open in browser, click "Setup Test Environment", then "Run All Tests"
- **Tests**:
  - Extension loading and initialization
  - Profile detection logic
  - AI bot detection algorithm
  - Verified profile detection
  - Test mode functionality
  - Overlay icon system
  - Page scope and performance

### 3. `offline-test.html`
- **Purpose**: Interactive offline testing environment
- **Usage**: Open in browser, use controls to simulate different profile scenarios
- **Features**:
  - Mock LinkedIn profile page
  - Interactive test controls
  - Real-time profile data modification
  - Extension integration testing

## Test Elements Being Validated

### 1. Extension Loading & Initialization
- ✅ Content script loads without errors
- ✅ Chrome APIs are properly mocked
- ✅ Extension popup opens correctly
- ✅ Settings are loaded from storage

### 2. Profile Detection Logic
- ✅ Main profile photo is correctly identified
- ✅ Profile information extraction (name, title, location, connections)
- ✅ Profile age calculation from LinkedIn date formats
- ✅ Connection count parsing
- ✅ Location matching between profile and company

### 3. AI Bot Detection Algorithm
- ✅ Profile age < 30 days triggers suspicion
- ✅ Connection count < 10 triggers suspicion
- ✅ Location mismatch between profile and company
- ✅ Suspicious pattern detection (generic names, titles)
- ✅ Threshold logic (2+ indicators = AI bot)

### 4. Verified Profile Detection
- ✅ Profile age > 1 year indicates legitimacy
- ✅ High connection count (>500) indicates legitimacy
- ✅ Location consistency between profile and company
- ✅ Professional title keywords detection
- ✅ Threshold logic (3+ indicators = verified)

### 5. Test Mode Functionality
- ✅ Names starting with 'A' are flagged in test mode
- ✅ Test mode toggle works correctly
- ✅ Test mode state persists across page reloads

### 6. Overlay Icon System
- ✅ Red robot icon (🤖) appears for AI bots
- ✅ Green checkmark (✅) appears for verified profiles
- ✅ Overlays are positioned correctly on profile photos
- ✅ Overlays don't duplicate on re-scans
- ✅ Overlays are removed when conditions change

### 7. Page Scope & Performance
- ✅ Detection only runs on profile pages (/in/ URLs)
- ✅ Sidebar and header elements are ignored
- ✅ Single profile evaluation per page
- ✅ Logging is throttled to once per minute
- ✅ No false positives on legitimate profiles

## Running Tests

### Quick Test
1. Open `offline-test.html` in your browser
2. Use the test controls to simulate different scenarios
3. Verify overlays appear correctly

### Comprehensive Test
1. Open `test-suite.html` in your browser
2. Click "Setup Test Environment"
3. Click "Run All Tests"
4. Review test results and fix any failures

### Offline Profile Testing
1. Open `download-page.html` in your browser
2. Enter a LinkedIn profile URL
3. Download the cleaned HTML
4. Open the downloaded file to test with real LinkedIn structure

## Test Scenarios

### AI Bot Profile
- **Name**: Alex Smith
- **Age**: 5 days
- **Connections**: 3
- **Location**: New York
- **Company**: Tech Corp · San Francisco
- **Expected**: Red 🤖 overlay

### Verified Profile
- **Name**: Sarah Johnson
- **Age**: 2 years
- **Connections**: 750
- **Location**: Seattle
- **Company**: Microsoft · Seattle
- **Title**: Senior Software Engineer
- **Expected**: Green ✅ overlay

### Test Mode Profile
- **Name**: Andrew Wilson (starts with 'A')
- **Age**: 1 year
- **Connections**: 200
- **Location**: Boston
- **Company**: Google · Boston
- **Expected**: Red 🤖 overlay (when test mode is ON)

## Troubleshooting

### Extension Not Loading
- Check browser console for errors
- Ensure all files are in correct directory structure
- Verify Chrome APIs are properly mocked

### Overlays Not Appearing
- Check if profile page detection is working
- Verify overlay CSS is loaded
- Test with different profile scenarios

### False Positives/Negatives
- Adjust detection thresholds in content.js
- Test with various profile types
- Verify test mode functionality

## Mock Data

The test suite includes mock profiles with known characteristics to validate detection logic:

- **Suspicious indicators**: New profile, few connections, location mismatch
- **Verified indicators**: Established profile, many connections, location consistency
- **Test mode triggers**: Names starting with 'A'

## Performance Testing

- Extension loads within 2 seconds
- Detection completes within 1 second
- No memory leaks during repeated scans
- Logging throttled to prevent console spam
