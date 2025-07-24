// src/components/admin/charts/OrderTrendChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * OrderTrendChart - Displays order trends over time
 * @param {Array} orders - Array of order objects
 * @returns {JSX.Element} A line chart component
 */
const OrderTrendChart = ({ orders }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Process order data by date
    const ordersByDate = orders.reduce((acc, order) => {
      const date = new Date(order.date || order.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const dates = Object.keys(ordersByDate).sort();
    const counts = dates.map(date => ordersByDate[date]);

    const ctx = chartRef.current.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Orders',
          data: counts,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1f2937',
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 12,
            usePointStyle: true,
            callbacks: {
              label: (context) => `Orders: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280' }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: '#6b7280' },
            grid: { color: 'rgba(229, 231, 235, 0.5)' }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [orders]);

  return <canvas ref={chartRef} />;
};

export default OrderTrendChart;