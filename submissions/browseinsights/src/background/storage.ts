/**
 * BrowseInsight - Storage Manager
 * 
 * Manages persistent storage of browsing data and preferences
 * using IndexedDB as the primary storage mechanism.
 */

import { Visit, DomainSummary, UserPreferences, StorageOptions } from '../types/storage';

export class StorageManager {
  private DB_NAME: string = 'BrowseInsightDB';
  private DB_VERSION: number = 1;
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = (event) => {
        console.error('Database error:', event.target);
        reject(new Error('Failed to open database'));
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        console.log('Database opened successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('visits')) {
          const visitStore = db.createObjectStore('visits', { keyPath: 'id' });
          visitStore.createIndex('domain', 'domain', { unique: false });
          visitStore.createIndex('visitStart', 'visitStart', { unique: false });
          visitStore.createIndex('visitEnd', 'visitEnd', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('domainSummaries')) {
          const domainStore = db.createObjectStore('domainSummaries', { keyPath: 'domain' });
          domainStore.createIndex('totalTime', 'totalTime', { unique: false });
          domainStore.createIndex('lastVisit', 'lastVisit', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'name' });
        }
        
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'id' });
        }
      };
    });
  }
  
  async saveVisit(visitData: Omit<Visit, 'id'>): Promise<Visit> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    // Generate a UUID for the visit
    const id = crypto.randomUUID();
    const visit: Visit = { ...visitData, id };
    
    return new Promise<Visit>((resolve, reject) => {
      const transaction = this.db!.transaction(['visits', 'domainSummaries'], 'readwrite');
      
      transaction.onerror = (event) => {
        reject(new Error('Transaction error: ' + (event.target as any).error));
      };
      
      // Save the visit record
      const visitStore = transaction.objectStore('visits');
      visitStore.add(visit);
      
      // Update domain summary
      const domainStore = transaction.objectStore('domainSummaries');
      const domainRequest = domainStore.get(visit.domain);
      
      domainRequest.onsuccess = () => {
        const domainSummary: DomainSummary = domainRequest.result || {
          domain: visit.domain,
          totalVisits: 0,
          totalTime: 0,
          activeTime: 0,
          firstVisit: visit.visitStart,
          lastVisit: 0,
          hourlyDistribution: Array(24).fill(0)
        };
        
        // Update summary statistics
        domainSummary.totalVisits++;
        domainSummary.totalTime += visit.duration;
        domainSummary.activeTime += visit.activeTime;
        domainSummary.lastVisit = visit.visitEnd;
        
        // Update hourly distribution
        const hour = new Date(visit.visitStart).getHours();
        domainSummary.hourlyDistribution[hour]++;
        
        // Store updated summary
        domainStore.put(domainSummary);
      };
      
      transaction.oncomplete = () => {
        resolve(visit);
      };
    });
  }
  
  async updateVisit(visit: Visit): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['visits'], 'readwrite');
      const store = transaction.objectStore('visits');
      
      const request = store.put(visit);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to update visit'));
      };
    });
  }
  
  async getVisits(options: StorageOptions = {}): Promise<Visit[]> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    const { domain, startDate, endDate, limit } = options;
    
    return new Promise<Visit[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['visits'], 'readonly');
      const store = transaction.objectStore('visits');
      
      let request: IDBRequest;
      if (domain) {
        // Query by domain
        const index = store.index('domain');
        request = index.getAll(domain);
      } else if (startDate && endDate) {
        // Query by date range
        const index = store.index('visitStart');
        const range = IDBKeyRange.bound(startDate, endDate);
        request = index.getAll(range);
      } else if (startDate) {
        // Query by start date (newer than)
        const index = store.index('visitStart');
        const range = IDBKeyRange.lowerBound(startDate);
        request = index.getAll(range);
      } else if (endDate) {
        // Query by end date (older than)
        const index = store.index('visitStart');
        const range = IDBKeyRange.upperBound(endDate);
        request = index.getAll(range);
      } else {
        // Get all visits
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let results = request.result;
        
        // Apply limit if specified
        if (limit && results.length > limit) {
          results = results.slice(0, limit);
        }
        
        resolve(results);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to retrieve visits'));
      };
    });
  }
  
  async getDomainSummaries(): Promise<DomainSummary[]> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise<DomainSummary[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['domainSummaries'], 'readonly');
      const store = transaction.objectStore('domainSummaries');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to retrieve domain summaries'));
      };
    });
  }
  
  async savePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    // Get existing preferences
    const existing = await this.getPreferences();
    
    // Merge with new preferences
    const merged: UserPreferences = {
      ...existing,
      ...preferences,
      id: 'userPreferences'
    };
    
    return new Promise<UserPreferences>((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      
      const request = store.put(merged);
      
      request.onsuccess = () => {
        resolve(merged);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to save preferences'));
      };
    });
  }
  
  async getPreferences(): Promise<UserPreferences> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise<UserPreferences>((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.get('userPreferences');
      
      request.onsuccess = () => {
        const defaultPrefs: UserPreferences = {
          id: 'userPreferences',
          isPaused: false,
          retentionDays: 90,
          trackUrls: false,
          trackTitles: true,
          dashboardLayout: 'default',
          categorySettings: {}
        };
        
        resolve(request.result || defaultPrefs);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to retrieve preferences'));
      };
    });
  }
  
  async clearData(timeframe: string): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    let cutoffDate: number;
    const now = Date.now();
    
    // Calculate cutoff date based on timeframe
    switch (timeframe) {
      case 'day':
        cutoffDate = now - (24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffDate = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        // Clear all data
        return this.clearAllData();
      default:
        throw new Error('Invalid timeframe');
    }
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['visits'], 'readwrite');
      const visitStore = transaction.objectStore('visits');
      const index = visitStore.index('visitEnd');
      const range = IDBKeyRange.upperBound(cutoffDate);
      
      // Get all visits to remove
      const request = index.getAll(range);
      
      request.onsuccess = () => {
        const visitsToRemove = request.result;
        
        // Delete each visit
        let deleteCounter = 0;
        visitsToRemove.forEach((visit) => {
          const deleteRequest = visitStore.delete(visit.id);
          deleteRequest.onsuccess = () => {
            deleteCounter++;
            if (deleteCounter === visitsToRemove.length) {
              // After deleting visits, recalculate domain summaries
              this.recalculateDomainSummaries().then(resolve).catch(reject);
            }
          };
        });
        
        // If no visits to remove, resolve immediately
        if (visitsToRemove.length === 0) {
          resolve();
        }
      };
      
      request.onerror = () => {
        reject(new Error('Failed to clear data'));
      };
    });
  }
  
  async clearAllData(): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['visits', 'domainSummaries'], 'readwrite');
      const visitStore = transaction.objectStore('visits');
      const domainStore = transaction.objectStore('domainSummaries');
      
      // Clear all visits
      const clearVisits = visitStore.clear();
      
      clearVisits.onsuccess = () => {
        // Clear all domain summaries
        const clearDomains = domainStore.clear();
        
        clearDomains.onsuccess = () => {
          resolve();
        };
        
        clearDomains.onerror = () => {
          reject(new Error('Failed to clear domain summaries'));
        };
      };
      
      clearVisits.onerror = () => {
        reject(new Error('Failed to clear visits'));
      };
    });
  }
  
  async performRetentionCleanup(): Promise<void> {
    try {
      const prefs = await this.getPreferences();
      const retentionDays = prefs.retentionDays || 90;
      const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
      
      return new Promise<void>((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }
        
        const transaction = this.db.transaction(['visits'], 'readwrite');
        const visitStore = transaction.objectStore('visits');
        const index = visitStore.index('visitEnd');
        const range = IDBKeyRange.upperBound(cutoffDate);
        
        const request = index.openCursor(range);
        let deletedCount = 0;
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor) {
            visitStore.delete(cursor.value.id);
            deletedCount++;
            cursor.continue();
          } else {
            console.log(`Retention cleanup completed. Deleted ${deletedCount} records`);
            
            // After deleting old visits, recalculate domain summaries
            if (deletedCount > 0) {
              this.recalculateDomainSummaries().then(resolve).catch(reject);
            } else {
              resolve();
            }
          }
        };
        
        request.onerror = () => {
          reject(new Error('Retention cleanup failed'));
        };
      });
    } catch (error) {
      console.error('Error during retention cleanup:', error);
      throw error;
    }
  }
  
  async recalculateDomainSummaries(): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['visits', 'domainSummaries'], 'readwrite');
      const visitStore = transaction.objectStore('visits');
      const domainStore = transaction.objectStore('domainSummaries');
      
      // Clear domain summaries
      const clearRequest = domainStore.clear();
      
      clearRequest.onsuccess = () => {
        // Get all visits
        const visitsRequest = visitStore.getAll();
        
        visitsRequest.onsuccess = () => {
          const visits = visitsRequest.result;
          const domainMap = new Map<string, DomainSummary>();
          
          // Group visits by domain
          visits.forEach(visit => {
            if (!domainMap.has(visit.domain)) {
              domainMap.set(visit.domain, {
                domain: visit.domain,
                totalVisits: 0,
                totalTime: 0,
                activeTime: 0,
                firstVisit: visit.visitStart,
                lastVisit: 0,
                hourlyDistribution: Array(24).fill(0)
              });
            }
            
            const summary = domainMap.get(visit.domain)!;
            summary.totalVisits++;
            summary.totalTime += visit.duration;
            summary.activeTime += visit.activeTime;
            summary.lastVisit = Math.max(summary.lastVisit, visit.visitEnd);
            summary.firstVisit = Math.min(summary.firstVisit, visit.visitStart);
            
            // Update hourly distribution
            const hour = new Date(visit.visitStart).getHours();
            summary.hourlyDistribution[hour]++;
          });
          
          // Store updated summaries
          const promises: Promise<void>[] = [];
          domainMap.forEach(summary => {
            promises.push(new Promise<void>(resolveStore => {
              domainStore.add(summary);
              resolveStore();
            }));
          });
          
          // Wait for all summaries to be stored
          Promise.all(promises).then(() => resolve()).catch(reject);
        };
        
        visitsRequest.onerror = () => {
          reject(new Error('Failed to retrieve visits for recalculation'));
        };
      };
      
      clearRequest.onerror = () => {
        reject(new Error('Failed to clear domain summaries'));
      };
    });
  }
  
  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // Get all data to export
      const visits = await this.getVisits();
      const domainSummaries = await this.getDomainSummaries();
      const preferences = await this.getPreferences();
      
      const exportData = {
        visits,
        domainSummaries,
        preferences,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };
      
      // Format data according to requested format
      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      } else if (format === 'csv') {
        // Convert visits to CSV format
        let csv = "domain,url,title,visitStart,visitEnd,duration,activeTime\n";
        visits.forEach(visit => {
          csv += `"${visit.domain}","${visit.url || ''}","${(visit.title || '').replace(/"/g, '""')}",${visit.visitStart},${visit.visitEnd},${visit.duration},${visit.activeTime}\n`;
        });
        return csv;
      } else {
        throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}