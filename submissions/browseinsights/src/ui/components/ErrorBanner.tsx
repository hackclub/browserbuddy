/**
 * BrowseInsight - Error Banner Component
 * 
 * Displays error messages with retry functionality
 */

import React from 'react';
import './ErrorBanner.css';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="error-banner">
      <div className="error-icon">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <div className="error-content">
        <h4>Something went wrong</h4>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>
          <i className="fas fa-redo"></i> Retry
        </button>
      )}
    </div>
  );
};