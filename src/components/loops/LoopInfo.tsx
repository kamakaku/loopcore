import React from 'react';
import { Eye, MessageSquare, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next';

interface LoopInfoProps {
  type: 'url' | 'image' | 'pdf' | 'figma';
  spotCount: number;
  commentCount: number;
  description?: string;
  createdAt: Date;
}

export default function LoopInfo({
  type,
  spotCount,
  commentCount,
  description,
  createdAt
}: LoopInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-4 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('common.details.type')}</h3>
          <p className="text-sm text-gray-900 capitalize">{t(`loops.${type}`)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('common.details.spots')}</h3>
          <div className="flex items-center text-sm text-gray-900">
            <Eye className="w-4 h-4 mr-1 text-gray-400" />
            <span>{t('loops.spotCount', { count: spotCount })}</span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('common.details.comments')}</h3>
          <div className="flex items-center text-sm text-gray-900">
            <MessageSquare className="w-4 h-4 mr-1 text-gray-400" />
            <span>{t('loops.commentCount', { count: commentCount })}</span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('common.details.created')}</h3>
          <div className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>
      {description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('common.details.description')}</h3>
          <p className="text-sm text-gray-900">{description}</p>
        </div>
      )}
    </div>
  );
}