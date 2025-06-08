/**
 * BrowseInsight - Top Sites Table Component
 * 
 * Displays a table of the most visited sites with time spent
 */

import React from 'react';
import './TopSitesTable.css';
import {CategoryName} from "../../types/categories";

interface TopSite {
  domain: string;
  totalTime: number;
  totalVisits: number;
  category: CategoryName;
}

interface TopSitesTableProps {
  sites: TopSite[];
}

export const TopSitesTable: React.FC<TopSitesTableProps> = ({ sites }) => {
  const formatTime = (ms: number): string => {
    const minutes = Math.round(ms / 1000 / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };
  
  const formatCategory = (category: string): string => {
    if (category === 'uncategorized') return 'Uncategorized';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'productivity': '#4caf50',
      'work': '#2196f3',
      'education': '#673ab7',
      'shopping': '#ffc107',
      'social': '#e91e63',
      'news': '#00bcd4',
      'entertainment': '#f44336',
      'games': '#ff5722',
      'video': '#795548',
      'uncategorized': '#9e9e9e'
    };
    
    return colorMap[category] || '#9e9e9e';
  };
  
  if (sites.length === 0) {
    return (
      <div className="top-sites-empty">
        <p>No browsing data available</p>
      </div>
    );
  }
  
  return (
    <div className="top-sites-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Domain</th>
            <th>Category</th>
            <th>Visits</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, index) => (
            <tr key={site.domain} className="site-row">
              <td className="site-rank">{index + 1}</td>
              <td className="site-domain">
                <span className="favicon-placeholder" style={{ backgroundColor: getCategoryColor(site.category) }}>
                  {site.domain.charAt(0).toUpperCase()}
                </span>
                {site.domain}
              </td>
              <td>
                <span className="site-category" style={{ backgroundColor: getCategoryColor(site.category) }}>
                  {formatCategory(site.category)}
                </span>
              </td>
              <td>{site.totalVisits}</td>
              <td>{formatTime(site.totalTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};