/**
 * BrowseInsight - Browsing Tracker
 * 
 * Tracks browser activity and user engagement with websites.
 */

import { StorageManager } from './storage';

interface ActiveTabInfo {
  tabId: number;
  url: string;
  domain: string;
  title: string;
  visitStart: number;
  lastActiveTime: number;
  totalActiveTime: number;
  isPaused: boolean;
}

export class BrowsingTracker {
  private storage: StorageManager;
  private activeTabInfo: Partial<ActiveTabInfo> = {};
  private isTracking: boolean = false;
  private activeTimeInterval: ReturnType<typeof setInterval> | null = null;

  constructor(storage: StorageManager) {
    this.storage = storage;
  }
  
  startTracking(): void {
    if (this.isTracking) return;

    // Start tracking browser events
    this.addEventListeners();
    this.isTracking = true;
    console.log('BrowseInsight tracking started');
  }

  stopTracking(): void {
    if (!this.isTracking) return;

    // Save current session before stopping
    this.finalizeCurrentVisit();

    // Remove event listeners
    this.removeEventListeners();
    this.isTracking = false;
    console.log('BrowseInsight tracking stopped');
  }
  
  private addEventListeners(): void {
    // Tab events
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));
    
    // Window events
    chrome.windows.onFocusChanged.addListener(this.handleWindowFocusChanged.bind(this));
    
    // Navigation events
    chrome.webNavigation.onCompleted.addListener(this.handleNavigationCompleted.bind(this));
    
    // Idle events
    chrome.idle.onStateChanged.addListener(this.handleIdleStateChanged.bind(this));
    
    // Initial state check
    this.checkCurrentState();
  }
  
  private removeEventListeners(): void {
    chrome.tabs.onActivated.removeListener(this.handleTabActivated);
    chrome.tabs.onUpdated.removeListener(this.handleTabUpdated);
    chrome.tabs.onRemoved.removeListener(this.handleTabRemoved);
    chrome.windows.onFocusChanged.removeListener(this.handleWindowFocusChanged);
    chrome.webNavigation.onCompleted.removeListener(this.handleNavigationCompleted);
    chrome.idle.onStateChanged.removeListener(this.handleIdleStateChanged);
  }

  private async checkCurrentState(): Promise<void> {
    try {
      // Get current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        // Add windowId to match the TabActiveInfo type requirement
        await this.handleTabActivated({
          tabId: tab.id!,
          windowId: tab.windowId!
        });
      }
    } catch (error) {
      console.error('Error checking current state:', error);
    }
  }

  private async handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): Promise<void> {
    try {
      // Finalize previous visit if any
      await this.finalizeCurrentVisit();

      // Get tab details
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab && tab.url && this.isTrackableUrl(tab.url)) {
        this.startNewVisit(tab);
      }
    } catch (error) {
      console.error('Error handling tab activation:', error);
    }
  }
  
  private handleTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
    // Only process if this is the active tab and URL has changed
    if (changeInfo.status === 'complete' && 
        this.activeTabInfo.tabId === tabId &&
        tab.url && 
        this.isTrackableUrl(tab.url)) {
      
      // If URL changed significantly, finalize previous and start new
      if (this.isNewDomain(tab.url)) {
        this.finalizeCurrentVisit().then(() => {
          this.startNewVisit(tab);
        });
      }
    }
  }
  
  private handleTabRemoved(tabId: number): void {
    if (this.activeTabInfo.tabId === tabId) {
      this.finalizeCurrentVisit();
    }
  }
  
  private handleWindowFocusChanged(windowId: number): void {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // Window lost focus
      this.pauseCurrentVisit();
    } else {
      // Window gained focus, check which tab is active
      chrome.tabs.query({ active: true, windowId }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const tab = tabs[0];
          
          // If coming back to the same tab
          if (this.activeTabInfo.tabId === tab.id) {
            this.resumeCurrentVisit();
          } else {
            // Different tab is now active
            this.finalizeCurrentVisit().then(() => {
              if (tab.url && this.isTrackableUrl(tab.url)) {
                this.startNewVisit(tab);
              }
            });
          }
        }
      });
    }
  }
  
  private handleNavigationCompleted(details: chrome.webNavigation.WebNavigationFramedCallbackDetails): void {
    // Only track main frame navigation in the active tab
    if (details.frameId === 0 && 
        details.tabId === this.activeTabInfo.tabId) {
      
      chrome.tabs.get(details.tabId, (tab) => {
        if (tab.url && this.isNewDomain(tab.url)) {
          this.finalizeCurrentVisit().then(() => {
            this.startNewVisit(tab);
          });
        }
      });
    }
  }
  
  private handleIdleStateChanged(state: chrome.idle.IdleState): void {
    if (state === 'active') {
      this.resumeCurrentVisit();
    } else {
      // idle or locked
      this.pauseCurrentVisit();
    }
  }
  
  private startNewVisit(tab: chrome.tabs.Tab): void {
    if (!tab.url) return;
    
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      
      this.activeTabInfo = {
        tabId: tab.id!,
        url: tab.url,
        domain: domain,
        title: tab.title || domain,
        visitStart: Date.now(),
        lastActiveTime: Date.now(),
        totalActiveTime: 0,
        isPaused: false
      };
      
      // Start the active time tracker
      this.startActiveTimeTracking();
      
      console.log(`Started tracking visit to ${domain}`);
    } catch (error) {
      console.error('Error starting new visit:', error);
    }
  }
  
  private async finalizeCurrentVisit(): Promise<void> {
    if (!this.activeTabInfo.domain) return;
    
    // Stop active time tracking
    this.stopActiveTimeTracking();
    
    const now = Date.now();
    
    // Don't record very short visits (less than 1 second)
    if (now - this.activeTabInfo.visitStart! < 1000) {
      this.activeTabInfo = {};
      return;
    }
    
    const visitData = {
      domain: this.activeTabInfo.domain,
      url: this.activeTabInfo.url,
      title: this.activeTabInfo.title,
      visitStart: this.activeTabInfo.visitStart!,
      visitEnd: now,
      duration: now - this.activeTabInfo.visitStart!,
      activeTime: this.activeTabInfo.totalActiveTime!
    };
    
    // Store the visit data
    try {
      await this.storage.saveVisit(visitData);
      console.log(`Saved visit to ${visitData.domain} (${Math.round(visitData.activeTime / 1000)}s active)`);
    } catch (error) {
      console.error('Error saving visit data:', error);
    }
    
    // Reset active tab info
    this.activeTabInfo = {};
  }
  
  private pauseCurrentVisit(): void {
    if (!this.activeTabInfo.domain || this.activeTabInfo.isPaused) return;
    
    // Calculate active time up to now
    const now = Date.now();
    this.activeTabInfo.totalActiveTime! += (now - this.activeTabInfo.lastActiveTime!);
    this.activeTabInfo.isPaused = true;
    
    // Stop the active time tracker
    this.stopActiveTimeTracking();
    
    console.log(`Paused tracking for ${this.activeTabInfo.domain}`);
  }
  
  private resumeCurrentVisit(): void {
    if (!this.activeTabInfo.domain || !this.activeTabInfo.isPaused) return;
    
    // Reset the last active time to now
    this.activeTabInfo.lastActiveTime = Date.now();
    this.activeTabInfo.isPaused = false;
    
    // Restart the active time tracker
    this.startActiveTimeTracking();
    
    console.log(`Resumed tracking for ${this.activeTabInfo.domain}`);
  }

  private startActiveTimeTracking(): void {
    // Clear any existing interval
    this.stopActiveTimeTracking();

    // Use setInterval which works in both contexts
    this.activeTimeInterval = setInterval(() => {
      const now = Date.now();
      this.activeTabInfo.totalActiveTime! += (now - this.activeTabInfo.lastActiveTime!);
      this.activeTabInfo.lastActiveTime = now;
    }, 1000);
  }

  private stopActiveTimeTracking(): void {
    if (this.activeTimeInterval !== null) {
      clearInterval(this.activeTimeInterval);
      this.activeTimeInterval = null;
    }
  }


  private isTrackableUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      return url.startsWith('http') && 
             !url.startsWith('chrome://') && 
             !url.startsWith('chrome-extension://') &&
             !url.startsWith('moz-extension://') &&
             !url.startsWith('about:');
    } catch (error) {
      return false;
    }
  }
  
  private isNewDomain(newUrl: string): boolean {
    if (!this.activeTabInfo.url || !newUrl) return true;
    
    try {
      const currentDomain = new URL(this.activeTabInfo.url).hostname;
      const newDomain = new URL(newUrl).hostname;
      return currentDomain !== newDomain;
    } catch (e) {
      return true; // If any error parsing URLs, treat as new domain
    }
  }
}