/**
 * BrowseInsight - Settings Page
 * 
 * User preferences and data management interface
 */

import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../../types/storage';
import './Settings.css';

const Settings: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [clearTimeframe, setClearTimeframe] = useState<string>('day');
  
  useEffect(() => {
    loadPreferences();
  }, []);
  
  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      const response = await chrome.runtime.sendMessage({ 
        type: 'getSettings'
      });
      
      if (response.success) {
        setPreferences(response.settings);
      } else {
        throw new Error(response.error || 'Failed to load settings');
      }
      
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
      setLoading(false);
    }
  };
  
  const handleToggleTracking = async (enabled: boolean) => {
    try {
      await chrome.runtime.sendMessage({
        type: 'toggleTracking',
        value: enabled
      });
      
      // Update local state
      if (preferences) {
        setPreferences({
          ...preferences,
          isPaused: !enabled
        });
      }
      
      setMessage({ 
        type: 'success', 
        text: enabled ? 'Tracking enabled' : 'Tracking paused'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    }
  };
  
  const handleSaveSettings = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      
      await chrome.runtime.sendMessage({
        type: 'updateSettings',
        settings: preferences
      });
      
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
      setSaving(false);
    }
  };
  
  const handleExportData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'exportData',
        format: exportFormat
      });
      
      if (response.success) {
        // Create a download link
        const blob = new Blob([response.data], { 
          type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `browseinsight-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setMessage({ type: 'success', text: 'Data exported successfully' });
      } else {
        throw new Error(response.error || 'Export failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    }
  };
  
  const handleClearData = async () => {
    if (!window.confirm(`Are you sure you want to clear all data from the ${clearTimeframe}? This cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'clearData',
        timeframe: clearTimeframe
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Data cleared successfully' });
      } else {
        throw new Error(response.error || 'Failed to clear data');
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    }
  };
  
  if (loading) {
    return (
      <div className="settings-loading">
        <div className="settings-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }
  
  if (!preferences) {
    return (
      <div className="settings-error">
        <p>Failed to load settings. Please try again.</p>
        <button onClick={loadPreferences}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>BrowseInsight Settings</h1>
        <p>Configure your browsing analytics experience</p>
      </header>
      
      {message && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <section className="settings-section">
        <h2>Tracking Settings</h2>
        
        <div className="settings-option">
          <div className="settings-option-info">
            <h3>Tracking Status</h3>
            <p>Enable or disable browsing data collection</p>
          </div>
          <div className="settings-option-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={!preferences.isPaused} 
                onChange={(e) => handleToggleTracking(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className={`toggle-status ${preferences.isPaused ? 'off' : 'on'}`}>
              {preferences.isPaused ? 'Paused' : 'Active'}
            </span>
          </div>
        </div>
        
        <div className="settings-option">
          <div className="settings-option-info">
            <h3>URL Tracking</h3>
            <p>Store full URLs (more detailed) or just domains (more private)</p>
          </div>
          <div className="settings-option-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={preferences.trackUrls} 
                onChange={(e) => setPreferences({
                  ...preferences, 
                  trackUrls: e.target.checked
                })}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>{preferences.trackUrls ? 'Full URLs' : 'Domains only'}</span>
          </div>
        </div>
        
        <div className="settings-option">
          <div className="settings-option-info">
            <h3>Page Titles</h3>
            <p>Store page titles for better categorization</p>
          </div>
          <div className="settings-option-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={preferences.trackTitles} 
                onChange={(e) => setPreferences({
                  ...preferences, 
                  trackTitles: e.target.checked
                })}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>{preferences.trackTitles ? 'Store titles' : 'No titles'}</span>
          </div>
        </div>
        
        <div className="settings-option">
          <div className="settings-option-info">
            <h3>Data Retention</h3>
            <p>How long to keep your browsing history</p>
          </div>
          <div className="settings-option-control">
            <select 
              value={preferences.retentionDays} 
              onChange={(e) => setPreferences({
                ...preferences, 
                retentionDays: Number(e.target.value)
              })}
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
            </select>
          </div>
        </div>
        
        <button 
          className="primary-button" 
          onClick={handleSaveSettings} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </section>
      
      <section className="settings-section">
        <h2>Data Management</h2>
        
        <div className="settings-data-actions">
          <div className="data-action-card">
            <h3>Export Data</h3>
            <p>Download your browsing analytics data</p>
            <div className="data-action-controls">
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              >
                <option value="json">JSON Format</option>
                <option value="csv">CSV Format</option>
              </select>
              <button onClick={handleExportData}>Export</button>
            </div>
          </div>
          
          <div className="data-action-card danger">
            <h3>Clear Data</h3>
            <p>Delete your browsing history data</p>
            <div className="data-action-controls">
              <select 
                value={clearTimeframe} 
                onChange={(e) => setClearTimeframe(e.target.value)}
              >
                <option value="day">Last 24 hours</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="all">All data</option>
              </select>
              <button onClick={handleClearData} className="danger-button">Clear</button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="settings-section">
        <h2>About BrowseInsight</h2>
        <div className="about-extension">
          <p>Version 1.0.0</p>
          <p>© 2025 JasonLovesDoggo</p>
          <p>BrowseInsight respects your privacy. All data is stored locally on your device.</p>
        </div>
      </section>
    </div>
  );
};

export default Settings;