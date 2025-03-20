/**
 * BrowseInsight - Insight Card Component
 * 
 * Displays a single insight with icon and description
 */

import React from 'react';
import './InsightCard.css';
import { Insight } from '../../analytics/insights';

interface InsightCardProps {
  insight: Insight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getIconClass = (): string => {
    const iconMap: Record<string, string> = {
      'clock': 'fa-clock',
      'engagement': 'fa-thumbs-up',
      'variety': 'fa-layer-group',
      'peak': 'fa-chart-line',
      'habit': 'fa-calendar-check',
      'category': 'fa-tags',
      'productive': 'fa-briefcase',
      'distraction': 'fa-gamepad',
      'productive-time': 'fa-business-time',
      'focus': 'fa-bullseye',
      'favorite': 'fa-star',
      'increase': 'fa-arrow-trend-up',
      'decrease': 'fa-arrow-trend-down',
      'info': 'fa-info-circle'
    };
    
    return iconMap[insight.iconType || 'info'] || 'fa-lightbulb';
  };
  
  const getCardClass = (): string => {
    switch (insight.type) {
      case 'highlight':
        return 'insight-card highlight';
      case 'pattern':
        return 'insight-card pattern';
      case 'recommendation':
        return 'insight-card recommendation';
      default:
        return 'insight-card';
    }
  };
  
  return (
    <div className={getCardClass()}>
      <div className="insight-icon">
        <i className={`fas ${getIconClass()}`}></i>
      </div>
      <div className="insight-content">
        <h4>{insight.title}</h4>
        <p>{insight.description}</p>
      </div>
    </div>
  );
};