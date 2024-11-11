import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export default function AuthInput({ label, helperText, ...props }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      />
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}