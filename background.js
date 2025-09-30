// LinkedIn AI Bot Detector Background Script
console.log('LinkedIn AI Bot Detector background script loaded');

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details);
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    showNotifications: true,
    detectionSensitivity: 'medium',
    customPatterns: [],
    whitelist: []
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'aiBotDetected':
      handleAIBotDetection(request.data, sender);
      break;
    case 'getSettings':
      getSettings(sendResponse);
      break;
    case 'updateSettings':
      updateSettings(request.settings, sendResponse);
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

// Handle AI bot detection
async function handleAIBotDetection(data, sender) {
  try {
    // Get current settings
    const settings = await chrome.storage.sync.get([
      'enabled',
      'showNotifications',
      'detectionSensitivity'
    ]);
    
    if (!settings.enabled) return;
    
    // Store detection data
    const detectionData = {
      timestamp: Date.now(),
      profileName: data.name,
      profileTitle: data.title,
      profileUrl: data.profileUrl,
      confidence: data.confidence || 'medium',
      indicators: data.indicators || []
    };
    
    // Store in local storage
    const existingDetections = await chrome.storage.local.get(['detections']);
    const detections = existingDetections.detections || [];
    detections.push(detectionData);
    
    // Keep only last 100 detections
    if (detections.length > 100) {
      detections.splice(0, detections.length - 100);
    }
    
    await chrome.storage.local.set({ detections });
    
    // Show notification if enabled
    if (settings.showNotifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'AI Bot Detected',
        message: `Detected AI bot: ${data.name}`,
        priority: 1
      });
    }
    
    // Update badge
    const badgeText = detections.length.toString();
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
    
  } catch (error) {
    console.error('Error handling AI bot detection:', error);
  }
}

// Get extension settings
async function getSettings(sendResponse) {
  try {
    const settings = await chrome.storage.sync.get([
      'enabled',
      'showNotifications',
      'detectionSensitivity',
      'customPatterns',
      'whitelist'
    ]);
    sendResponse({ success: true, settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Update extension settings
async function updateSettings(settings, sendResponse) {
  try {
    await chrome.storage.sync.set(settings);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle tab updates to inject content script on LinkedIn pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com')) {
    // Content script will be automatically injected via manifest
    console.log('LinkedIn page loaded, content script should be active');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('linkedin.com')) {
    // Toggle extension on/off
    chrome.storage.sync.get(['enabled'], (result) => {
      const newEnabled = !result.enabled;
      chrome.storage.sync.set({ enabled: newEnabled });
      
      // Update badge
      chrome.action.setBadgeText({ 
        text: newEnabled ? '' : 'OFF' 
      });
      chrome.action.setBadgeBackgroundColor({ 
        color: newEnabled ? '#4CAF50' : '#ff4444' 
      });
      
      // Notify content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleExtension',
        enabled: newEnabled
      });
    });
  }
});

// Clean up old detection data periodically
setInterval(async () => {
  try {
    const data = await chrome.storage.local.get(['detections']);
    if (data.detections) {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentDetections = data.detections.filter(
        detection => detection.timestamp > oneWeekAgo
      );
      
      if (recentDetections.length !== data.detections.length) {
        await chrome.storage.local.set({ detections: recentDetections });
        console.log('Cleaned up old detection data');
      }
    }
  } catch (error) {
    console.error('Error cleaning up detection data:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily
