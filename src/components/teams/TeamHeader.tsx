import { ArrowLeft, Settings, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

interface TeamHeaderProps {
  name: string;
  createdAt: Date;
  isOwner: boolean;
  loading: boolean;
  onNavigateBack: () => void;
  onOpenSettings: () => void;
  onDelete: () => void;
}

export default function TeamHeader({
  name,
  createdAt,
  isOwner,
  loading,
  onNavigateBack,
  onOpenSettings,
  onDelete
}: TeamHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onNavigateBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500">Created {formatDate(createdAt)}</p>
        </div>
      </div>
      
      {isOwner && (
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}