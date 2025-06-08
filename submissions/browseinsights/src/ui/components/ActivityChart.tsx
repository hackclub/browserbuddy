/**
 * BrowseInsight - Activity Chart Component
 * 
 * Visualizes browsing activity over time using Chart.js
 */

import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import './ActivityChart.css';

// Register Chart.js components
Chart.register(...registerables);

interface ActivityChartProps {
  hourlyData: number[];
  dailyData: number[];
  type: 'hourly' | 'daily' | 'weekly';
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ 
  hourlyData, 
  dailyData, 
  type 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const formatTime = (ms: number): string => {
    const minutes = Math.round(ms / 1000 / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    let labels: string[] = [];
    let data: number[] = [];
    let bgColor: string = '';
    let borderColor: string = '';
    let title: string = '';
    
    switch (type) {
      case 'hourly':
        labels = Array.from({ length: 24 }, (_, i) => {
          const hour = i % 12 || 12;
          return `${hour}${i < 12 ? 'am' : 'pm'}`;
        });
        data = hourlyData;
        bgColor = 'rgba(74, 108, 247, 0.2)';
        borderColor = 'rgba(74, 108, 247, 1)';
        title = 'Browsing time by hour of day';
        break;
        
      case 'daily':
      case 'weekly':
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        data = dailyData;
        bgColor = 'rgba(109, 66, 216, 0.2)';
        borderColor = 'rgba(109, 66, 216, 1)';
        title = 'Browsing time by day of week';
        break;
    }
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Browsing Time',
          data,
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: 2,
          borderRadius: 4,
          barThickness: type === 'hourly' ? 12 : 25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
            text: title
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `Time: ${formatTime(value)}`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatTime(value as number)
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [hourlyData, dailyData, type]);
  
  return (
    <div className="activity-chart">
      <canvas ref={chartRef} />
    </div>
  );
};