/**
 * BrowseInsight - Analytics Processor
 * 
 * Processes raw browsing data into meaningful insights and visualizations.
 */

import { StorageManager } from '../background/storage';
import { CategoryClassifier } from './categories';
import { InsightGenerator } from './insights';
import { Visit, DomainSummary, TimeframeStats, DomainAnalytics, ProductivityAnalytics } from '../types/storage';

export class AnalyticsProcessor {
  private storage: StorageManager;
  private categoryClassifier: CategoryClassifier;
  private insightGenerator: InsightGenerator;
  private cachedStats: Record<string, TimeframeStats> = {};
  private cacheTimestamps: Record<string, number> = {};
  private CACHE_TTL: number = 5 * 60 * 1000; // 5 minutes
  
  constructor(storage: StorageManager) {
    this.storage = storage;
    this.categoryClassifier = new CategoryClassifier();
    this.insightGenerator = new InsightGenerator();
  }
  
  async processLatestData(): Promise<number> {
    try {
      // Get latest unprocessed visits
      const latestVisits = await this.storage.getVisits({
        // Fetch the last 24h of visits
        startDate: Date.now() - (24 * 60 * 60 * 1000)
      });
      
      // Process categories for these visits
      for (const visit of latestVisits) {
        // Only process visits without categories
        if (!visit.category) {
          visit.category = await this.categoryClassifier.classifyUrl(visit.domain, visit.url, visit.title);
          // Update visit with category
          await this.storage.updateVisit(visit);
        }
      }
      
      // Clear analytics cache since we've processed new data
      this.clearCache();
      
      return latestVisits.length;
    } catch (error) {
      console.error('Error processing latest data:', error);
      throw error;
    }
  }
  
  clearCache(): void {
    this.cachedStats = {};
    this.cacheTimestamps = {};
  }
  
  async generateStats(timeframe: string = 'day', options: any = {}): Promise<TimeframeStats> {
    const cacheKey = `${timeframe}-${JSON.stringify(options)}`;
    
    // Check if we have a recent cache
    if (this.cachedStats[cacheKey] && 
        (Date.now() - this.cacheTimestamps[cacheKey] < this.CACHE_TTL)) {
      return this.cachedStats[cacheKey];
    }
    
    try {
      // Set time range based on timeframe
      let startDate: number;
      const endDate = Date.now();
      
      switch (timeframe) {
        case 'day':
          startDate = endDate - (24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = endDate - (7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = endDate - (30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = endDate - (365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = endDate - (24 * 60 * 60 * 1000); // Default to 1 day
      }
      
      // Fetch visits within the time range
      const visits = await this.storage.getVisits({
        startDate,
        endDate
      });
      
      // Fetch domain summaries
      const domainSummaries = await this.storage.getDomainSummaries();
      
      // Generate basic stats
      const stats = this.computeBasicStats(visits, domainSummaries, startDate, endDate);
      
      // Generate insights
      stats.insights = this.insightGenerator.generateInsights(visits, domainSummaries, timeframe);
      
      // Cache the result
      this.cachedStats[cacheKey] = stats;
      this.cacheTimestamps[cacheKey] = Date.now();
      
      return stats;
    } catch (error) {
      console.error('Error generating stats:', error);
      throw error;
    }
  }
  
  private computeBasicStats(visits: Visit[], domainSummaries: DomainSummary[], startDate: number, endDate: number): TimeframeStats {
    // Basic stats calculations
    const stats: TimeframeStats = {
      totalVisits: visits.length,
      totalTime: visits.reduce((sum, visit) => sum + visit.duration, 0),
      totalActiveTime: visits.reduce((sum, visit) => sum + visit.activeTime, 0),
      uniqueDomains: new Set(visits.map(visit => visit.domain)).size,
      timeRange: {
        start: startDate,
        end: endDate
      },
      categoryBreakdown: {},
      topDomains: [],
      hourlyActivity: Array(24).fill(0),
      dailyActivity: Array(7).fill(0),
      timeDistribution: {
        productive: 0,
        neutral: 0,
        distracting: 0
      },
      insights: []
    };
    
    // Create category breakdown
    visits.forEach(visit => {
      const category = visit.category || 'uncategorized';
      if (!stats.categoryBreakdown[category]) {
        stats.categoryBreakdown[category] = {
          totalTime: 0,
          totalVisits: 0,
          uniqueDomains: 0
        };
      }
      
      stats.categoryBreakdown[category].totalTime += visit.duration;
      stats.categoryBreakdown[category].totalVisits += 1;
      
      // Update hourly activity
      const hour = new Date(visit.visitStart).getHours();
      stats.hourlyActivity[hour] += visit.duration;
      
      // Update daily activity
      const day = new Date(visit.visitStart).getDay();
      stats.dailyActivity[day] += visit.duration;
      
      // Update productivity distribution
      if (['work', 'education', 'productivity'].includes(category)) {
        stats.timeDistribution.productive += visit.duration;
      } else if (['social', 'news', 'shopping'].includes(category)) {
        stats.timeDistribution.neutral += visit.duration;
      } else if (['entertainment', 'games', 'video'].includes(category)) {
        stats.timeDistribution.distracting += visit.duration;
      } else {
        // Split uncategorized time evenly
        stats.timeDistribution.neutral += visit.duration;
      }
    });
    
    // Calculate unique domains per category
    const domainsByCategory: Record<string, Set<string>> = {};
    
    visits.forEach(visit => {
      const category = visit.category || 'uncategorized';
      if (!domainsByCategory[category]) {
        domainsByCategory[category] = new Set();
      }
      domainsByCategory[category].add(visit.domain);
    });
    
    // Update unique domain counts
    Object.entries(domainsByCategory).forEach(([category, domains]) => {
      if (stats.categoryBreakdown[category]) {
        stats.categoryBreakdown[category].uniqueDomains = domains.size;
      }
    });
    
    // Calculate top domains by time
    const domainTimeMap = new Map<string, number>();
    visits.forEach(visit => {
      const currentTime = domainTimeMap.get(visit.domain) || 0;
      domainTimeMap.set(visit.domain, currentTime + visit.duration);
    });
    
    // Convert to array and sort
    stats.topDomains = Array.from(domainTimeMap.entries())
      .map(([domain, time]) => {
        const summary = domainSummaries.find(ds => ds.domain === domain) || {
          domain,
          totalVisits: 0,
          totalTime: 0,
          activeTime: 0,
          firstVisit: 0,
          lastVisit: 0,
          hourlyDistribution: Array(24).fill(0)
        };
        
        return {
          domain,
          totalTime: time,
          totalVisits: visits.filter(v => v.domain === domain).length,
          category: visits.find(v => v.domain === domain)?.category || 'uncategorized',
          hourlyDistribution: summary.hourlyDistribution
        };
      })
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10);
    
    return stats;
  }
  
  async getDomainAnalytics(domain: string): Promise<DomainAnalytics> {
    try {
      // Get all visits for this domain
      const visits = await this.storage.getVisits({ domain });
      
      // Get domain summary
      const domainSummaries = await this.storage.getDomainSummaries();
      const domainSummary = domainSummaries.find(ds => ds.domain === domain);
      
      if (!visits.length) {
        throw new Error('No data available for this domain');
      }
      
      // Calculate visit trends
      const visitsByDay = new Map<string, number>();
      const visitsByHour = Array(24).fill(0);
      const timeByHour = Array(24).fill(0);
      
      visits.forEach(visit => {
        const date = new Date(visit.visitStart).toLocaleDateString();
        const hour = new Date(visit.visitStart).getHours();
        
        // Count by day
        if (!visitsByDay.has(date)) {
          visitsByDay.set(date, 0);
        }
        visitsByDay.set(date, visitsByDay.get(date)! + 1);
        
        // Count by hour
        visitsByHour[hour]++;
        timeByHour[hour] += visit.duration;
      });
      
      // Get longest session
      const longestVisit = visits.reduce((longest, visit) => 
        visit.duration > longest.duration ? visit : longest, visits[0]);
      
      // Calculate average visit length
      const avgDuration = visits.reduce((sum, visit) => 
        sum + visit.duration, 0) / visits.length;
      
      return {
        domain,
        totalVisits: visits.length,
        totalTime: visits.reduce((sum, visit) => sum + visit.duration, 0),
        firstVisit: visits.reduce((earliest, visit) => 
          visit.visitStart < earliest.visitStart ? visit : earliest, visits[0]).visitStart,
        lastVisit: visits.reduce((latest, visit) => 
          visit.visitEnd > latest.visitEnd ? visit : latest, visits[0]).visitEnd,
        category: visits[0].category || 'uncategorized',
        visitFrequency: {
          byDay: Object.fromEntries(visitsByDay),
          byHour: visitsByHour
        },
        timeDistribution: {
          byHour: timeByHour
        },
        avgVisitDuration: avgDuration,
        longestVisit: {
          duration: longestVisit.duration,
          timestamp: longestVisit.visitStart
        },
        hourlyDistribution: domainSummary?.hourlyDistribution || Array(24).fill(0)
      };
    } catch (error) {
      console.error('Error retrieving domain analytics:', error);
      throw error;
    }
  }
  
  async getProductivityAnalytics(): Promise<ProductivityAnalytics> {
    try {
      // Get visits from the past 30 days
      const startDate = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const visits = await this.storage.getVisits({ startDate });
      
      // Group by day
      const dailyStats: Record<string, { productive: number, neutral: number, distracting: number, total: number }> = {};
      
      visits.forEach(visit => {
        const date = new Date(visit.visitStart).toISOString().split('T')[0];
        
        if (!dailyStats[date]) {
          dailyStats[date] = {
            productive: 0,
            neutral: 0,
            distracting: 0,
            total: 0
          };
        }
        
        const category = visit.category || 'uncategorized';
        
        if (['work', 'education', 'productivity'].includes(category)) {
          dailyStats[date].productive += visit.duration;
        } else if (['social', 'news', 'shopping'].includes(category)) {
          dailyStats[date].neutral += visit.duration;
        } else if (['entertainment', 'games', 'video'].includes(category)) {
          dailyStats[date].distracting += visit.duration;
        } else {
          // Split uncategorized time evenly
          dailyStats[date].neutral += visit.duration;
        }
        
        dailyStats[date].total += visit.duration;
      });
      
      // Convert to array and sort by date
      const productivityByDay = Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          productivePercentage: stats.total > 0 ? (stats.productive / stats.total) * 100 : 0,
          distractingPercentage: stats.total > 0 ? (stats.distracting / stats.total) * 100 : 0,
          neutralPercentage: stats.total > 0 ? (stats.neutral / stats.total) * 100 : 0,
          totalTime: stats.total
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate productivity score (0-100)
      const totalProductiveTime = visits.reduce((sum, visit) => {
        const category = visit.category || 'uncategorized';
        return sum + (['work', 'education', 'productivity'].includes(category) ? visit.duration : 0);
      }, 0);
      
      const totalDistractingTime = visits.reduce((sum, visit) => {
        const category = visit.category || 'uncategorized';
        return sum + (['entertainment', 'games', 'video'].includes(category) ? visit.duration : 0);
      }, 0);
      
      const totalTime = visits.reduce((sum, visit) => sum + visit.duration, 0);
      
      let productivityScore = 50; // Default neutral score
      
      if (totalTime > 0) {
        // Weight productive time positively and distracting time negatively
        productivityScore = Math.min(100, Math.max(0, 
          50 + (totalProductiveTime / totalTime * 50) - (totalDistractingTime / totalTime * 50)
        ));
      }
      
      return {
        productivityScore: Math.round(productivityScore),
        productivityByDay,
        productiveTime: totalProductiveTime,
        distractingTime: totalDistractingTime,
        neutralTime: totalTime - totalProductiveTime - totalDistractingTime
      };
    } catch (error) {
      console.error('Error analyzing productivity:', error);
      throw error;
    }
  }
}