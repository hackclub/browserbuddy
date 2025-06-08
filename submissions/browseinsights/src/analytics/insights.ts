/**
 * BrowseInsight - Insight Generator
 * 
 * Generates meaningful insights from browsing data
 */

import { Visit, DomainSummary } from '../types/storage';
import { CategoryName } from '../types/categories';

interface TimePattern {
  hour: number;
  day: number;
  score: number;
}

export interface Insight {
  id: string;
  type: 'highlight' | 'pattern' | 'recommendation' | 'summary';
  title: string;
  description: string;
  data?: any;
  iconType?: string;
}

export class InsightGenerator {
  generateInsights(
    visits: Visit[], 
    domainSummaries: DomainSummary[], 
    timeframe: string
  ): Insight[] {
    const insights: Insight[] = [];
    
    if (visits.length === 0) {
      return [{
        id: 'no-data',
        type: 'summary',
        title: 'No browsing data available',
        description: 'Start browsing to generate insights',
        iconType: 'info'
      }];
    }
    
    // Add basic usage insights
    this.addUsageInsights(insights, visits, timeframe);
    
    // Add time pattern insights
    this.addTimePatternInsights(insights, visits);
    
    // Add category insights
    this.addCategoryInsights(insights, visits);
    
    // Add productivity insights
    this.addProductivityInsights(insights, visits);
    
    // Add domain-specific insights
    this.addDomainSpecificInsights(insights, visits, domainSummaries);
    
    return insights;
  }
  
  private addUsageInsights(insights: Insight[], visits: Visit[], timeframe: string): void {
    const totalTime = visits.reduce((sum, visit) => sum + visit.duration, 0);
    const totalActiveTime = visits.reduce((sum, visit) => sum + visit.activeTime, 0);
    const uniqueDomains = new Set(visits.map(visit => visit.domain)).size;
    
    // Total browsing time
    const hours = Math.floor(totalTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    
    insights.push({
      id: 'total-time',
      type: 'summary',
      title: 'Total browsing time',
      description: `You spent ${hours} hours and ${minutes} minutes browsing during this ${timeframe}`,
      data: { totalTime, totalActiveTime },
      iconType: 'clock'
    });
    
    // Engagement level
    if (totalTime > 0) {
      const engagementPercent = Math.round((totalActiveTime / totalTime) * 100);
      let engagementLevel = 'moderate';
      
      if (engagementPercent > 75) engagementLevel = 'high';
      else if (engagementPercent < 40) engagementLevel = 'passive';
      
      insights.push({
        id: 'engagement-level',
        type: 'highlight',
        title: `${engagementLevel[0].toUpperCase() + engagementLevel.slice(1)} engagement`,
        description: `You actively engaged with ${engagementPercent}% of your browsing time`,
        data: { engagementPercent },
        iconType: 'engagement'
      });
    }
    
    // Domain diversity
    const diversityRating = 
      uniqueDomains < 5 ? 'limited' :
      uniqueDomains < 15 ? 'moderate' :
      'diverse';
    
    insights.push({
      id: 'domain-diversity',
      type: 'highlight',
      title: `${diversityRating[0].toUpperCase() + diversityRating.slice(1)} browsing variety`,
      description: `You visited ${uniqueDomains} different websites during this ${timeframe}`,
      data: { uniqueDomains },
      iconType: 'variety'
    });
  }
  
  private addTimePatternInsights(insights: Insight[], visits: Visit[]): void {
    // Create hour distribution
    const hourlyDistribution = Array(24).fill(0);
    const weekdayDistribution = Array(7).fill(0);
    
    visits.forEach(visit => {
      const date = new Date(visit.visitStart);
      const hour = date.getHours();
      const day = date.getDay();
      
      hourlyDistribution[hour] += visit.duration;
      weekdayDistribution[day] += visit.duration;
    });
    
    // Find peak browsing hours
    const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    const peakHourFormatted = peakHour > 12 ? 
      `${peakHour - 12} PM` : 
      peakHour === 0 ? '12 AM' : 
      peakHour === 12 ? '12 PM' : 
      `${peakHour} AM`;
    
    if (Math.max(...hourlyDistribution) > 0) {
      insights.push({
        id: 'peak-hour',
        type: 'pattern',
        title: 'Peak browsing time',
        description: `Your peak browsing time is around ${peakHourFormatted}`,
        data: { peakHour, hourlyDistribution },
        iconType: 'peak'
      });
    }
    
    // Find browsing patterns
    const patterns = this.detectTimePatterns(visits);
    if (patterns.length > 0) {
      const topPattern = patterns[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      insights.push({
        id: 'recurring-pattern',
        type: 'pattern',
        title: 'Browsing habit detected',
        description: `You tend to browse frequently on ${dayNames[topPattern.day]} around ${topPattern.hour > 12 ? topPattern.hour - 12 : topPattern.hour}${topPattern.hour >= 12 ? 'PM' : 'AM'}`,
        data: { pattern: topPattern },
        iconType: 'habit'
      });
    }
  }
  
  private detectTimePatterns(visits: Visit[]): TimePattern[] {
    const hourDayMatrix: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
    
    // Fill the hour-day matrix
    visits.forEach(visit => {
      const date = new Date(visit.visitStart);
      const hour = date.getHours();
      const day = date.getDay();
      
      hourDayMatrix[day][hour] += visit.duration;
    });
    
    // Find patterns (local maxima)
    const patterns: TimePattern[] = [];
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const current = hourDayMatrix[day][hour];
        if (current === 0) continue;
        
        // Check if this is a local maximum
        const isMax = this.isLocalMaximum(hourDayMatrix, day, hour);
        
        if (isMax) {
          patterns.push({
            day,
            hour,
            score: current
          });
        }
      }
    }
    
    // Sort patterns by score
    return patterns.sort((a, b) => b.score - a.score);
  }
  
  private isLocalMaximum(matrix: number[][], day: number, hour: number): boolean {
    const current = matrix[day][hour];
    const threshold = current * 0.7; // 70% of current value
    
    // Check neighboring cells (wrap around for hours)
    const prevHour = (hour + 23) % 24;
    const nextHour = (hour + 1) % 24;
    
    return current > threshold && 
           current >= matrix[day][prevHour] && 
           current >= matrix[day][nextHour];
  }
  
  private addCategoryInsights(insights: Insight[], visits: Visit[]): void {
    // Group visits by category
    const categories = new Map<CategoryName, number>();
    
    visits.forEach(visit => {
      const category = visit.category || 'uncategorized';
      categories.set(
        category, 
        (categories.get(category) || 0) + visit.duration
      );
    });
    
    // Find top category
    let topCategory: CategoryName = 'uncategorized';
    let topTime = 0;
    
    categories.forEach((time, category) => {
      if (time > topTime) {
        topTime = time;
        topCategory = category;
      }
    });
    
    const minutes = Math.round(topTime / (1000 * 60));
    
    if (topCategory !== 'uncategorized') {
      insights.push({
        id: 'top-category',
        type: 'highlight',
        title: `Most time in ${this.formatCategoryName(topCategory)}`,
        description: `You spent ${minutes} minutes browsing ${this.formatCategoryName(topCategory)} websites`,
        data: { category: topCategory, time: topTime },
        iconType: 'category'
      });
    }
    
    // Find category balance
    const productiveCategories = ['work', 'education', 'productivity'];
    const distractingCategories = ['entertainment', 'games', 'video'];
    
    const productiveTime = Array.from(categories.entries())
      .filter(([cat]) => productiveCategories.includes(cat))
      .reduce((sum, [, time]) => sum + time, 0);
      
    const distractingTime = Array.from(categories.entries())
      .filter(([cat]) => distractingCategories.includes(cat))
      .reduce((sum, [, time]) => sum + time, 0);
    
    const totalTime = Array.from(categories.values()).reduce((sum, time) => sum + time, 0);
    
    if (totalTime > 0) {
      const productivePercent = Math.round((productiveTime / totalTime) * 100);
      const distractingPercent = Math.round((distractingTime / totalTime) * 100);
      
      if (productiveTime > distractingTime && productivePercent > 25) {
        insights.push({
          id: 'productivity-balance',
          type: 'highlight',
          title: 'Productive browsing balance',
          description: `${productivePercent}% of your browsing was on productive sites`,
          data: { productivePercent, distractingPercent },
          iconType: 'productive'
        });
      } else if (distractingTime > productiveTime && distractingPercent > 25) {
        insights.push({
          id: 'distraction-balance',
          type: 'recommendation',
          title: 'High entertainment time',
          description: `${distractingPercent}% of your browsing was on entertainment sites`,
          data: { productivePercent, distractingPercent },
          iconType: 'distraction'
        });
      }
    }
  }
  
  private addProductivityInsights(insights: Insight[], visits: Visit[]): void {
    // Group by part of day
    const morning = this.filterVisitsByTimeRange(visits, 5, 11);
    const afternoon = this.filterVisitsByTimeRange(visits, 12, 17);
    const evening = this.filterVisitsByTimeRange(visits, 18, 23);
    const night = this.filterVisitsByTimeRange(visits, 0, 4);
    
    const timeframes = [
      { name: 'morning', visits: morning },
      { name: 'afternoon', visits: afternoon },
      { name: 'evening', visits: evening },
      { name: 'night', visits: night }
    ];
    
    // Find most productive timeframe
    const productiveCategories = new Set(['work', 'education', 'productivity']);
    let mostProductiveTime = '';
    let highestProductiveRatio = 0;
    
    for (const frame of timeframes) {
      if (frame.visits.length === 0) continue;
      
      const productiveTime = frame.visits
        .filter(v => v.category && productiveCategories.has(v.category))
        .reduce((sum, v) => sum + v.duration, 0);
        
      const totalTime = frame.visits.reduce((sum, v) => sum + v.duration, 0);
      
      const ratio = totalTime > 0 ? productiveTime / totalTime : 0;
      
      if (ratio > highestProductiveRatio && ratio > 0.4) { // At least 40% productive
        highestProductiveRatio = ratio;
        mostProductiveTime = frame.name;
      }
    }
    
    if (mostProductiveTime) {
      insights.push({
        id: 'productive-timeframe',
        type: 'pattern',
        title: 'Most productive time',
        description: `You're most productive during the ${mostProductiveTime}`,
        data: { timeframe: mostProductiveTime, ratio: highestProductiveRatio },
        iconType: 'productive-time'
      });
    }
    
    // Long session detection
    const longSessions = visits.filter(v => v.duration > 45 * 60 * 1000); // >45 min
    if (longSessions.length > 0) {
      // Sort by duration
      longSessions.sort((a, b) => b.duration - a.duration);
      const longest = longSessions[0];
      
      const minutes = Math.round(longest.duration / (1000 * 60));
      insights.push({
        id: 'long-session',
        type: 'highlight',
        title: 'Deep focus session',
        description: `You spent ${minutes} minutes on ${longest.domain}`,
        data: { visit: longest },
        iconType: 'focus'
      });
    }
  }
  
  private filterVisitsByTimeRange(visits: Visit[], startHour: number, endHour: number): Visit[] {
    return visits.filter(visit => {
      const hour = new Date(visit.visitStart).getHours();
      return hour >= startHour && hour <= endHour;
    });
  }
  
  private addDomainSpecificInsights(
    insights: Insight[], 
    visits: Visit[], 
    domainSummaries: DomainSummary[]
  ): void {
    // Find most visited domains
    const domainCounts = new Map<string, number>();
    visits.forEach(visit => {
      domainCounts.set(visit.domain, (domainCounts.get(visit.domain) || 0) + 1);
    });
    
    // Find top domain by visit count
    let topDomain = '';
    let topCount = 0;
    
    domainCounts.forEach((count, domain) => {
      if (count > topCount) {
        topCount = count;
        topDomain = domain;
      }
    });
    
    if (topDomain && topCount >= 5) {
      insights.push({
        id: 'frequent-domain',
        type: 'highlight',
        title: 'Most visited site',
        description: `You visited ${topDomain} ${topCount} times`,
        data: { domain: topDomain, count: topCount },
        iconType: 'favorite'
      });
    }
    
    // Check for domain time trends (significant changes)
    const currentDomains = new Set(visits.map(v => v.domain));
    
    for (const domain of currentDomains) {
      const summary = domainSummaries.find(ds => ds.domain === domain);
      
      if (summary && summary.totalVisits > 5) {
        const domainVisits = visits.filter(v => v.domain === domain);
        const recentAvgTime = domainVisits.reduce((sum, v) => sum + v.duration, 0) / domainVisits.length;
        
        // If we have historical data and recent time is significantly different
        if (summary.totalVisits > domainVisits.length) {
          const historicalAvgTime = summary.totalTime / summary.totalVisits;
          
          // Calculate percent change
          const percentChange = ((recentAvgTime - historicalAvgTime) / historicalAvgTime) * 100;
          
          if (Math.abs(percentChange) > 50) { // >50% change
            const direction = percentChange > 0 ? 'more' : 'less';
            
            insights.push({
              id: `trend-${domain}`,
              type: 'pattern',
              title: `${direction[0].toUpperCase() + direction.slice(1)} time on ${domain}`,
              description: `You're spending ${direction} time on ${domain} than usual`,
              data: { domain, percentChange },
              iconType: percentChange > 0 ? 'increase' : 'decrease'
            });
          }
        }
      }
    }
  }
  
  private formatCategoryName(category: CategoryName): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}