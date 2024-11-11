import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  secondaryValue?: string;
  secondaryIcon?: React.ReactNode;
  loading?: boolean;
}

export default function AnalyticsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  secondaryValue,
  secondaryIcon,
  loading 
}: AnalyticsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="w-16 h-6 bg-gray-200 rounded" />
        </div>
        <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
        <div className="w-16 h-8 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {secondaryValue && (
          <div className="flex items-center text-sm text-gray-500">
            {secondaryIcon && <span className="mr-1">{secondaryIcon}</span>}
            <span>{secondaryValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}