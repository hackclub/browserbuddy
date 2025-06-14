/**
 * BrowseInsight - Dashboard UI
 * 
 * Main dashboard interface for visualizing browsing analytics
 */

import React, { useEffect, useState } from 'react';
import { TimeframeStats } from '../../types/storage';
import { Insight } from '../../analytics/insights';
import { ActivityChart } from '../components/ActivityChart';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { TopSitesTable } from '../components/TopSitesTable';
import { InsightCard } from '../components/InsightCard';
import { DomainSpotlight } from '../components/DomainSpotlight';
import { TimeframeSelector } from '../components/TimeframeSelector';
import { TabSection } from '../components/TabSection';
import { ProductivityGauge } from '../components/ProductivityGauge';
import { Loader } from '../components/Loader';
import { ErrorBanner } from '../components/ErrorBanner';

import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('day');
  const [stats, setStats] = useState<TimeframeStats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('overview');

  // Use a ref to track mounted state to prevent state updates after unmount
  const isMounted = React.useRef(true);

  // Set up mount/unmount tracking
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    loadStats();
  }, [timeframe]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request stats from background service
      const response = await chrome.runtime.sendMessage({
        type: 'getStats',
        timeframe
      });

      // Only update state if component is still mounted
      if (isMounted.current) {
        if (!response.success) {
          throw new Error(response.error || 'Failed to load statistics');
        }

        setStats(response.stats);
        setInsights(response.stats.insights || []);
        setLoading(false);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };
  
  // Last updated formatting
  const getLastUpdatedText = () => {
    return `Last updated: ${new Date().toLocaleTimeString()}`;
  };
  
  if (loading) {
    return <Loader message="Loading your browsing insights..." />;
  }
  
  if (error) {
    return <ErrorBanner message={error} onRetry={loadStats} />;
  }
  
  if (!stats) {
    return <ErrorBanner message="No data available" onRetry={loadStats} />;
  }
  
  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Calculate productivity score
  const productivityScore = Math.round(
    (stats.timeDistribution.productive / 
    (stats.timeDistribution.productive + stats.timeDistribution.neutral + stats.timeDistribution.distracting)) * 100
  ) || 0;
  
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>BrowseInsight</h1>
        <div className="timeframe-control">
          <TimeframeSelector 
            selected={timeframe} 
            onChange={handleTimeframeChange} 
          />
          <div className="last-updated">{getLastUpdatedText()}</div>
        </div>
      </header>
      
      <div className="dashboard-overview">
        <div className="stats-summary">
          <div className="stat-card">
            <h3>Browsing Time</h3>
            <div className="stat-value">{formatTime(stats.totalTime)}</div>
          </div>
          <div className="stat-card">
            <h3>Active Time</h3>
            <div className="stat-value">{formatTime(stats.totalActiveTime)}</div>
          </div>
          <div className="stat-card">
            <h3>Sites Visited</h3>
            <div className="stat-value">{stats.uniqueDomains}</div>
          </div>
          <div className="stat-card">
            <h3>Productivity</h3>
            <ProductivityGauge score={productivityScore} />
          </div>
        </div>
      </div>
      
      <TabSection
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'insights', label: 'Insights' },
          { id: 'sites', label: 'Sites' },
          { id: 'activity', label: 'Activity' }
        ]}
      >
        {currentTab === 'overview' && (
          <div className="overview-section">
            <div className="chart-row">
              <div className="chart-container half-width">
                <h3>Time Distribution</h3>
                <CategoryPieChart 
                  data={[
                    { category: 'Productive', value: stats.timeDistribution.productive },
                    { category: 'Neutral', value: stats.timeDistribution.neutral },
                    { category: 'Distracting', value: stats.timeDistribution.distracting }
                  ]}
                />
              </div>
              <div className="chart-container half-width">
                <h3>Daily Activity</h3>
                <ActivityChart 
                  hourlyData={stats.hourlyActivity} 
                  dailyData={stats.dailyActivity}
                  type="daily"
                />
              </div>
            </div>
            <div className="chart-row">
              <div className="chart-container">
                <h3>Top Sites</h3>
                <TopSitesTable sites={stats.topDomains.slice(0, 5)} />
              </div>
            </div>
            {insights.length > 0 && (
              <div className="insights-preview">
                <h3>Key Insights</h3>
                <div className="insights-grid">
                  {insights.slice(0, 2).map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {currentTab === 'insights' && (
          <div className="insights-section">
            <h2>Browsing Insights</h2>
            {insights.length === 0 ? (
              <div className="no-insights">
                <p>Not enough browsing data to generate insights yet.</p>
                <p>Continue browsing to see patterns and recommendations.</p>
              </div>
            ) : (
              <div className="insights-grid">
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentTab === 'sites' && (
          <div className="sites-section">
            <h2>Top Sites</h2>
            <TopSitesTable sites={stats.topDomains} />
            
            {stats.topDomains.length > 0 && (
              <div className="domain-spotlight-container">
                <h3>Site Spotlight</h3>
                <DomainSpotlight domain={stats.topDomains[0].domain} />
              </div>
            )}
          </div>
        )}
        
        {currentTab === 'activity' && (
          <div className="activity-section">
            <div className="chart-container">
              <h3>Hourly Activity</h3>
              <ActivityChart 
                hourlyData={stats.hourlyActivity}
                dailyData={stats.dailyActivity}
                type="hourly"
              />
            </div>
            
            <div className="chart-container">
              <h3>Weekly Activity</h3>
              <ActivityChart 
                hourlyData={stats.hourlyActivity}
                dailyData={stats.dailyActivity}
                type="weekly"
              />
            </div>
            
            <div className="chart-container">
              <h3>Category Breakdown</h3>
              <CategoryPieChart 
                data={Object.entries(stats.categoryBreakdown).map(([category, data]) => ({
                  category,
                  value: data.totalTime
                }))}
              />
            </div>
          </div>
        )}
      </TabSection>
    </div>
  );
};

export default Dashboard;