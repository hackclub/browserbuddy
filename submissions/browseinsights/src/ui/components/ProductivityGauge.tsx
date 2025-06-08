/**
 * BrowseInsight - Productivity Gauge Component
 * 
 * A gauge visualization for productivity score
 */

import React from 'react';
import './ProductivityGauge.css';

interface ProductivityGaugeProps {
  score: number;
}

export const ProductivityGauge: React.FC<ProductivityGaugeProps> = ({ score }) => {
  // Ensure score is between 0-100
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  // Calculate rotation angle (0-180 degrees)
  const angle = (normalizedScore / 100) * 180;
  
  // Determine color based on score
  const getColor = () => {
    if (normalizedScore < 40) return '#f44336'; // Red
    if (normalizedScore < 70) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };
  
  const color = getColor();
  
  return (
    <div className="productivity-gauge">
      <div className="gauge-body">
        <div className="gauge-fill" style={{ transform: `rotate(${angle}deg)` }}>
          <div className="gauge-cover" style={{ borderColor: color }}></div>
        </div>
        <div className="gauge-center">
          <span className="gauge-value" style={{ color }}>
            {normalizedScore}
          </span>
        </div>
      </div>
      <div className="gauge-labels">
        <span className="gauge-label-low">Low</span>
        <span className="gauge-label-high">High</span>
      </div>
    </div>
  );
};