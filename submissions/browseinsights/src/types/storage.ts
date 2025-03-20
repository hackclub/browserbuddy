/**
 * BrowseInsight - Storage Types
 * 
 * Type definitions for storage data structures
 */

import { CategoryName } from './categories';

export interface Visit {
  id: string;
  domain: string;
  url?: string;
  title?: string;
  visitStart: number;
  visitEnd: number;
  duration: number;
  activeTime: number;
  category?: CategoryName;
  engagementScore?: number;
}

export interface DomainSummary {
  domain: string;
  favicon?: string;
  totalVisits: number;
  totalTime: number;
  activeTime: number;
  categories?: CategoryName[];
  firstVisit: number;
  lastVisit: number;
  hourlyDistribution: number[];
}

export interface UserPreferences {
  id: string;
  isPaused: boolean;
  retentionDays: number;
  trackUrls: boolean;
  trackTitles: boolean;
  dashboardLayout: string;
  categorySettings: {
    [key: string]: {
      color?: string;
      isProductivity?: boolean;
      isDistraction?: boolean;
    }
  };
}

export interface StorageOptions {
  domain?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

export interface TimeframeStats {
  totalVisits: number;
  totalTime: number;
  totalActiveTime: number;
  uniqueDomains: number;
  timeRange: {
    start: number;
    end: number;
  };
  categoryBreakdown: {
    [key: string]: {
      totalTime: number;
      totalVisits: number;
      uniqueDomains: number;
    }
  };
  topDomains: {
    domain: string;
    totalTime: number;
    totalVisits: number;
    category: CategoryName;
    hourlyDistribution: number[];
  }[];
  hourlyActivity: number[];
  dailyActivity: number[];
  timeDistribution: {
    productive: number;
    neutral: number;
    distracting: number;
  };
  insights: any[]; // Adding the missing insights property
}

export interface DomainAnalytics {
  domain: string;
  totalVisits: number;
  totalTime: number;
  firstVisit: number;
  lastVisit: number;
  category: CategoryName;
  visitFrequency: {
    byDay: Record<string, number>;
    byHour: number[];
  };
  timeDistribution: {
    byHour: number[];
  };
  avgVisitDuration: number;
  longestVisit: {
    duration: number;
    timestamp: number;
  };
  hourlyDistribution: number[];
}

export interface ProductivityAnalytics {
  productivityScore: number;
  productivityByDay: Array<{
    date: string;
    productivePercentage: number;
    distractingPercentage: number;
    neutralPercentage: number;
    totalTime: number;
  }>;
  productiveTime: number;
  distractingTime: number;
  neutralTime: number;
}