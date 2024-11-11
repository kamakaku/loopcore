import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Users } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Project } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import DataTable from '../common/DataTable';
import { deleteProject } from '../../lib/projects';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next';

export default function ProjectList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: projects = [], loading } = useFirestore<Project>('projects', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  const columns = [
    {
      key: 'name',
      title: t('common.table.name'),
      sortable: true,
      isLink: true,
      render: (project: Project) => (
        <div>
          <div className="font-medium text-gray-900 max-w-xs truncate">{project.name}</div>
          {project.description && (
            <div className="text-sm text-gray-500 max-w-xs truncate">{project.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'members',
      title: t('common.table.members'),
      sortable: true,
      render: (project: Project) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{project.members?.length || 1}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: t('common.table.created'),
      sortable: true,
      render: (project: Project) => formatDate(project.createdAt)
    },
    {
      key: 'status',
      title: t('common.table.status'),
      sortable: true,
      render: (project: Project) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          project.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {t(`common.${project.status}`)}
        </span>
      )
    }
  ];

  const handleRowClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 topBar">
        <h1 className="text-2xl font-bold text-gray-900">{t('common.project')}</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FolderKanban className="w-5 h-5" />
          <span>{t('common.create')}</span>
        </button>
      </div>

      <DataTable
        data={projects}
        columns={columns}
        onRowClick={handleRowClick}
        isLoading={loading}
        emptyState={{
          icon: <FolderKanban className="w-12 h-12" />,
          title: t('common.table.noData'),
          description: t('common.createFirst')
        }}
      />
    </Layout>
  );
}