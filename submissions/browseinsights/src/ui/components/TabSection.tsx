/**
 * BrowseInsight - Tab Section Component
 * 
 * Creates a tabbed interface for content sections
 */

import React from 'react';
import './TabSection.css';

interface Tab {
  id: string;
  label: string;
}

interface TabSectionProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
  children: React.ReactNode;
}

export const TabSection: React.FC<TabSectionProps> = ({ 
  currentTab, 
  onTabChange,
  tabs,
  children
}) => {
  return (
    <div className="tab-section">
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
};