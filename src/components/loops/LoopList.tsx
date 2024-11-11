import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Image as ImageIcon, FileText, Plus, MessageSquare, Eye } from 'lucide-react';
import { Loop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatDate';
import Layout from '../layout/Layout';
import LoopCreator from './LoopCreator';
import { useFirestore } from '../../hooks/useFirestore';
import { useTranslation } from 'react-i18next';

export default function LoopList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoopCreator, setShowLoopCreator] = useState(false);
  const [filter, setFilter] = useState('all');
  const { t } = useTranslation();

  const { data: teams = [] } = useFirestore<{ id: string }>('teams', {
    where: user ? [['members', 'array-contains', user.uid]] : undefined
  });

  const { data: projects = [] } = useFirestore<{ id: string }>('projects', {
    where: user ? [['members', 'array-contains', user.uid]] : undefined
  });

  const { data: loops = [], loading } = useFirestore<Loop>('loops', {
    where: user ? [
      ['$or', [
        ['createdBy', '==', user.uid],
        ['teamId', 'in', teams.map(t => t.id)],
        ['projectId', 'in', projects.map(p => p.id)]
      ]]
    ] : undefined,
    orderBy: [['createdAt', 'desc']]
  });

  const filteredLoops = loops.filter(loop => {
    if (filter === 'mine') return loop.createdBy === user?.uid;
    if (filter === 'shared') return loop.createdBy !== user?.uid;
    return true;
  });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 topBar">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('loops.title')}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('common.all')}
            </button>
            <button
              onClick={() => setFilter('mine')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'mine'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('loops.myLoops')}
            </button>
            <button
              onClick={() => setFilter('shared')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'shared'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('loops.sharedLoops')}
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowLoopCreator(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('loops.newLoop')}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.table.type')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.table.title')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.table.created')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.table.owner')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.table.access')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.table.spots')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-8 bg-gray-100 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredLoops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('loops.noLoops')}</p>
                  </td>
                </tr>
              ) : (
                filteredLoops.map((loop) => (
                  <tr
                    key={loop.id}
                    onClick={() => navigate(`/loops/${loop.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {loop.type === 'url' ? (
                          <Link className="w-5 h-5 text-blue-600" />
                        ) : loop.type === 'image' ? (
                          <ImageIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {loop.title || t('loops.untitled')}
                      </div>
                      {loop.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {loop.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(loop.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loop.createdBy === user?.uid ? t('common.you') : t('common.teamMember')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        loop.createdBy === user?.uid
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {loop.createdBy === user?.uid ? t('common.owner') : t('common.shared')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {t('loops.spotCount', { count: loop.spotCount || 0 })}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {t('loops.commentCount', { count: loop.commentCount || 0 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/loops/${loop.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {t('common.view')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLoopCreator && (
        <LoopCreator
          onClose={() => setShowLoopCreator(false)}
          onCreated={() => {
            setShowLoopCreator(false);
          }}
        />
      )}
    </Layout>
  );
}