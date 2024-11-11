import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
}

interface AnalyticsTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export default function AnalyticsTable<T extends { id: string }>({ 
  title, 
  data, 
  columns,
  onRowClick
}: AnalyticsTableProps<T>) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
              {onRowClick && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr 
                key={item.id}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <ChevronRight className="w-5 h-5 inline-block" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}