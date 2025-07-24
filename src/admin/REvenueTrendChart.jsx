// src/components/admin/charts/RevenueTrendChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * RevenueTrendChart - Displays revenue trends over time
 * @param {Array} orders - Array of order objects
 * @returns {JSX.Element} A bar chart component
 */
const RevenueTrendChart = ({ orders }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Process revenue data by date
    const revenueByDate = orders.reduce((acc, order) => {
      const date = new Date(order.date || order.createdAt).toLocaleDateString();
      const amount = parseFloat(order.total) || 0;
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {});

    const dates = Object.keys(revenueByDate).sort();
    const amounts = dates.map(date => revenueByDate[date]);

    const ctx = chartRef.current.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Revenue ($)',
          data: amounts,
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(99, 102, 241, 1)'
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
              label: (context) => `Revenue: $${context.raw.toFixed(2)}`
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
            ticks: {
              callback: (value) => '$' + value,
              color: '#6b7280'
            },
            grid: { color: 'rgba(229, 231, 235, 0.5)' }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [orders]);

  return <canvas ref={chartRef} />;
};

export default RevenueTrendChart;