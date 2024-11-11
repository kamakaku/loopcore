import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  value: [Date, Date];
  onChange: (dates: [Date, Date]) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="relative inline-block">
      <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
        <Calendar className="w-5 h-5 text-gray-400" />
        <input
          type="date"
          value={value[0].toISOString().split('T')[0]}
          onChange={(e) => onChange([new Date(e.target.value), value[1]])}
          className="border-none focus:ring-0 text-sm"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={value[1].toISOString().split('T')[0]}
          onChange={(e) => onChange([value[0], new Date(e.target.value)])}
          className="border-none focus:ring-0 text-sm"
        />
      </div>
    </div>
  );
}