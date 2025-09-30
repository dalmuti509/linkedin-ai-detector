// LinkedIn AI Bot Detector Content Script
console.log('🚀 LinkedIn AI Bot Detector loaded and running!');
console.log('🔧 Extension version: 1.0');
console.log('🌐 Current URL:', window.location.href);

class AIDetector {
  constructor() {
    this.processedProfiles = new Set();
    this.overlayIcon = this.createOverlayIcon();
    this.verifiedIcon = this.createVerifiedIcon();
    this.testMode = false;
    this.debugForcedOverlayShown = false;
    this.lastVerboseLogAtMs = 0;
    this.init();
  }

  init() {
    // Load settings
    this.loadSettings();
    
    // Start detection when page loads
    this.detectAIBots();
    
    // Set up observer for dynamic content
    this.setupObserver();
    
    // Re-scan periodically for new content
    setInterval(() => this.detectAIBots(), 5000);
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['testMode']);
      this.testMode = result.testMode || false;
    } catch (error) {
      console.log('Could not load settings:', error);
    }
  }

  createOverlayIcon() {
    const icon = document.createElement('div');
    icon.className = 'ai-bot-overlay';
    icon.innerHTML = '🤖';
    icon.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ff4444;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    return icon;
  }

  createVerifiedIcon() {
    const icon = document.createElement('div');
    icon.className = 'verified-profile-overlay';
    icon.innerHTML = '✓';
    icon.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background: #4CAF50;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    return icon;
  }

  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldRescan = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRescan = true;
        }
      });
      if (shouldRescan) {
        setTimeout(() => this.detectAIBots(), 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  isOnProfilePage() {
    try {
      const path = location.pathname || '';
      return /^\/in\//.test(path);
    } catch (_) {
      return false;
    }
  }

  detectAIBots() {
    const nowMs = Date.now();
    const shouldVerboseLog = nowMs - this.lastVerboseLogAtMs > 60_000;
    if (!this.isOnProfilePage()) {
      if (shouldVerboseLog) {
        console.log('⏭️ Skipping detection on non-profile page:', location.pathname);
        this.lastVerboseLogAtMs = nowMs;
      }
      return;
    }
    if (shouldVerboseLog) {
      console.log('🔍 Scanning for profiles...');
      console.log('🧪 Test mode enabled:', this.testMode);
    }
    
    // Scope queries to main profile content to avoid header/footer/sidebars
    const mainContainer = document.querySelector('main.scaffold-layout__main') || document.querySelector('main') || document.body;

    // SINGLE PROFILE EVALUATION: find only the main profile image within the top card
    const topCard = mainContainer.querySelector('section.pv-top-card') || mainContainer.querySelector('.pv-top-card') || mainContainer;
    const mainPhoto = topCard.querySelector('img.pv-top-card-profile-picture__image, .pv-top-card__photo img, img[alt*="profile photo" i], img[alt*="profile picture" i]');

    if (!mainPhoto) {
      if (shouldVerboseLog) {
        console.log('❌ Main profile photo not found in main content');
      }
      this.lastVerboseLogAtMs = nowMs;
      return;
    }

    // Build and evaluate a single profile summary from the main photo context
    const profileInfo = this.extractProfileInfo(mainPhoto);
    if (shouldVerboseLog) console.log('📄 Profile summary:', profileInfo);

    if (this.testMode && this.isTestModeProfile(profileInfo)) {
      if (shouldVerboseLog) console.log('🧪 Test mode: flagging main profile');
      this.addOverlayIcon(mainPhoto);
      this.lastVerboseLogAtMs = nowMs;
      return;
    }

    const isAIBot = this.isAIBot(profileInfo);
    const isVerified = !isAIBot && this.isVerifiedProfile(profileInfo);
    if (shouldVerboseLog) console.log('📊 Result → bot:', isAIBot, 'verified:', isVerified);

    if (isAIBot) {
      this.addOverlayIcon(mainPhoto);
    } else if (isVerified) {
      this.addVerifiedIcon(mainPhoto);
    }

    this.lastVerboseLogAtMs = nowMs;
    return;

    // The following legacy multi-element scan is disabled for profile pages
    const profileSelectors = [
      // Current LinkedIn selectors (2024)
      'img[data-testid="profile-photo"]',
      '.presence-entity__image',
      '.presence-entity__image img',
      '.feed-shared-actor__avatar',
      '.feed-shared-actor__avatar img',
      '.update-components-actor__avatar',
      '.update-components-actor__avatar img',
      '.pv-top-card__photo img',
      // Profile page (center) picture selectors (newer layout)
      'img.pv-top-card-profile-picture__image',
      '.pv-top-card-profile-picture__image',
      '.pv-top-card__profile-image',
      '.pv-top-card__photo',
      '.pv-top-card',
      '.artdeco-entity-lockup__image img',
      '.search-results__image img',
      '.entity-result__image img',
      '.org-people-profile-card__profile-photo img',
      '.people-card__profile-photo img',
      
      // Broader selectors for profile images
      'img[alt*="profile photo"]',
      'img[alt*="Profile photo"]',
      'img[alt*="profile picture"]',
      'img[alt*="Profile picture"]',
      'img[alt*="profile"]',
      'img[alt*="Profile"]',
      
      // Generic profile image selectors
      'img[src*="profile"]',
      'img[src*="avatar"]',
      'img[src*="photo"]',
      
      // Container selectors
      '.pv-top-card__photo',
      '.artdeco-entity-lockup__image',
      '.search-results__image',
      '.entity-result__image',
      '.org-people-profile-card__profile-photo',
      '.people-card__profile-photo',
      
      // Very broad selectors as fallback
      'img[class*="profile"]',
      'img[class*="avatar"]',
      'img[class*="photo"]',
      'img[class*="image"]',
      
      // Even broader fallbacks
      'img[width="48"]',
      'img[width="56"]',
      'img[width="64"]',
      'img[height="48"]',
      'img[height="56"]',
      'img[height="64"]'
    ];

    let totalFound = 0;
    const allElements = [];
    profileSelectors.forEach(selector => {
      const elements = Array.from(mainContainer.querySelectorAll(selector)) || [];
      totalFound += elements.length;
      if (shouldVerboseLog) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
      }
      elements.forEach(element => {
        allElements.push(element);
        this.processProfileElement(element);
      });
    });
    if (shouldVerboseLog) {
      console.log(`🔍 Total profile elements found: ${totalFound}`);
      this.lastVerboseLogAtMs = nowMs;
    }

    // Remove forced overlays; only real detections on profile pages
  }

  processProfileElement(element) {
    if (!element || this.processedProfiles.has(element)) return;
    
    this.processedProfiles.add(element);
    console.log('🔍 Processing profile element:', element);
    
    // Get profile information
    const profileInfo = this.extractProfileInfo(element);
    console.log('📋 Profile info extracted:', profileInfo);
    
    // Check test mode first
    if (this.testMode && this.isTestModeProfile(profileInfo)) {
      console.log('🧪 Test mode: Flagging profile with name starting with A');
      this.addOverlayIcon(element);
      return;
    }
    
    // Check if this is an AI bot
    const isAIBot = this.isAIBot(profileInfo);
    console.log('🤖 Is AI bot?', isAIBot);
    
    if (isAIBot) {
      console.log('🚨 Adding AI bot overlay');
      this.addOverlayIcon(element);
    } else if (this.isVerifiedProfile(profileInfo)) {
      console.log('✅ Adding verified profile overlay');
      this.addVerifiedIcon(element);
    }
  }

  extractProfileInfo(element) {
    const info = {
      name: '',
      title: '',
      description: '',
      imageSrc: element.src || '',
      profileUrl: '',
      profileAge: null,
      connectionCount: null,
      profileLocation: '',
      companyLocation: '',
      companyName: ''
    };

    // Try to find name and title from various LinkedIn layouts
    const nameSelectors = [
      '.pv-top-card__title',
      '.feed-shared-actor__name',
      '.update-components-actor__name',
      '.entity-result__title-text',
      '.people-card__name',
      '.org-people-profile-card__profile-title'
    ];

    const titleSelectors = [
      '.pv-top-card__headline',
      '.feed-shared-actor__description',
      '.update-components-actor__description',
      '.entity-result__primary-subtitle',
      '.people-card__occupation',
      '.org-people-profile-card__profile-subtitle'
    ];

    // Find name
    for (const selector of nameSelectors) {
      const nameElement = element.closest('*')?.querySelector(selector);
      if (nameElement) {
        info.name = nameElement.textContent?.trim() || '';
        break;
      }
    }

    // Fallback: derive name from image alt/aria-label if available
    if (!info.name && element) {
      const collectNameFrom = (node) => {
        if (!node) return '';
        const rawAlt = node.getAttribute && (node.getAttribute('alt') || node.getAttribute('aria-label'));
        const raw = (rawAlt || '').trim();
        if (!raw) return '';
        const ofMatch = raw.match(/of\s+(.+)$/i);
        let candidate = ofMatch ? ofMatch[1] : raw;
        candidate = candidate.replace(/^(profile\s*(picture|photo)\s*of\s*)/i, '')
                             .replace(/^(profile\s*(picture|photo))$/i, '')
                             .trim();
        return candidate;
      };

      // Try the element itself
      let candidate = collectNameFrom(element);
      // If not found, try a descendant img element
      if (!candidate) {
        const img = (element.querySelector && element.querySelector('img')) || null;
        candidate = collectNameFrom(img);
      }
      // If still not found, try the closest ancestor img (in case selector matched a wrapper)
      if (!candidate) {
        const ancestorImg = element.closest && element.closest('img');
        candidate = collectNameFrom(ancestorImg);
      }

      if (candidate && (candidate.includes(' ') || candidate.length >= 2)) {
        info.name = candidate;
      }
    }

    // Find title/description
    for (const selector of titleSelectors) {
      const titleElement = element.closest('*')?.querySelector(selector);
      if (titleElement) {
        info.title = titleElement.textContent?.trim() || '';
        break;
      }
    }

    // Get profile URL
    const linkElement = element.closest('a');
    if (linkElement) {
      info.profileUrl = linkElement.href || '';
    }

    // Extract profile characteristics
    this.extractProfileCharacteristics(element, info);

    return info;
  }

  extractProfileCharacteristics(element, info) {
    // Try to find connection count
    const connectionSelectors = [
      '.pv-top-card__connections',
      '.feed-shared-actor__sub-description',
      '.update-components-actor__sub-description',
      '.entity-result__secondary-subtitle',
      '.people-card__connections'
    ];

    for (const selector of connectionSelectors) {
      const connectionElement = element.closest('*')?.querySelector(selector);
      if (connectionElement) {
        const connectionText = connectionElement.textContent?.trim() || '';
        const connectionMatch = connectionText.match(/(\d+)\s*connections?/i);
        if (connectionMatch) {
          info.connectionCount = parseInt(connectionMatch[1]);
          break;
        }
      }
    }

    // Try to find profile location
    const locationSelectors = [
      '.pv-top-card__location',
      '.feed-shared-actor__location',
      '.update-components-actor__location',
      '.entity-result__subtitle',
      '.people-card__location'
    ];

    for (const selector of locationSelectors) {
      const locationElement = element.closest('*')?.querySelector(selector);
      if (locationElement) {
        info.profileLocation = locationElement.textContent?.trim() || '';
        break;
      }
    }

    // Try to find company information
    const companySelectors = [
      '.pv-top-card__company-name',
      '.feed-shared-actor__company',
      '.update-components-actor__company',
      '.entity-result__primary-subtitle',
      '.people-card__company'
    ];

    for (const selector of companySelectors) {
      const companyElement = element.closest('*')?.querySelector(selector);
      if (companyElement) {
        const companyText = companyElement.textContent?.trim() || '';
        // Extract company name and location from text like "Company Name · Location"
        const parts = companyText.split('·');
        if (parts.length >= 2) {
          info.companyName = parts[0].trim();
          info.companyLocation = parts[1].trim();
        } else {
          info.companyName = companyText;
        }
        break;
      }
    }

    // Try to find profile creation date (this is harder to detect on LinkedIn)
    // We'll look for "Joined LinkedIn" text or similar indicators
    const dateSelectors = [
      '.pv-top-card__joined-date',
      '.feed-shared-actor__date',
      '.update-components-actor__date'
    ];

    for (const selector of dateSelectors) {
      const dateElement = element.closest('*')?.querySelector(selector);
      if (dateElement) {
        const dateText = dateElement.textContent?.trim() || '';
        info.profileAge = this.parseProfileAge(dateText);
        break;
      }
    }
  }

  parseProfileAge(dateText) {
    // Parse LinkedIn date formats like "Joined LinkedIn in 2024" or "Joined 1 month ago"
    const now = new Date();
    
    // Look for "Joined LinkedIn in YYYY"
    const yearMatch = dateText.match(/joined linkedin in (\d{4})/i);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const joinDate = new Date(year, 0, 1); // Assume January 1st of that year
      return Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
    }

    // Look for "Joined X months ago" or "Joined X days ago"
    const monthsMatch = dateText.match(/joined (\d+)\s*months? ago/i);
    if (monthsMatch) {
      return parseInt(monthsMatch[1]) * 30; // Approximate days
    }

    const daysMatch = dateText.match(/joined (\d+)\s*days? ago/i);
    if (daysMatch) {
      return parseInt(daysMatch[1]);
    }

    // Look for "Joined this month" or "Joined this year"
    if (dateText.toLowerCase().includes('this month')) {
      return 15; // Approximate
    }

    if (dateText.toLowerCase().includes('this year')) {
      return 180; // Approximate
    }

    return null;
  }

  isAIBot(profileInfo) {
    const suspiciousIndicators = [];
    
    // Check profile age (less than 30 days)
    if (profileInfo.profileAge !== null && profileInfo.profileAge < 30) {
      suspiciousIndicators.push(`Profile created ${profileInfo.profileAge} days ago`);
    }
    
    // Check connection count (less than 10 connections)
    if (profileInfo.connectionCount !== null && profileInfo.connectionCount < 10) {
      suspiciousIndicators.push(`Only ${profileInfo.connectionCount} connections`);
    }
    
    // Check location mismatch between profile and company
    if (profileInfo.profileLocation && profileInfo.companyLocation) {
      if (!this.locationsMatch(profileInfo.profileLocation, profileInfo.companyLocation)) {
        suspiciousIndicators.push(`Location mismatch: Profile (${profileInfo.profileLocation}) vs Company (${profileInfo.companyLocation})`);
      }
    }
    
    // Additional suspicious patterns
    if (this.hasSuspiciousPatterns(profileInfo)) {
      suspiciousIndicators.push('Suspicious profile patterns detected');
    }
    
    // Log detection details for debugging
    if (suspiciousIndicators.length > 0) {
      console.log('Suspicious profile detected:', {
        name: profileInfo.name,
        indicators: suspiciousIndicators,
        profileAge: profileInfo.profileAge,
        connectionCount: profileInfo.connectionCount,
        profileLocation: profileInfo.profileLocation,
        companyLocation: profileInfo.companyLocation
      });
    }
    
    // Consider it suspicious if it has 2 or more indicators (restore to reduce false positives)
    return suspiciousIndicators.length >= 2;
  }

  locationsMatch(profileLocation, companyLocation) {
    if (!profileLocation || !companyLocation) return true; // Can't determine mismatch
    
    // Normalize locations for comparison
    const normalizeLocation = (location) => {
      return location.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Normalize spaces
        .trim();
    };
    
    const normalizedProfile = normalizeLocation(profileLocation);
    const normalizedCompany = normalizeLocation(companyLocation);
    
    // Check if locations are similar (allowing for minor variations)
    const profileWords = normalizedProfile.split(' ');
    const companyWords = normalizedCompany.split(' ');
    
    // If one location contains the other, they might match
    if (normalizedProfile.includes(normalizedCompany) || normalizedCompany.includes(normalizedProfile)) {
      return true;
    }
    
    // Check for common words (city, state, country)
    const commonWords = profileWords.filter(word => 
      companyWords.includes(word) && word.length > 2
    );
    
    // If they share significant common words, consider them matching
    return commonWords.length > 0;
  }

  hasSuspiciousPatterns(profileInfo) {
    const combinedText = `${profileInfo.name} ${profileInfo.title} ${profileInfo.description}`.toLowerCase();
    
    // Look for very generic or automated-sounding content
    const suspiciousPatterns = [
      // Generic names that might indicate automation
      /^[a-z]+\s+[a-z]+$/i,  // Very simple name patterns
      /^user\d+$/i,          // User123, User456, etc.
      /^test\s+user/i,       // Test User
      /^demo\s+account/i,    // Demo Account
      
      // Suspicious title patterns
      /^software engineer$/i,
      /^developer$/i,
      /^consultant$/i,
      /^freelancer$/i,
      
      // Empty or very generic descriptions
      /^$/,                  // Empty description
      /^looking for opportunities$/i,
      /^open to new opportunities$/i,
      /^seeking new challenges$/i,
      
      // Company patterns that might indicate fake companies
      /^test company$/i,
      /^demo corp$/i,
      /^sample inc$/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(combinedText)) {
        return true;
      }
    }
    
    // Check for very short or generic content
    if (profileInfo.name.length < 3 || profileInfo.title.length < 5) {
      return true;
    }
    
    // Check for repeated characters or patterns
    if (this.hasRepeatedPatterns(profileInfo.name) || this.hasRepeatedPatterns(profileInfo.title)) {
      return true;
    }
    
    return false;
  }

  hasRepeatedPatterns(text) {
    if (!text || text.length < 5) return false;
    
    // Check for repeated character patterns like "aaaa" or "123123"
    const repeatedCharPattern = /(.)\1{3,}/; // Same character repeated 4+ times
    if (repeatedCharPattern.test(text)) {
      return true;
    }
    
    // Check for sequential patterns like "abc123" or "user001"
    const sequentialPattern = /(?:abc|def|ghi|jkl|mno|pqr|stu|vwx|yz)\d+/i;
    if (sequentialPattern.test(text)) {
      return true;
    }
    
    return false;
  }

  isTestModeProfile(profileInfo) {
    // Test mode: flag profiles with names starting with 'A'
    if (!profileInfo.name) return false;
    return profileInfo.name.trim().toLowerCase().startsWith('a');
  }

  isVerifiedProfile(profileInfo) {
    // Consider a profile verified if it has strong indicators of legitimacy
    const verifiedIndicators = [];
    
    // Profile age (more than 1 year old)
    if (profileInfo.profileAge !== null && profileInfo.profileAge > 365) {
      verifiedIndicators.push('Profile older than 1 year');
    }
    
    // High connection count (more than 500 connections)
    if (profileInfo.connectionCount !== null && profileInfo.connectionCount > 500) {
      verifiedIndicators.push('High connection count');
    }
    
    // Location consistency
    if (profileInfo.profileLocation && profileInfo.companyLocation) {
      if (this.locationsMatch(profileInfo.profileLocation, profileInfo.companyLocation)) {
        verifiedIndicators.push('Location consistency');
      }
    }
    
    // Professional indicators
    if (this.hasProfessionalIndicators(profileInfo)) {
      verifiedIndicators.push('Professional indicators');
    }
    
    // Consider verified if it has 3 or more positive indicators (restore threshold)
    return verifiedIndicators.length >= 3;
  }

  hasProfessionalIndicators(profileInfo) {
    const professionalKeywords = [
      'manager', 'director', 'senior', 'lead', 'principal', 'head of',
      'ceo', 'cto', 'cfo', 'vp', 'vice president', 'president',
      'engineer', 'developer', 'architect', 'consultant', 'specialist',
      'analyst', 'coordinator', 'supervisor', 'executive'
    ];
    
    const combinedText = `${profileInfo.title} ${profileInfo.description}`.toLowerCase();
    
    return professionalKeywords.some(keyword => combinedText.includes(keyword));
  }

  addOverlayIcon(element) {
    console.log('🎯 Adding overlay icon to element:', element);
    
    // Check if overlay already exists
    if (element.querySelector('.ai-bot-overlay')) {
      console.log('⚠️ Overlay already exists, skipping');
      return;
    }

    // Make sure the parent container is positioned relatively
    const container = element.closest('div') || element.parentElement;
    if (container) {
      const computedStyle = window.getComputedStyle(container);
      if (computedStyle.position === 'static') {
        container.style.position = 'relative';
        console.log('📍 Set container position to relative');
      }
    }

    // Clone and add the overlay icon
    const overlay = this.overlayIcon.cloneNode(true);
    overlay.style.position = 'absolute';
    overlay.style.top = '-5px';
    overlay.style.right = '-5px';
    
    // Add to the profile image container
    // Prefer the closest positioned ancestor for stable overlay placement
    let imageContainer = element.closest('div');
    let ancestor = element;
    while (ancestor && ancestor !== document.body) {
      const style = ancestor instanceof Element ? window.getComputedStyle(ancestor) : null;
      if (style && style.position !== 'static') { imageContainer = ancestor; break; }
      ancestor = ancestor.parentElement;
    }
    if (!imageContainer) imageContainer = element.parentElement;
    if (imageContainer) {
      imageContainer.style.position = 'relative';
      imageContainer.appendChild(overlay);
      console.log('✅ Overlay icon added successfully');
    } else {
      console.log('❌ Could not find suitable container for overlay');
    }
  }

  addVerifiedIcon(element) {
    // Check if overlay already exists
    if (element.querySelector('.verified-profile-overlay')) return;

    // Make sure the parent container is positioned relatively
    const container = element.closest('div') || element.parentElement;
    if (container) {
      const computedStyle = window.getComputedStyle(container);
      if (computedStyle.position === 'static') {
        container.style.position = 'relative';
      }
    }

    // Clone and add the verified icon
    const overlay = this.verifiedIcon.cloneNode(true);
    overlay.style.position = 'absolute';
    overlay.style.top = '-5px';
    overlay.style.right = '-5px';
    
    // Add to the profile image container
    let imageContainer = element.closest('div');
    let ancestor = element;
    while (ancestor && ancestor !== document.body) {
      const style = ancestor instanceof Element ? window.getComputedStyle(ancestor) : null;
      if (style && style.position !== 'static') { imageContainer = ancestor; break; }
      ancestor = ancestor.parentElement;
    }
    if (!imageContainer) imageContainer = element.parentElement;
    if (imageContainer) {
      imageContainer.style.position = 'relative';
      imageContainer.appendChild(overlay);
    }
  }
}


// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleTestMode') {
    // Find existing detector instance and update test mode
    const detector = window.linkedinAIDetector;
    if (detector) {
      detector.testMode = request.testMode;
      // Re-scan with new settings
      detector.detectAIBots();
    }
  }
});

// Store detector instance globally for message handling
let detectorInstance = null;

// Initialize the detector when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    detectorInstance = new AIDetector();
    window.linkedinAIDetector = detectorInstance;
    console.log('🚀 LinkedIn AI Detector initialized on DOMContentLoaded');
  });
} else {
  detectorInstance = new AIDetector();
  window.linkedinAIDetector = detectorInstance;
  console.log('🚀 LinkedIn AI Detector initialized immediately');
}

// Add manual trigger for testing
window.testLinkedInDetector = function() {
  console.log('🧪 Manual test triggered');
  if (window.linkedinAIDetector) {
    window.linkedinAIDetector.detectAIBots();
  } else {
    console.log('❌ Detector not initialized');
  }
};

// Re-initialize on navigation (for SPAs like LinkedIn)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      detectorInstance = new AIDetector();
      window.linkedinAIDetector = detectorInstance;
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });
