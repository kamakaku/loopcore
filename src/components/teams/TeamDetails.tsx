import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import { Team, Project, User, Loop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import TeamHeader from './TeamHeader';
import TeamInfo from './TeamInfo';
import TeamMainContent from './TeamMainContent';
import TeamSidebar from './TeamSidebar';
import TeamSettings from './TeamSettings';
import TeamActions from './TeamActions';
import { deleteTeam } from '../../lib/teams';
import LoadingScreen from '../common/LoadingScreen';

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'loops' | 'projects'>('loops');

  const { data: teams = [], loading: teamsLoading } = useFirestore<Team>('teams', {
    where: [['__name__', '==', id]],
    limitTo: 1
  });

  const { data: members = [], loading: membersLoading } = useFirestore<User>('users', {
    where: teams[0]?.members ? [['__name__', 'in', teams[0].members]] : undefined
  });

  const { data: projects = [], loading: projectsLoading } = useFirestore<Project>('projects', {
    where: [['teamId', '==', id]],
    orderBy: [['createdAt', 'desc']]
  });

  const { data: loops = [], loading: loopsLoading } = useFirestore<Loop>('loops', {
    where: [['teamId', '==', id]],
    orderBy: [['createdAt', 'desc']]
  });

  const team = teams[0];
  const isOwner = team?.createdBy === user?.uid;

  const handleDelete = async () => {
    if (!team || loading || !window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    setLoading(true);
    try {
      await deleteTeam(team.id);
      navigate('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
    } finally {
      setLoading(false);
    }
  };

  if (teamsLoading || membersLoading) {
    return <LoadingScreen />;
  }

  if (!team || !id) {
    return (
      <Layout>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team not found</h3>
          <button
            onClick={() => navigate('/teams')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Teams
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <TeamHeader
        name={team.name}
        createdAt={team.createdAt instanceof Date ? team.createdAt : new Date(team.createdAt)}
        isOwner={isOwner}
        loading={loading}
        onNavigateBack={() => navigate('/teams')}
        onOpenSettings={() => setShowSettings(true)}
        onDelete={handleDelete}
      />

      <TeamInfo
        memberCount={members.length}
        projectCount={projects.length}
        loopCount={loops.length}
        description={team.description}
      />

      <TeamActions
        teamId={id}
        isOwner={isOwner}
        onUpdate={() => {
          // Refresh data after updates
        }}
      />

      <div className="flex gap-6">
        <TeamMainContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          loops={loops}
          projects={projects}
          loopsLoading={loopsLoading}
          projectsLoading={projectsLoading}
          onViewLoop={(id) => navigate(`/loops/${id}`)}
          onViewProject={(id) => navigate(`/projects/${id}`)}
          isOwner={isOwner}
        />

        <TeamSidebar
          team={team}
          members={members}
          isOwner={isOwner}
          onAddMembers={() => {}}
        />
      </div>

      {showSettings && (
        <TeamSettings
          team={team}
          onClose={() => setShowSettings(false)}
          onUpdated={() => setShowSettings(false)}
        />
      )}
    </Layout>
  );
}