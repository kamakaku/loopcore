import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import { Loop, Team, Project, User, Spot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import LoopHeader from './LoopHeader';
import LoopInfo from './LoopInfo';
import LoopActions from './LoopActions';
import LoopContent from './LoopContent';
import LoopSidebar from './LoopSidebar';
import LoopSettings from './LoopSettings';
import { deleteLoop } from '../../lib/loops';
import LoadingScreen from '../common/LoadingScreen';

export default function LoopDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const { data: loops = [], loading: loopsLoading } = useFirestore<Loop>('loops', {
    where: [['__name__', '==', id]],
    limitTo: 1
  });

  const { data: teams = [], loading: teamsLoading } = useFirestore<Team>('teams', {
    where: loops[0]?.teamId ? [['__name__', '==', loops[0].teamId]] : undefined,
    limitTo: 1
  });

  const { data: projects = [], loading: projectsLoading } = useFirestore<Project>('projects', {
    where: loops[0]?.projectId ? [['__name__', '==', loops[0].projectId]] : undefined,
    limitTo: 1
  });

  const { data: members = [], loading: membersLoading } = useFirestore<User>('users', {
    where: loops[0]?.members ? [['__name__', 'in', loops[0].members.map(m => m.id)]] : undefined
  });

  const { data: spots = [], loading: spotsLoading } = useFirestore<Spot>('spots', {
    where: [
      ['loopId', '==', id],
      ['pageNumber', '==', currentPage]
    ],
    orderBy: [['number', 'asc']]
  });

  const loop = loops[0];
  const team = teams[0];
  const project = projects[0];
  const isOwner = loop?.createdBy === user?.uid;

  const handleDelete = async () => {
    if (!loop || loading || !window.confirm('Are you sure you want to delete this loop? This action cannot be undone.')) return;

    setLoading(true);
    try {
      await deleteLoop(loop.id);
      navigate('/loops');
    } catch (error) {
      console.error('Error deleting loop:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loopsLoading || membersLoading || teamsLoading || projectsLoading) {
    return <LoadingScreen />;
  }

  if (!loop) {
    return (
      <Layout>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loop not found</h3>
          <button
            onClick={() => navigate('/loops')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Loops
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <LoopHeader
        loop={loop}
        team={team}
        project={project}
        members={members}
        onBack={() => navigate('/loops')}
        onOpenSettings={() => setShowSettings(true)}
        onDelete={handleDelete}
        isOwner={isOwner}
        loading={loading}
      />

      <LoopInfo
        type={loop.type}
        spotCount={loop.spotCount}
        commentCount={loop.commentCount}
        description={loop.description}
        createdAt={loop.createdAt}
      />

      <LoopActions
        loop={loop}
        isOwner={isOwner}
        onUpdate={() => {}}
      />

      <div className="flex gap-6">
        <div className="flex-1">
          <LoopContent
            loop={loop}
            spots={spots}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            selectedSpot={selectedSpot}
            onSpotSelect={setSelectedSpot}
            isOwner={isOwner}
            loading={spotsLoading}
          />
        </div>

        <LoopSidebar
          loop={loop}
          team={team}
          project={project}
          members={members}
          selectedSpot={selectedSpot}
          onSpotClose={() => setSelectedSpot(null)}
          isOwner={isOwner}
        />
      </div>

      {showSettings && (
        <LoopSettings
          loop={loop}
          onClose={() => setShowSettings(false)}
          onUpdated={() => setShowSettings(false)}
        />
      )}
    </Layout>
  );
}