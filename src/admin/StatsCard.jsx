import React from 'react';
import { useTheme } from '../common/context/Darkthemeprovider';

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
  const { darkMode } = useTheme();

  return (
    <div className={`p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:shadow-gray-900' 
        : 'bg-white border-gray-200 hover:shadow-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`mt-2 text-3xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{value}</p>
          {change && (
            <p className={`mt-2 flex items-center text-sm ${
              trend === 'up' 
                ? darkMode ? 'text-green-400' : 'text-green-600' 
                : darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
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
        <div className={`p-3 rounded-lg ${
          darkMode 
            ? 'bg-indigo-900 text-indigo-200' 
            : 'bg-indigo-50 text-indigo-600'
        }`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;