import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TableActions from './TableActions';

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  actions?: {
    onEdit?: (item: T) => void;
    onArchive?: (item: T) => void;
    onDelete?: (item: T) => void;
    onManageMembers?: (item: T) => void;
  };
  isLoading?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
}

export default function Table<T extends { id: string }>({ 
  data,
  columns,
  onRowClick,
  actions,
  isLoading,
  emptyState
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            {emptyState.icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyState.title}
          </h3>
          <p className="text-gray-500">{emptyState.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {actions && <th scope="col" className="relative px-6 py-3" />}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <TableActions
                      onEdit={actions.onEdit ? () => actions.onEdit!(item) : undefined}
                      onArchive={actions.onArchive ? () => actions.onArchive!(item) : undefined}
                      onDelete={actions.onDelete ? () => actions.onDelete!(item) : undefined}
                      onManageMembers={actions.onManageMembers ? () => actions.onManageMembers!(item) : undefined}
                      isArchived={(item as any).status === 'archived'}
                    />
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