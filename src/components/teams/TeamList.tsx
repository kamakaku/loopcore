import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2 } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import DataTable from '../common/DataTable';
import { deleteTeam } from '../../lib/teams';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next';

export default function TeamList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: teams = [], loading } = useFirestore<Team>('teams', {
    where: user ? [['members', 'array-contains', user.uid]] : undefined,
    orderBy: [['createdAt', 'desc']]
  });

  const columns = [
    {
      key: 'name',
      title: t('common.table.name'),
      sortable: true,
      isLink: true,
      render: (team: Team) => (
        <div>
          <div className="font-medium text-gray-900 max-w-xs truncate">{team.name}</div>
          {team.description && (
            <div className="text-sm text-gray-500 max-w-xs truncate">{team.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'members',
      title: t('common.table.members'),
      sortable: true,
      render: (team: Team) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{team.members?.length || 1}</span>
        </div>
      )
    },
    {
      key: 'projects',
      title: t('common.table.projects'),
      sortable: true,
      render: (team: Team) => team.projects?.length || 0
    },
    {
      key: 'createdAt',
      title: t('common.table.created'),
      sortable: true,
      render: (team: Team) => formatDate(team.createdAt)
    }
  ];

  const handleRowClick = (team: Team) => {
    navigate(`/teams/${team.id}`);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 topBar">
        <h1 className="text-2xl font-bold text-gray-900">{t('common.team')}</h1>
        <button
          onClick={() => navigate('/teams/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Users className="w-5 h-5" />
          <span>{t('common.create')}</span>
        </button>
      </div>

      <DataTable
        data={teams}
        columns={columns}
        onRowClick={handleRowClick}
        isLoading={loading}
        emptyState={{
          icon: <Building2 className="w-12 h-12" />,
          title: t('common.table.noData'),
          description: t('common.createFirst')
        }}
      />
    </Layout>
  );
}