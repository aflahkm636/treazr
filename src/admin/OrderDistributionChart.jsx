// src/components/admin/charts/OrderDistributionChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * OrderDistributionChart - Displays order status distribution
 * @param {Array} orders - Array of order objects
 * @returns {JSX.Element} A doughnut chart component
 */
const OrderDistributionChart = ({ orders }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Process order status distribution
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statuses = Object.keys(statusCounts);
    const counts = statuses.map(status => statusCounts[status]);

    const backgroundColors = [
      'rgba(99, 102, 241, 0.7)',
      'rgba(16, 185, 129, 0.7)',
      'rgba(245, 158, 11, 0.7)',
      'rgba(239, 68, 68, 0.7)',
      'rgba(139, 92, 246, 0.7)'
    ];

    const ctx = chartRef.current.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: statuses,
        datasets: [{
          data: counts,
          backgroundColor: backgroundColors.slice(0, statuses.length),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 12,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [orders]);

  return <canvas ref={chartRef} />;
};

export default OrderDistributionChart;