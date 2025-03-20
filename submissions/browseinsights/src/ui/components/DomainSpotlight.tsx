/**
 * BrowseInsight - Domain Spotlight Component
 * 
 * Shows detailed analytics for a specific domain
 */

import React, { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { DomainAnalytics } from '../../types/storage';
import './DomainSpotlight.css';

// Register Chart.js components
Chart.register(...registerables);

interface DomainSpotlightProps {
  domain: string;
}

export const DomainSpotlight: React.FC<DomainSpotlightProps> = ({ domain }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<DomainAnalytics | null>(null);
  
  const hourlyChartRef = useRef<HTMLCanvasElement>(null);
  const hourlyChartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    loadDomainAnalytics();
  }, [domain]);
  
  useEffect(() => {
    if (analytics && hourlyChartRef.current) {
      renderHourlyChart();
    }
    
    return () => {
      if (hourlyChartInstance.current) {
        hourlyChartInstance.current.destroy();
      }
    };
  }, [analytics]);
  
  const loadDomainAnalytics = async () => {
    if (!domain) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Request domain analytics from background service
      const response = await chrome.runtime.sendMessage({
        type: 'getDomainAnalytics',
        domain
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load domain analytics');
      }
      
      setAnalytics(response.data);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };
  
  const renderHourlyChart = () => {
    if (!hourlyChartRef.current || !analytics) return;
    
    // Destroy existing chart
    if (hourlyChartInstance.current) {
      hourlyChartInstance.current.destroy();
    }
    
    const ctx = hourlyChartRef.current.getContext('2d');
    if (!ctx) return;
    
    const labels = Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 || 12;
      return `${hour}${i < 12 ? 'am' : 'pm'}`;
    });
    
    hourlyChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Visits',
          data: analytics.visitFrequency.byHour,
          borderColor: 'rgba(74, 108, 247, 1)',
          backgroundColor: 'rgba(74, 108, 247, 0.1)',
          fill: true,
          tension: 0.4
        }, {
          label: 'Time Spent',
          data: analytics.timeDistribution.byHour,
          borderColor: 'rgba(109, 66, 216, 1)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Visit Count'
            }
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time (ms)'
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              callback: (value) => {
                return formatTime(value as number, true);
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `Visits: ${context.raw}`;
                } else {
                  return `Time: ${formatTime(context.raw as number)}`;
                }
              }
            }
          }
        }
      }
    });
  };
  
  const formatTime = (ms: number, short: boolean = false): string => {
    const minutes = Math.round(ms / 1000 / 60);
    if (minutes < 60) {
      return short ? `${minutes}m` : `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return short ? `${hours}h ${remainingMins}m` : `${hours}h ${remainingMins}m`;
  };
  
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  if (loading) {
    return <div className="domain-spotlight loading">Loading domain analytics...</div>;
  }
  
  if (error || !analytics) {
    return <div className="domain-spotlight error">Error loading domain analytics</div>;
  }
  
  return (
    <div className="domain-spotlight">
      <div className="domain-spotlight-header">
        <h3>{domain}</h3>
        <span className="domain-category">{analytics.category.charAt(0).toUpperCase() + analytics.category.slice(1)}</span>
      </div>
      
      <div className="domain-stats-grid">
        <div className="domain-stat-card">
          <h4>Total Visits</h4>
          <div className="domain-stat-value">{analytics.totalVisits}</div>
        </div>
        
        <div className="domain-stat-card">
          <h4>Time Spent</h4>
          <div className="domain-stat-value">{formatTime(analytics.totalTime)}</div>
        </div>
        
        <div className="domain-stat-card">
          <h4>Avg. Visit</h4>
          <div className="domain-stat-value">{formatTime(analytics.avgVisitDuration)}</div>
        </div>
        
        <div className="domain-stat-card">
          <h4>First Visit</h4>
          <div className="domain-stat-value">{formatDate(analytics.firstVisit)}</div>
        </div>
      </div>
      
      <div className="domain-chart-container">
        <h4>Hourly Activity</h4>
        <div className="domain-chart">
          <canvas ref={hourlyChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};