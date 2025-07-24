// src/components/admin/StatsCard.jsx
import React from 'react';

/**
 * StatsCard - Displays a statistic with icon and trend indicator
 * @param {string} title - Card title
 * @param {number|string} value - The value to display
 * @param {string} icon - Emoji icon
 * @param {string} [trend] - Trend direction ('up' or 'down')
 * @param {string} [change] - Change percentage text
 * @returns {JSX.Element} A stat card component
 */
const StatsCard = ({ title, value, icon, trend, change }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-2 flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;