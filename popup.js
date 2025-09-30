// LinkedIn AI Bot Detector Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  // Initialize popup
  await initializePopup();
  setupEventListeners();
  loadSettings();
  loadStats();
  loadRecentDetections();
});

// Initialize popup state
async function initializePopup() {
  try {
    // Check if extension is enabled
    const result = await chrome.storage.sync.get(['enabled']);
    const isEnabled = result.enabled !== false; // Default to true
    
    updateStatusIndicator(isEnabled);
    updateExtensionToggle(isEnabled);
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Extension toggle
  const extensionToggle = document.getElementById('extensionToggle');
  extensionToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.sync.set({ enabled });
    updateStatusIndicator(enabled);
    
    // Notify content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('linkedin.com')) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleExtension',
        enabled
      });
    }
  });

  // Notifications toggle
  const notificationsToggle = document.getElementById('notificationsToggle');
  notificationsToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ showNotifications: e.target.checked });
  });

  // Sensitivity select
  const sensitivitySelect = document.getElementById('sensitivitySelect');
  sensitivitySelect.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ detectionSensitivity: e.target.value });
  });

  // Test mode toggle
  const testModeToggle = document.getElementById('testModeToggle');
  testModeToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ testMode: e.target.checked });
    
    // Notify content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('linkedin.com')) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleTestMode',
        testMode: e.target.checked
      });
    }
  });

  // Clear data button
  const clearDataBtn = document.getElementById('clearDataBtn');
  clearDataBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all detection data?')) {
      await chrome.storage.local.clear();
      await chrome.storage.sync.set({ enabled: true });
      loadStats();
      loadRecentDetections();
    }
  });

  // View settings button
  const viewSettingsBtn = document.getElementById('viewSettingsBtn');
  viewSettingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });

  // Help and feedback links
  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/your-repo/linkedin-ai-detector' });
  });

  document.getElementById('feedbackLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/your-repo/linkedin-ai-detector/issues' });
  });
}

// Load settings from storage
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'enabled',
      'showNotifications',
      'detectionSensitivity',
      'testMode'
    ]);

    // Update UI elements
    document.getElementById('extensionToggle').checked = settings.enabled !== false;
    document.getElementById('notificationsToggle').checked = settings.showNotifications !== false;
    document.getElementById('sensitivitySelect').value = settings.detectionSensitivity || 'medium';
    document.getElementById('testModeToggle').checked = settings.testMode || false;
    
    updateStatusIndicator(settings.enabled !== false);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Load statistics
async function loadStats() {
  try {
    const data = await chrome.storage.local.get(['detections']);
    const detections = data.detections || [];
    
    // Calculate total detections
    const totalDetections = detections.length;
    document.getElementById('totalDetections').textContent = totalDetections;
    
    // Calculate today's detections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDetections = detections.filter(detection => 
      detection.timestamp >= today.getTime()
    ).length;
    document.getElementById('todayDetections').textContent = todayDetections;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load recent detections
async function loadRecentDetections() {
  try {
    const data = await chrome.storage.local.get(['detections']);
    const detections = data.detections || [];
    
    const detectionsList = document.getElementById('detectionsList');
    
    if (detections.length === 0) {
      detectionsList.innerHTML = '<div class="no-detections">No AI bots detected yet</div>';
      return;
    }
    
    // Show last 5 detections
    const recentDetections = detections.slice(-5).reverse();
    
    detectionsList.innerHTML = recentDetections.map(detection => {
      const timeAgo = getTimeAgo(detection.timestamp);
      const initials = getInitials(detection.profileName);
      
      return `
        <div class="detection-item">
          <div class="detection-avatar">${initials}</div>
          <div class="detection-info">
            <div class="detection-name">${detection.profileName}</div>
            <div class="detection-title">${detection.profileTitle || 'No title'}</div>
            <div class="detection-time">${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading recent detections:', error);
  }
}

// Update status indicator
function updateStatusIndicator(enabled) {
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');
  
  if (enabled) {
    statusDot.classList.remove('inactive');
    statusText.textContent = 'Active';
  } else {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Inactive';
  }
}

// Update extension toggle
function updateExtensionToggle(enabled) {
  document.getElementById('extensionToggle').checked = enabled;
}

// Get time ago string
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Get initials from name
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.detections) {
    loadStats();
    loadRecentDetections();
  }
  
  if (namespace === 'sync' && changes.enabled) {
    updateStatusIndicator(changes.enabled.newValue);
    updateExtensionToggle(changes.enabled.newValue);
  }
});
