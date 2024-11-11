import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600/30 border-t-blue-600 animate-spin" />
      </div>
    </div>
  );
}