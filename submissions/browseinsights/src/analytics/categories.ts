/**
 * BrowseInsight - Category Classifier
 *
 * Classifies websites into meaningful categories based on
 * domain content data from websitecategorizationapi.com
 */
import {CategoryName} from "../types/categories";
import {getCategoriesForDomain, mapToInternalCategory} from "./utils";


export class CategoryClassifier {
  private userDefinedCategories: Map<string, CategoryName>;
  private domainCategoryCache: Map<string, CategoryName>;

  constructor() {
    this.domainCategoryCache = new Map<string, CategoryName>();
    this.userDefinedCategories = new Map<string, CategoryName>();
    this.loadUserDefinedCategories();
  }

  private async loadUserDefinedCategories(): Promise<void> {
    try {
      // Load user-defined categories from browser storage
      const storage = await this.getStorage().get('userDefinedCategories');

      if (storage.userDefinedCategories) {
        // Convert from object to Map
        const userCategories = storage.userDefinedCategories as Record<string, CategoryName>;
        Object.entries(userCategories).forEach(([domain, category]) => {
          this.userDefinedCategories.set(domain, category);
        });

        console.log(`Loaded ${this.userDefinedCategories.size} user-defined categories`);
      }
    } catch (error) {
      console.error('Failed to load user-defined categories:', error);
    }
  }

  async classifyUrl(domain: string, url?: string, title?: string): Promise<CategoryName> {
    // First priority: Check user defined categories
    const userCategory = this.getUserDefinedCategory(domain);
    if (userCategory) {
      return userCategory;
    }

    // Second priority: Check cache
    if (this.domainCategoryCache.has(domain)) {
      return this.domainCategoryCache.get(domain) as CategoryName;
    }

    // Third priority: Use domain categorization data
    const categoriesFromData = getCategoriesForDomain(domain);
    if (categoriesFromData && categoriesFromData.length > 0) {
      const category = mapToInternalCategory(categoriesFromData);
      this.domainCategoryCache.set(domain, category);
      return category;
    }

    // If domain is not found, try to use the title or URL for contextual clues
    if (title) {
      const titleCategory = this.classifyByContent(title.toLowerCase());
      if (titleCategory !== 'uncategorized') {
        this.domainCategoryCache.set(domain, titleCategory);
        return titleCategory;
      }
    }

    if (url) {
      const urlCategory = this.classifyByContent(url.toLowerCase());
      if (urlCategory !== 'uncategorized') {
        this.domainCategoryCache.set(domain, urlCategory);
        return urlCategory;
      }
    }

    // Default category if no matches found
    this.domainCategoryCache.set(domain, 'uncategorized');
    return 'uncategorized';
  }

  private classifyByContent(content: string): CategoryName {
    // Simple keyword-based classification as fallback
    const contentLower = content.toLowerCase();

    if (contentLower.includes('docs') || contentLower.includes('sheets') ||
        contentLower.includes('slides') || contentLower.includes('office') ||
        contentLower.includes('productivity')) {
      return 'productivity';
    }

    if (contentLower.includes('learn') || contentLower.includes('course') ||
        contentLower.includes('edu') || contentLower.includes('school') ||
        contentLower.includes('university')) {
      return 'education';
    }

    if (contentLower.includes('shop') || contentLower.includes('buy') ||
        contentLower.includes('store') || contentLower.includes('price') ||
        contentLower.includes('product')) {
      return 'shopping';
    }

    if (contentLower.includes('social') || contentLower.includes('friend') ||
        contentLower.includes('network') || contentLower.includes('share') ||
        contentLower.includes('connect')) {
      return 'social';
    }

    if (contentLower.includes('news') || contentLower.includes('weather') ||
        contentLower.includes('report') || contentLower.includes('article')) {
      return 'news';
    }

    if (contentLower.includes('video') || contentLower.includes('watch') ||
        contentLower.includes('movie') || contentLower.includes('tv') ||
        contentLower.includes('series')) {
      return 'video';
    }

    if (contentLower.includes('game') || contentLower.includes('play') ||
        contentLower.includes('gaming') || contentLower.includes('esports')) {
      return 'games';
    }

    if (contentLower.includes('tech') || contentLower.includes('code') ||
        contentLower.includes('develop') || contentLower.includes('programming')) {
      return 'technology';
    }

    if (contentLower.includes('finance') || contentLower.includes('bank') ||
        contentLower.includes('money') || contentLower.includes('invest')) {
      return 'finance';
    }

    if (contentLower.includes('travel') || contentLower.includes('hotel') ||
        contentLower.includes('flight') || contentLower.includes('vacation')) {
      return 'travel';
    }

    if (contentLower.includes('health') || contentLower.includes('fitness') ||
        contentLower.includes('medical') || contentLower.includes('doctor')) {
      return 'health';
    }

    // Default
    return 'uncategorized';
  }

  getUserDefinedCategory(domain: string): CategoryName | null {
    const normalizedDomain = this.normalizeDomain(domain);
    return this.userDefinedCategories.get(normalizedDomain) || null;
  }

  async updateCategoryForDomain(domain: string, category: CategoryName): Promise<void> {
    try {
      const normalizedDomain = this.normalizeDomain(domain);

      // Update in-memory map
      this.userDefinedCategories.set(normalizedDomain, category);

      // Update cache
      this.domainCategoryCache.set(normalizedDomain, category);

      // Convert Map to object for storage
      const categoriesObject: Record<string, CategoryName> = {};
      this.userDefinedCategories.forEach((value, key) => {
        categoriesObject[key] = value;
      });

      // Store in browser's storage
      await this.getStorage().set({
        userDefinedCategories: categoriesObject
      });

      console.log(`Updated category for ${normalizedDomain} to ${category}`);
    } catch (error) {
      console.error(`Failed to update category for ${domain}:`, error);
    }
  }

  // Get all user defined categories
  getUserDefinedCategories(): Array<{domain: string, category: CategoryName}> {
    const categories: Array<{domain: string, category: CategoryName}> = [];

    this.userDefinedCategories.forEach((category, domain) => {
      categories.push({ domain, category });
    });

    return categories.sort((a, b) => a.domain.localeCompare(b.domain));
  }

  // Delete a user defined category
  async deleteUserDefinedCategory(domain: string): Promise<void> {
    try {
      const normalizedDomain = this.normalizeDomain(domain);

      // Remove from in-memory map
      this.userDefinedCategories.delete(normalizedDomain);

      // Remove from cache
      this.domainCategoryCache.delete(normalizedDomain);

      // Convert Map to object for storage
      const categoriesObject: Record<string, CategoryName> = {};
      this.userDefinedCategories.forEach((value, key) => {
        categoriesObject[key] = value;
      });

      // Store in browser's storage
      await this.getStorage().set({
        userDefinedCategories: categoriesObject
      });

      console.log(`Deleted user category for ${normalizedDomain}`);
    } catch (error) {
      console.error(`Failed to delete category for ${domain}:`, error);
    }
  }

  // Helper to normalize domain names for consistent storage/lookup
  private normalizeDomain(domain: string): string {
    return domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
  }

  // Helper to get the appropriate storage API (works in both Chrome and Firefox)
  private getStorage() {
    // Use chrome API by default
    const api = chrome?.storage?.local;

    // If not available and we're in a context where window is defined
    if (!api && typeof window !== 'undefined') {
      // Check for browser namespace (Firefox)
      const firefoxAPI = (window as any)?.browser?.storage?.local;
      if (firefoxAPI) {
        return firefoxAPI;
      }
    }

    // Fall back to chrome API
    return api;
  }
}