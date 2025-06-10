/**
 * BrowseInsight - Timeframe Selector Component
 * 
 * Allows selection of different time ranges for analytics
 */

import React from 'react';
import './TimeframeSelector.css';

interface TimeframeSelectorProps {
  selected: string;
  onChange: (timeframe: string) => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ 
  selected, 
  onChange 
}) => {
  const timeframes = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' }
  ];
  
  return (
    <div className="timeframe-selector">
      {timeframes.map(timeframe => (
        <button
          key={timeframe.id}
          className={`timeframe-button ${selected === timeframe.id ? 'active' : ''}`}
          onClick={() => onChange(timeframe.id)}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};