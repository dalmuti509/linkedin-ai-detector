// LinkedIn AI Bot Detector Content Script
// Use logger if available, otherwise fall back to console
const log = (message, data = null) => {
  if (window.extensionLogger) {
    window.extensionLogger.info(message, data);
  } else {
    log(message, data);
  }
};

log('🚀 LinkedIn AI Bot Detector loaded and running!');
log('🔧 Extension version: 1.0');
log('🌐 Current URL: ' + window.location.href);

class AIDetector {
  constructor() {
    this.processedProfiles = new Set();
    this.overlayIcon = this.createOverlayIcon();
    this.verifiedIcon = this.createVerifiedIcon();
    this.testMode = false;
    this.debugForcedOverlayShown = false;
    this.lastVerboseLogAtMs = 0;
    this.isScanning = false;
    this.pageScanned = false;
    this.autoClickAttempted = false;
    this.init();
  }

  init() {
    // Load settings
    this.loadSettings();
    
    // Start detection when page loads
    this.detectAIBots().catch(console.error);
    
    // Set up observer for dynamic content
    this.setupObserver();
    
    // Re-scan periodically for new content
    setInterval(() => this.detectAIBots().catch(console.error), 5000);
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['testMode']);
      this.testMode = result.testMode || false;
    } catch (error) {
      log('Could not load settings:', error);
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
        setTimeout(() => this.detectAIBots().catch(console.error), 1000);
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
      const hostname = location.hostname || '';
      
      // Check if we're on LinkedIn profile page
      if (/^\/in\//.test(path)) {
        return true;
      }
      
      // Check if we're on the test page
      if (hostname === 'localhost' || hostname === '127.0.0.1' || 
          location.protocol === 'file:' || 
          path.includes('linkedin-test-profiles.html')) {
        return true;
      }
      
      return false;
    } catch (_) {
      return false;
    }
  }

  async detectAIBots() {
    const nowMs = Date.now();
    const shouldVerboseLog = nowMs - this.lastVerboseLogAtMs > 60_000;
    
    log('🔍 detectAIBots called - URL:', window.location.href);
    log('🔍 detectAIBots called - Title:', document.title);
    
    // Prevent multiple simultaneous scans
    if (this.isScanning) {
      if (shouldVerboseLog) {
        log('⏳ Scan already in progress, skipping...');
      }
      return;
    }
    
    // Prevent multiple scans on test pages
    if (this.pageScanned) {
      if (shouldVerboseLog) {
        log('⏳ Page already scanned, skipping...');
      }
      return;
    }
    
    this.isScanning = true;
    this.pageScanned = true;
    
    if (!this.isOnProfilePage()) {
      if (shouldVerboseLog) {
        log('⏭️ Skipping detection on non-profile page:', location.pathname);
        this.lastVerboseLogAtMs = nowMs;
      }
      this.isScanning = false;
      return;
    }
    if (shouldVerboseLog) {
      log('🔍 Scanning for profiles...');
      log('🧪 Test mode enabled:', this.testMode);
    }
    
    // Scope queries to main profile content to avoid header/footer/sidebars
    const mainContainer = document.querySelector('main.scaffold-layout__main') || document.querySelector('main') || document.body;

    // SINGLE PROFILE EVALUATION: find only the main profile image within the top card
    const topCard = mainContainer.querySelector('section.pv-top-card') || mainContainer.querySelector('.pv-top-card') || mainContainer;
    
    // More comprehensive selectors for LinkedIn profile photos
    let mainPhoto = null;
    
    // Try multiple selector strategies
    const selectors = [
      'img.pv-top-card-profile-picture__image',
      '.pv-top-card__photo img',
      'img[alt*="profile photo" i]',
      'img[alt*="profile picture" i]',
      'img[alt*="stephen" i]',
      'img[alt*="spates" i]',
      'img[data-testid*="profile"]',
      'img[aria-label*="profile" i]',
      'img[aria-label*="photo" i]',
      '.pv-top-card__photo-container img',
      '.profile-photo img',
      '.profile-picture img',
      '.pv-top-card__photo img',
      '.pv-top-card-profile-picture img',
      '.profile-photo-container img',
      '.profile-picture-container img',
      'img[src*="profile"]',
      'img[src*="photo"]',
      'img[class*="profile"]',
      'img[class*="photo"]'
    ];
    
    for (const selector of selectors) {
      mainPhoto = topCard.querySelector(selector);
      if (mainPhoto) {
        log('✅ Found profile photo with selector:', selector);
        break;
      }
    }

    if (!mainPhoto) {
      if (shouldVerboseLog) {
        log('❌ Main profile photo not found in main content');
        log('🔍 Debugging: Available elements in topCard:');
        log('  - All images:', topCard.querySelectorAll('img').length);
        log('  - Images with alt text:', Array.from(topCard.querySelectorAll('img')).map(img => img.alt).filter(alt => alt));
        log('  - Images with data-testid:', Array.from(topCard.querySelectorAll('img[data-testid]')).map(img => img.getAttribute('data-testid')));
        log('  - Images with aria-label:', Array.from(topCard.querySelectorAll('img[aria-label]')).map(img => img.getAttribute('aria-label')));
        log('  - All classes containing "photo" or "profile":', Array.from(topCard.querySelectorAll('*')).filter(el => el.className && (el.className.includes('photo') || el.className.includes('profile'))).map(el => el.className));
        
        // Try fallback: find any image in the top card area
        let fallbackImage = topCard.querySelector('img');
        if (!fallbackImage) {
          // If no image in top card, try the main container
          fallbackImage = mainContainer.querySelector('img');
          log('🔄 Trying main container for fallback image');
        }
        if (fallbackImage) {
          log('🔄 Using fallback image:', fallbackImage);
          // Continue with fallback image
          const profileInfo = await this.extractProfileInfo(fallbackImage);
          if (shouldVerboseLog) log('📄 Profile summary (fallback):', profileInfo);
          
          if (this.testMode && this.isTestModeProfile(profileInfo)) {
            if (shouldVerboseLog) log('🧪 Test mode: flagging fallback profile');
            this.addOverlayIcon(fallbackImage);
            return;
          }
          
          const isAIBot = this.isAIBot(profileInfo);
          const isVerified = !isAIBot && this.isVerifiedProfile(profileInfo);
          if (shouldVerboseLog) log('📊 Result (fallback) → bot:', isAIBot, 'verified:', isVerified);
          
          if (isAIBot) {
            this.addOverlayIcon(fallbackImage);
          } else if (isVerified) {
            this.addVerifiedIcon(fallbackImage);
          }
          return;
        }
      }
      this.lastVerboseLogAtMs = nowMs;
      return;
    }

    // Build and evaluate a single profile summary from the main photo context
    const profileInfo = await this.extractProfileInfo(mainPhoto);
    if (shouldVerboseLog) log('📄 Profile summary:', profileInfo);
    
    // Add debugging for profile detection
    log('🔍 Detected profile name:', profileInfo.name);
    log('🔍 Profile title:', profileInfo.title);
    log('🔍 Profile connections:', profileInfo.connectionCount);

    if (this.testMode && this.isTestModeProfile(profileInfo)) {
      if (shouldVerboseLog) log('🧪 Test mode: flagging main profile');
      this.addOverlayIcon(mainPhoto);
      this.lastVerboseLogAtMs = nowMs;
      return;
    }

    const isAIBot = this.isAIBot(profileInfo);
    const isVerified = !isAIBot && this.isVerifiedProfile(profileInfo);
    if (shouldVerboseLog) {
      log('📊 Profile data for verification:');
      log('  - Profile Age:', profileInfo.profileAge);
      log('  - Connection Count:', profileInfo.connectionCount);
      log('  - Profile Location:', profileInfo.profileLocation);
      log('  - Company Location:', profileInfo.companyLocation);
      log('📊 Result → bot:', isAIBot, 'verified:', isVerified);
    }

    if (isAIBot) {
      log('🤖 AI Bot detected - adding overlay icon');
      this.addOverlayIcon(mainPhoto);
    } else if (isVerified) {
      log('✅ Verified profile detected - adding verified icon');
      this.addVerifiedIcon(mainPhoto);
    } else {
      log('❌ Profile is neither AI bot nor verified - no overlay');
    }

    this.lastVerboseLogAtMs = nowMs;
    this.isScanning = false;
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
        log(`Found ${elements.length} elements with selector: ${selector}`);
      }
      elements.forEach(element => {
        allElements.push(element);
        this.processProfileElement(element);
      });
    });
    if (shouldVerboseLog) {
      log(`🔍 Total profile elements found: ${totalFound}`);
      this.lastVerboseLogAtMs = nowMs;
    }

    // Remove forced overlays; only real detections on profile pages
  }

  processProfileElement(element) {
    if (!element || this.processedProfiles.has(element)) return;
    
    this.processedProfiles.add(element);
    log('🔍 Processing profile element:', element);
    
    // Get profile information
    const profileInfo = this.extractProfileInfo(element);
    log('📋 Profile info extracted:', profileInfo);
    
    // Check test mode first
    if (this.testMode && this.isTestModeProfile(profileInfo)) {
      log('🧪 Test mode: Flagging profile with name starting with A');
      this.addOverlayIcon(element);
      return;
    }
    
    // Check if this is an AI bot
    const isAIBot = this.isAIBot(profileInfo);
    log('🤖 Is AI bot?', isAIBot);
    
    if (isAIBot) {
      log('🚨 Adding AI bot overlay');
      this.addOverlayIcon(element);
    } else if (this.isVerifiedProfile(profileInfo)) {
      log('✅ Adding verified profile overlay');
      this.addVerifiedIcon(element);
    }
  }

  async extractProfileInfo(element) {
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

    // Find name - try multiple approaches
    for (const selector of nameSelectors) {
      const nameElement = document.querySelector(selector);
      if (nameElement) {
        info.name = nameElement.textContent?.trim() || '';
        if (info.name) break;
      }
    }
    
    // Try broader search if no name found
    if (!info.name) {
      const broaderSelectors = [
        'h1',
        '.pv-top-card__title',
        '[data-testid*="name"]',
        '[aria-label*="name"]'
      ];
      
      for (const selector of broaderSelectors) {
        const nameElement = document.querySelector(selector);
        if (nameElement && nameElement.textContent?.trim()) {
          info.name = nameElement.textContent.trim();
        break;
        }
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
      const titleElement = document.querySelector(selector);
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
    await this.extractProfileCharacteristics(element, info);

    return info;
  }

  async extractProfileCharacteristics(element, info) {
    // First, try to get profile age by clicking "More" button and "About this profile"
    await this.attemptToGetProfileAge(info);
    
    // Try to find connection count
    const connectionSelectors = [
      '.pv-top-card__connections',
      '.feed-shared-actor__sub-description',
      '.update-components-actor__sub-description',
      '.entity-result__secondary-subtitle',
      '.people-card__connections'
    ];

    for (const selector of connectionSelectors) {
      const connectionElement = document.querySelector(selector);
      if (connectionElement) {
        const connectionText = connectionElement.textContent?.trim() || '';
        log('🔍 Connection text found:', connectionText);
        
        // Try multiple patterns for connection count
        const patterns = [
          /(\d+)\s*connections?/i,
          /(\d+)\+/i,
          /(\d+)\s*connections?/i
        ];
        
        for (const pattern of patterns) {
          const match = connectionText.match(pattern);
          if (match) {
            info.connectionCount = parseInt(match[1]);
            log('✅ Connection count extracted:', info.connectionCount);
            break;
          }
        }
        
        if (info.connectionCount !== null) break;
      }
    }
    
    // Try broader search for connection count
    if (info.connectionCount === null) {
      const broaderConnectionSelectors = [
        '.pv-top-card__connections',
        '[data-testid*="connection"]',
        '[aria-label*="connection"]'
      ];
      
      for (const selector of broaderConnectionSelectors) {
        const connectionElement = document.querySelector(selector);
      if (connectionElement) {
        const connectionText = connectionElement.textContent?.trim() || '';
        const connectionMatch = connectionText.match(/(\d+)\s*connections?/i);
        if (connectionMatch) {
          info.connectionCount = parseInt(connectionMatch[1]);
          break;
          }
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
      const locationElement = document.querySelector(selector);
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
      const companyElement = document.querySelector(selector);
      if (companyElement) {
        const companyText = companyElement.textContent?.trim() || '';
        log('🔍 Company text found:', companyText);
        
        // Extract company name and location from text like "Company Name · Location"
        const parts = companyText.split('·');
        if (parts.length >= 2) {
          info.companyName = parts[0].trim();
          info.companyLocation = parts[1].trim();
          log('✅ Company info extracted:', info.companyName, info.companyLocation);
        } else {
          info.companyName = companyText;
          log('✅ Company name extracted:', info.companyName);
        }
        break;
      }
    }
    
    // If no company location found, try to extract from title
    if (!info.companyLocation && info.title) {
      log('🔍 Trying to extract company location from title:', info.title);
      const titleMatch = info.title.match(/at\s+.+?\s+in\s+(.+)$/i);
      if (titleMatch) {
        info.companyLocation = titleMatch[1].trim();
        log('✅ Company location extracted from title:', info.companyLocation);
      }
    }

    // Try to find profile creation date (this is harder to detect on LinkedIn)
    // Note: Profile age is often hidden behind "More" button and "About this profile" link
    const dateSelectors = [
      '.pv-top-card__joined-date',
      '.feed-shared-actor__date',
      '.update-components-actor__date',
      // Try to find "About this profile" or similar elements
      '[data-testid*="about"]',
      '[aria-label*="about"]',
      '.pv-about-section',
      '.about-section'
    ];

    for (const selector of dateSelectors) {
      const dateElement = element.closest('*')?.querySelector(selector);
      if (dateElement) {
        const dateText = dateElement.textContent?.trim() || '';
        info.profileAge = this.parseProfileAge(dateText);
        if (info.profileAge !== null) break;
      }
    }
    
    // If no age found, try to look for "Joined LinkedIn" text in broader context
    if (info.profileAge === null) {
      const joinedSelectors = [
        '.pv-top-card__experience-list-item',
        '.pv-top-card__headline',
        '.pv-top-card__sub-headline',
        '.pv-top-card__location'
      ];
      
      for (const selector of joinedSelectors) {
        const joinedElement = element.closest('*')?.querySelector(selector);
        if (joinedElement) {
          const joinedText = joinedElement.textContent?.trim() || '';
          if (joinedText.includes('Joined LinkedIn')) {
            // We found a "Joined LinkedIn" reference but can't extract age
            // This is common - the actual age is often hidden behind "More" button
            log('Found "Joined LinkedIn" reference but age not accessible without user interaction');
        break;
          }
        }
      }
    }
  }

  async attemptToGetProfileAge(info) {
    try {
      // Prevent multiple auto-click attempts
      if (this.autoClickAttempted) {
        log('⏳ Auto-click already attempted, skipping...');
        return;
      }
      
      this.autoClickAttempted = true;
      
      // First, try to extract age data directly from hidden dialog elements
      log('🔍 Attempting to get profile age directly from DOM...');
      const directSelectors = [
        '#about-profile-joined',
        '.about-profile-detail-value',
        '[data-testid="about-profile-joined"]',
        '.pv-top-card__experience-list-item',
        '.pv-top-card__headline'
      ];
      
      for (const selector of directSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim() || '';
          log('📄 Found direct element:', selector, 'Content:', text);
          
          if (text && (text.includes('September') || text.includes('Joined') || text.includes('2022') || text.includes('2023') || text.includes('2024'))) {
            const age = this.parseProfileAge(text);
            if (age !== null && age !== undefined) {
              info.profileAge = age;
              log('✅ Profile age extracted directly from DOM:', age);
              return;
            }
          }
        }
      }
      
      // If direct extraction failed, try the dialog approach
      log('🔍 Direct extraction failed, trying dialog approach...');
      
      // Look for the "More" button
      const moreButtonSelectors = [
        'button[aria-label*="More"]',
        'button[aria-label*="more"]',
        '.pv-top-card__actions button',
        '.pv-top-card__action-buttons button',
        'button[data-testid*="more"]'
      ];
      
      let moreButton = null;
      for (const selector of moreButtonSelectors) {
        moreButton = document.querySelector(selector);
        if (moreButton) {
          log('✅ Found More button with selector:', selector);
          break;
        }
      }
      
      if (!moreButton) {
        log('❌ More button not found');
        return;
      }
      
      // Click the More button
      moreButton.click();
      log('🖱️ Clicked More button');
      
      // Wait a moment for the menu to appear
      await this.sleep(1000);
      
      // Look for "About this profile" link
      const aboutProfileSelectors = [
        'a[href*="about"]',
        '.pv-top-card__menu a',
        '[data-testid*="about"]'
      ];
      
      let aboutLink = null;
      for (const selector of aboutProfileSelectors) {
        aboutLink = document.querySelector(selector);
        if (aboutLink && aboutLink.textContent.toLowerCase().includes('about')) {
          log('✅ Found About this profile link with selector:', selector);
          break;
        }
      }
      
      if (!aboutLink) {
        log('❌ About this profile link not found');
        return;
      }
      
      // Click the About this profile link
      aboutLink.click();
      log('🖱️ Clicked About this profile link');
      
      // Wait for the dialog to appear
      await this.sleep(2000);
      
            // Look for profile age information in the dialog
            const ageDialogSelectors = [
              '.about-profile-dialog',
              '.about-profile-content',
              '.about-profile-body',
              '.about-profile-detail-value',
              '#about-profile-joined',
              '.pv-about-section',
              '.about-section',
              '[data-testid*="about"]',
              '.profile-about',
              '.pv-profile-section'
            ];
      
      for (const selector of ageDialogSelectors) {
        const dialogElement = document.querySelector(selector);
        if (dialogElement) {
          const dialogText = dialogElement.textContent?.trim() || '';
          log('📄 Dialog content found:', dialogText.substring(0, 200) + '...');
          
          // Try to parse age from dialog content
          const age = this.parseProfileAge(dialogText);
          if (age !== null && age !== undefined) {
            info.profileAge = age;
            log('✅ Profile age extracted from dialog:', age);
            break;
          }
          
          // Try to extract from "Joined" text specifically
          if (dialogText.includes('Joined:') || dialogText.includes('September')) {
            const joinedMatch = dialogText.match(/Joined:\s*(.+?)(?:\n|$)/i);
            if (joinedMatch) {
              const joinedText = joinedMatch[1].trim();
              const age = this.parseProfileAge(joinedText);
              if (age !== null && age !== undefined) {
                info.profileAge = age;
                log('✅ Profile age extracted from Joined text:', age);
                break;
              }
            }
          }
        }
      }
      
            // Close the dialog by clicking the close button or other methods
            try {
              // Try clicking the specific close button first (for test page)
              const closeButton = document.querySelector('.about-profile-close, .artdeco-modal__dismiss, .modal-close, [aria-label="Dismiss"]');
              if (closeButton) {
                closeButton.click();
                log('✅ Dialog closed via close button');
                await this.sleep(500);
                return;
              }
              
              // Try clicking outside the dialog
              document.body.click();
              await this.sleep(500);
              
              // Try pressing Escape key
              const escapeEvent = new KeyboardEvent('keydown', {
                key: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
              });
              document.dispatchEvent(escapeEvent);
              await this.sleep(500);
              
              // Try clicking the backdrop if it exists
              const backdrop = document.querySelector('.artdeco-modal-overlay, .modal-backdrop, .dialog-overlay, .about-profile-dialog');
              if (backdrop) {
                backdrop.click();
                await this.sleep(500);
              }
              
              log('✅ Dialog closed successfully');
            } catch (error) {
              log('❌ Error closing dialog:', error);
            }
      
    } catch (error) {
      log('❌ Error getting profile age:', error);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    // Look for "September 2022" or similar month-year format
    const monthYearMatch = dateText.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
    if (monthYearMatch) {
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                          'july', 'august', 'september', 'october', 'november', 'december'];
      const monthIndex = monthNames.indexOf(monthYearMatch[1].toLowerCase());
      const year = parseInt(monthYearMatch[2]);
      const joinDate = new Date(year, monthIndex, 1); // First day of that month
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
    
    // Check profile age (less than 30 days) - Note: Often hidden behind "More" button
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
      log('Suspicious profile detected:', {
        name: profileInfo.name,
        indicators: suspiciousIndicators,
        profileAge: profileInfo.profileAge,
        connectionCount: profileInfo.connectionCount,
        profileLocation: profileInfo.profileLocation,
        companyLocation: profileInfo.companyLocation
      });
    }
    
    // Consider it suspicious if it has 2 or more indicators
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
    
    // Skip suspicious pattern detection for test pages
    if (combinedText.includes('linkedin ai detector') || 
        combinedText.includes('test profiles') ||
        combinedText.includes('🤖')) {
      return false;
    }
    
    // Look for very generic or automated-sounding content
    const suspiciousPatterns = [
      // Generic names that might indicate automation (but exclude legitimate names)
      /^user\d+$/i,          // User123, User456, etc.
      /^test\s+user/i,       // Test User
      /^demo\s+account/i,    // Demo Account
      /^bot\d+$/i,           // Bot123, Bot456, etc.
      /^ai\s+assistant$/i,    // AI Assistant
      /^automated\s+user$/i, // Automated User
      
      // Suspicious title patterns (only very generic ones)
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
    
    log('🔍 Checking verification indicators for:', profileInfo.name);
    
    // Profile age (more than 1 year old)
    if (profileInfo.profileAge !== null && profileInfo.profileAge > 365) {
      verifiedIndicators.push('Profile older than 1 year');
      log('✅ Profile age indicator:', profileInfo.profileAge, 'days');
    } else {
      log('❌ Profile age not sufficient:', profileInfo.profileAge, 'days');
    }
    
    // High connection count (30 or more connections)
    if (profileInfo.connectionCount !== null && profileInfo.connectionCount >= 30) {
      verifiedIndicators.push('High connection count');
      log('✅ Connection count indicator:', profileInfo.connectionCount, 'connections');
    } else {
      log('❌ Connection count not sufficient:', profileInfo.connectionCount, 'connections');
    }
    
    // Location consistency
    if (profileInfo.profileLocation && profileInfo.companyLocation) {
      if (this.locationsMatch(profileInfo.profileLocation, profileInfo.companyLocation)) {
        verifiedIndicators.push('Location consistency');
        log('✅ Location consistency indicator:', profileInfo.profileLocation, 'vs', profileInfo.companyLocation);
      } else {
        log('❌ Location mismatch:', profileInfo.profileLocation, 'vs', profileInfo.companyLocation);
      }
    } else {
      log('❌ Missing location data - Profile:', profileInfo.profileLocation, 'Company:', profileInfo.companyLocation);
    }
    
    // Consider verified if it has all 3 positive indicators
    log('📊 Verification result:', verifiedIndicators.length, 'indicators found:', verifiedIndicators);
    const isVerified = verifiedIndicators.length >= 3;
    log('✅ Profile verified:', isVerified);
    return isVerified;
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
    log('🎯 Adding overlay icon to element:', element);
    
    // Check if overlay already exists
    if (element.querySelector('.ai-bot-overlay')) {
      log('⚠️ Overlay already exists, skipping');
      return;
    }

    // Make sure the parent container is positioned relatively
    const container = element.closest('div') || element.parentElement;
    if (container) {
      const computedStyle = window.getComputedStyle(container);
      if (computedStyle.position === 'static') {
        container.style.position = 'relative';
        log('📍 Set container position to relative');
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
      log('✅ Overlay icon added successfully');
    } else {
      log('❌ Could not find suitable container for overlay');
    }

    // Show popup dialog for AI bot detection
    this.showAIBotPopup(element);
  }

  showAIBotPopup(element) {
    // Check if popup already exists
    if (document.querySelector('.ai-bot-popup-overlay')) {
      log('⚠️ AI bot popup already exists, skipping');
      return;
    }

    log('🚨 Showing AI bot detection popup');

    // Get profile information for the popup
    const profileInfo = this.extractProfileInfo(element);
    const suspiciousIndicators = this.getSuspiciousIndicators(profileInfo);

    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'ai-bot-popup-overlay';
    popupOverlay.innerHTML = `
      <div class="ai-bot-popup-dialog">
        <div class="ai-bot-popup-header">
          <div class="ai-bot-popup-icon">🤖</div>
          <h2 class="ai-bot-popup-title">Potential AI Bot Detected</h2>
        </div>
        <div class="ai-bot-popup-message">
          This profile has been flagged as potentially being an AI bot. Please review the reasons below before proceeding.
        </div>
        <div class="ai-bot-popup-reasons">
          <div class="ai-bot-popup-reasons-title">Detection Reasons:</div>
          <ul class="ai-bot-popup-reasons-list">
            ${suspiciousIndicators.map(indicator => `<li>${indicator}</li>`).join('')}
          </ul>
        </div>
        <div class="ai-bot-popup-buttons">
          <button class="ai-bot-popup-button ai-bot-popup-button-cancel" onclick="window.linkedinAIDetector.handlePopupCancel()">
            Go Back
          </button>
          <button class="ai-bot-popup-button ai-bot-popup-button-continue" onclick="window.linkedinAIDetector.handlePopupContinue()">
            Continue Anyway
          </button>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(popupOverlay);

    // Store reference for cleanup
    this.currentPopup = popupOverlay;
  }

  getSuspiciousIndicators(profileInfo) {
    const indicators = [];
    
    // Check profile age (less than 30 days)
    if (profileInfo.profileAge !== null && profileInfo.profileAge < 30) {
      indicators.push(`Profile created ${profileInfo.profileAge} days ago`);
    }
    
    // Check connection count (less than 10 connections)
    if (profileInfo.connectionCount !== null && profileInfo.connectionCount < 10) {
      indicators.push(`Only ${profileInfo.connectionCount} connections`);
    }
    
    // Check location mismatch between profile and company
    if (profileInfo.profileLocation && profileInfo.companyLocation) {
      if (!this.locationsMatch(profileInfo.profileLocation, profileInfo.companyLocation)) {
        indicators.push(`Location mismatch: Profile (${profileInfo.profileLocation}) vs Company (${profileInfo.companyLocation})`);
      }
    }
    
    // Additional suspicious patterns
    if (this.hasSuspiciousPatterns(profileInfo)) {
      indicators.push('Suspicious profile patterns detected');
    }

    return indicators;
  }

  handlePopupCancel() {
    log('🚫 User chose to go back');
    this.hideAIBotPopup();
    
    // Go back to previous page
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, redirect to LinkedIn home
      window.location.href = 'https://www.linkedin.com/feed/';
    }
  }

  handlePopupContinue() {
    log('✅ User chose to continue');
    this.hideAIBotPopup();
  }

  hideAIBotPopup() {
    if (this.currentPopup) {
      this.currentPopup.remove();
      this.currentPopup = null;
      log('🗑️ AI bot popup removed');
    }
  }

  addVerifiedIcon(element) {
    log('🎯 Adding verified icon to element:', element);
    
    // Check if overlay already exists
    if (element.querySelector('.verified-profile-overlay')) {
      log('⚠️ Verified overlay already exists, skipping');
      return;
    }

    // Make sure the parent container is positioned relatively
    const container = element.closest('div') || element.parentElement;
    if (container) {
      const computedStyle = window.getComputedStyle(container);
      if (computedStyle.position === 'static') {
        container.style.position = 'relative';
        log('🔧 Set container position to relative');
      }
    }

    // Clone and add the verified icon
    const overlay = this.verifiedIcon.cloneNode(true);
    overlay.style.position = 'absolute';
    overlay.style.top = '-5px';
    overlay.style.right = '-5px';
    overlay.style.zIndex = '9999';
    overlay.style.backgroundColor = '#FF0000'; // Temporary bright red for debugging
    overlay.style.border = '3px solid yellow';
    overlay.style.width = '30px';
    overlay.style.height = '30px';
    log('🎨 Created verified overlay element:', overlay);
    log('🎨 Overlay styles:', {
      position: overlay.style.position,
      top: overlay.style.top,
      right: overlay.style.right,
      zIndex: overlay.style.zIndex,
      backgroundColor: overlay.style.backgroundColor
    });
    
    // Find the immediate parent of the image (profile photo container)
    let imageContainer = element.parentElement;
    
    // Look for the profile photo container specifically
    // First check if the immediate parent is the photo container
    if (imageContainer && imageContainer.className.includes('pv-top-card__photo')) {
      log('🎯 Found pv-top-card__photo container:', imageContainer.className);
    } else {
      // Look for the photo container in the parent hierarchy
      let ancestor = element.parentElement;
      while (ancestor && ancestor !== document.body) {
        if (ancestor.className.includes('pv-top-card__photo')) {
          imageContainer = ancestor;
          log('🎯 Found pv-top-card__photo container in hierarchy:', ancestor.className);
          break;
        }
        ancestor = ancestor.parentElement;
      }
    }
    
    // The pv-top-card__photo container is too wide (includes text content)
    // We need to create a wrapper specifically around the image
    if (imageContainer && imageContainer.className.includes('pv-top-card__photo')) {
      log('🔧 pv-top-card__photo is too wide, creating image wrapper');
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
      imageContainer = wrapper;
      log('🎯 Created image-specific wrapper:', wrapper);
    } else if (!imageContainer || imageContainer.tagName === 'IMG') {
      log('🔧 Creating wrapper div for overlay around image');
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
      imageContainer = wrapper;
    }
    
    if (imageContainer) {
      imageContainer.style.position = 'relative';
      imageContainer.appendChild(overlay);
      log('✅ Verified overlay added to container:', imageContainer);
      log('📦 Container info:', {
        tagName: imageContainer.tagName,
        className: imageContainer.className,
        id: imageContainer.id,
        position: imageContainer.style.position,
        offsetWidth: imageContainer.offsetWidth,
        offsetHeight: imageContainer.offsetHeight
      });
      log('📍 Overlay final position:', {
        offsetTop: overlay.offsetTop,
        offsetLeft: overlay.offsetLeft,
        offsetWidth: overlay.offsetWidth,
        offsetHeight: overlay.offsetHeight,
        computedStyle: window.getComputedStyle(overlay).position
      });
    } else {
      log('❌ No suitable container found for verified overlay');
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
      detector.detectAIBots().catch(console.error);
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
    log('🚀 LinkedIn AI Detector initialized on DOMContentLoaded');
  });
} else {
  detectorInstance = new AIDetector();
  window.linkedinAIDetector = detectorInstance;
  log('🚀 LinkedIn AI Detector initialized immediately');
}

// Add manual trigger for testing
window.testLinkedInDetector = function() {
  log('🧪 Manual test triggered');
  if (window.linkedinAIDetector) {
    window.linkedinAIDetector.detectAIBots().catch(console.error);
  } else {
    log('❌ Detector not initialized');
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
