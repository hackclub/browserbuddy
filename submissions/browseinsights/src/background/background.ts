/**
 * BrowseInsight - Background Service
 *
 * Main background service that coordinates tracking, storage,
 * and analytics processes.
 */

import { StorageManager } from './storage';
import { BrowsingTracker } from './tracker';
import { AnalyticsProcessor } from '../analytics/processor';
import {TimeframeStats, ProductivityAnalytics, DomainAnalytics, UserPreferences} from '../types/storage';

class BackgroundService {
  private storage: StorageManager;
  private tracker: BrowsingTracker;
  private processor: AnalyticsProcessor;

  private isInitialized: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    this.storage = new StorageManager();
    this.tracker = new BrowsingTracker(this.storage);
    this.processor = new AnalyticsProcessor(this.storage);

    // Initialize extension
    this.init();
  }

  async init(): Promise<void> {
    try {
      // Initialize storage
      await this.storage.initialize();

      // Load user preferences
      const prefs = await this.storage.getPreferences();
      this.isPaused = prefs.isPaused;

      // Start tracking if not paused
      if (!this.isPaused) {
        this.tracker.startTracking();
      }

      // Set up message listeners for UI communication
      this.setupMessageListeners();

      // Set up periodic tasks
      this.setupPeriodicTasks();

      this.isInitialized = true;
      console.log('BrowseInsight background service initialized');
    } catch (error) {
      console.error('Failed to initialize background service:', error);
    }
  }

  private setupMessageListeners(): void {
    // Listen for messages from popup and options pages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'getStats':
          this.handleGetStats(request, sendResponse);
          return true; // Keep channel open for async response

        case 'toggleTracking':
          this.handleToggleTracking(request.value);
          sendResponse({ success: true });
          break;

        case 'clearData':
          this.handleClearData(request.timeframe)
              .then(() => sendResponse({ success: true }))
              .catch((error) => sendResponse({ success: false, error: error.message }));
          return true; // Keep channel open for async response

        case 'exportData':
          this.handleExportData(request.format)
              .then((data) => sendResponse({ success: true, data }))
              .catch((error) => sendResponse({ success: false, error: error.message }));
          return true; // Keep channel open for async response

        case 'updateSettings':
          this.handleUpdateSettings(request.settings)
              .then(() => sendResponse({ success: true }))
              .catch((error) => sendResponse({ success: false, error: error.message }));
          return true; // Keep channel open for async response

        case 'getDomainAnalytics':
          this.handleGetDomainAnalytics(request.domain)
              .then((data) => sendResponse({ success: true, data }))
              .catch((error) => sendResponse({ success: false, error: error.message }));
          return true; // Keep channel open for async response

        case 'getProductivityAnalytics':
          this.handleGetProductivityAnalytics()
              .then((data) => sendResponse({ success: true, data }))
              .catch((error) => sendResponse({ success: false, error: error.message }));
          return true; // Keep channel open for async response
      }
    });
  }

  private setupPeriodicTasks(): void {
    // Set up data cleanup based on retention policy
    chrome.alarms.create('dataRetentionCleanup', { periodInMinutes: 60 * 24 }); // Daily

    // Set up regular analytics processing
    chrome.alarms.create('processAnalytics', { periodInMinutes: 60 }); // Hourly

    // Listen for alarm events
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'dataRetentionCleanup') {
        this.storage.performRetentionCleanup();
      } else if (alarm.name === 'processAnalytics') {
        this.processor.processLatestData();
      }
    });
  }

  private async handleGetStats(request: any, sendResponse: (response: any) => void): Promise<void> {
    try {
      const timeframe = request.timeframe || 'day';
      const stats = await this.processor.generateStats(timeframe);
      sendResponse({ success: true, stats });
    } catch (error) {
      sendResponse({ success: false, error: (error as Error).message });
    }
  }

  private handleToggleTracking(shouldTrack: boolean): void {
    this.isPaused = !shouldTrack;
    if (shouldTrack) {
      this.tracker.startTracking();
    } else {
      this.tracker.stopTracking();
    }

    // Save preference
    this.storage.savePreferences({ isPaused: this.isPaused });
  }

  private async handleClearData(timeframe: string): Promise<void> {
    return this.storage.clearData(timeframe);
  }

  private async handleExportData(format: 'json' | 'csv'): Promise<string> {
    return this.storage.exportData(format);
  }

  private async handleUpdateSettings(settings: any): Promise<UserPreferences> {
    return this.storage.savePreferences(settings);
  }

  private async handleGetDomainAnalytics(domain: string): Promise<DomainAnalytics> {
    return this.processor.getDomainAnalytics(domain);
  }

  private async handleGetProductivityAnalytics(): Promise<ProductivityAnalytics> {
    return this.processor.getProductivityAnalytics();
  }
}

// Initialize the background service
const backgroundService = new BackgroundService();

// Make it accessible for debugging in service worker context
// In Manifest V3, we use 'self' instead of 'window'
// @ts-ignore - Ignore TypeScript error for global assignment
self.browseInsightService = backgroundService;