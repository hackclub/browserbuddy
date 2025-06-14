/**
 * BrowseInsight - Category Pie Chart Component
 * 
 * Visualizes browsing categories using Chart.js
 */

import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import './CategoryPieChart.css';

// Register Chart.js components
Chart.register(...registerables);

interface CategoryDataPoint {
  category: string;
  value: number;
}

interface CategoryPieChartProps {
  data: CategoryDataPoint[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const getCategoryColors = (category: string): [string, string] => {
    const colorMap: Record<string, [string, string]> = {
      'Productive': ['rgba(76, 175, 80, 0.7)', 'rgba(76, 175, 80, 1)'],
      'productivity': ['rgba(76, 175, 80, 0.7)', 'rgba(76, 175, 80, 1)'],
      'work': ['rgba(33, 150, 243, 0.7)', 'rgba(33, 150, 243, 1)'],
      'education': ['rgba(103, 58, 183, 0.7)', 'rgba(103, 58, 183, 1)'],
      'Neutral': ['rgba(255, 152, 0, 0.7)', 'rgba(255, 152, 0, 1)'],
      'shopping': ['rgba(255, 193, 7, 0.7)', 'rgba(255, 193, 7, 1)'],
      'social': ['rgba(233, 30, 99, 0.7)', 'rgba(233, 30, 99, 1)'],
      'news': ['rgba(0, 188, 212, 0.7)', 'rgba(0, 188, 212, 1)'],
      'Distracting': ['rgba(244, 67, 54, 0.7)', 'rgba(244, 67, 54, 1)'],
      'entertainment': ['rgba(244, 67, 54, 0.7)', 'rgba(244, 67, 54, 1)'],
      'games': ['rgba(255, 87, 34, 0.7)', 'rgba(255, 87, 34, 1)'],
      'video': ['rgba(121, 85, 72, 0.7)', 'rgba(121, 85, 72, 1)'],
      'technology': ['rgba(0, 150, 136, 0.7)', 'rgba(0, 150, 136, 1)'],
      'finance': ['rgba(76, 175, 80, 0.7)', 'rgba(76, 175, 80, 1)'],
      'travel': ['rgba(96, 125, 139, 0.7)', 'rgba(96, 125, 139, 1)'],
      'health': ['rgba(156, 39, 176, 0.7)', 'rgba(156, 39, 176, 1)'],
      'reference': ['rgba(63, 81, 181, 0.7)', 'rgba(63, 81, 181, 1)'],
      'uncategorized': ['rgba(158, 158, 158, 0.7)', 'rgba(158, 158, 158, 1)']
    };
    
    return colorMap[category] || ['rgba(158, 158, 158, 0.7)', 'rgba(158, 158, 158, 1)'];
  };
  
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
  
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
    
    // Filter out zero values
    const filteredData = data.filter(item => item.value > 0);
    if (filteredData.length === 0) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    const backgroundColors = filteredData.map(item => getCategoryColors(item.category)[0]);
    const borderColors = filteredData.map(item => getCategoryColors(item.category)[1]);
    
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: filteredData.map(item => formatCategory(item.category)),
        datasets: [{
          data: filteredData.map(item => item.value),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              },
              boxWidth: 15
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const label = formatCategory(filteredData[context.dataIndex].category);
                return `${label}: ${formatTime(value)}`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);
  
  return (
    <div className="category-pie-chart">
      <canvas ref={chartRef} />
    </div>
  );
};