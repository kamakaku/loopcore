import React, { useMemo } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Loop } from '../../types';
import { format, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsChartProps {
  title: string;
  data: Loop[];
  dateRange: [Date, Date];
  type?: 'line' | 'pie';
}

export default function AnalyticsChart({ title, data, dateRange, type = 'line' }: AnalyticsChartProps) {
  // Helper function to convert any timestamp type to Date
  const getDate = (timestamp: Date | Timestamp | any): Date => {
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  };

  const chartData = useMemo(() => {
    const [startDate, endDate] = dateRange;

    if (type === 'line') {
      // Get all days in the date range
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Create a map of dates to loop counts
      const dateCountMap = new Map<string, number>();
      days.forEach(day => {
        dateCountMap.set(format(day, 'yyyy-MM-dd'), 0);
      });

      // Count loops for each day
      data.forEach(loop => {
        const loopDate = getDate(loop.createdAt);
        if (isWithinInterval(loopDate, { start: startDate, end: endDate })) {
          const dateKey = format(loopDate, 'yyyy-MM-dd');
          dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + 1);
        }
      });

      return {
        labels: days.map(day => format(day, 'MMM d')),
        datasets: [
          {
            label: 'Loops Created',
            data: days.map(day => dateCountMap.get(format(day, 'yyyy-MM-dd')) || 0),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      };
    } else {
      // For pie chart, count loops by type
      const typeCount = data.reduce((acc, loop) => {
        if (isWithinInterval(getDate(loop.createdAt), { start: startDate, end: endDate })) {
          acc[loop.type] = (acc[loop.type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        labels: Object.keys(typeCount).map(type => type.toUpperCase()),
        datasets: [
          {
            data: Object.values(typeCount),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)', // blue
              'rgba(16, 185, 129, 0.8)', // green
              'rgba(239, 68, 68, 0.8)',  // red
            ],
            borderWidth: 0,
          },
        ],
      };
    }
  }, [data, dateRange, type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    ...(type === 'line' ? {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0, // Only show whole numbers
          },
        },
      },
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
      },
    } : {}),
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div className="h-[300px]">
        {type === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}