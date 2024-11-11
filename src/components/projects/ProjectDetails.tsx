import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import { Project, Team, User, Loop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import ProjectHeader from './ProjectHeader';
import ProjectInfo from './ProjectInfo';
import ProjectActions from './ProjectActions';
import ProjectLoopsTable from './ProjectLoopsTable';
import ProjectSidebar from './ProjectSidebar';
import ProjectSettings from './ProjectSettings';
import { deleteProject, updateProject } from '../../lib/projects';
import LoadingScreen from '../common/LoadingScreen';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: projects = [], loading: projectsLoading } = useFirestore<Project>('projects', {
    where: [['__name__', '==', id]],
    limitTo: 1
  });

  const { data: teams = [], loading: teamsLoading } = useFirestore<Team>('teams', {
    where: projects[0]?.teamId ? [['__name__', '==', projects[0].teamId]] : undefined,
    limitTo: 1
  });

  const { data: members = [], loading: membersLoading } = useFirestore<User>('users', {
    where: projects[0]?.members ? [['__name__', 'in', projects[0].members]] : undefined
  });

  const { data: loops = [], loading: loopsLoading } = useFirestore<Loop>('loops', {
    where: [['projectId', '==', id]],
    orderBy: [['createdAt', 'desc']]
  });

  const project = projects[0];
  const team = teams[0];
  const isOwner = project?.createdBy === user?.uid;

  const handleDelete = async () => {
    if (!project || loading || !window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    setLoading(true);
    try {
      await deleteProject(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeam = async () => {
    if (!project || loading || !window.confirm('Are you sure you want to remove this team from the project? This action cannot be undone.')) return;

    setLoading(true);
    try {
      await updateProject(project.id, { teamId: null });
    } catch (error) {
      console.error('Error removing team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoop = async (loopId: string) => {
    if (!window.confirm('Are you sure you want to remove this loop from the project? This action cannot be undone.')) {
      return;
    }

    try {
      await updateProject(project.id, {
        loops: project.loops?.filter(id => id !== loopId) || []
      });
    } catch (error) {
      console.error('Error removing loop:', error);
    }
  };

  if (projectsLoading || membersLoading || teamsLoading) {
    return <LoadingScreen />;
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <button
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Projects
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProjectHeader
        name={project.name}
        createdAt={project.createdAt instanceof Date ? project.createdAt : new Date(project.createdAt)}
        isOwner={isOwner}
        loading={loading}
        onNavigateBack={() => navigate('/projects')}
        onOpenSettings={() => setShowSettings(true)}
        onDelete={handleDelete}
      />

      <ProjectInfo
        status={project.status}
        memberCount={members.length}
        loopCount={loops.length}
        description={project.description}
      />

      <ProjectActions
        projectId={project.id}
        hasTeam={!!project.teamId}
        isOwner={isOwner}
      />

      <div className="flex gap-6">
        <div className="flex-1">
          <ProjectLoopsTable 
            loops={loops} 
            loading={loopsLoading} 
            onDeleteLoop={isOwner ? handleDeleteLoop : undefined}
          />
        </div>

        <ProjectSidebar
          project={project}
          team={team}
          members={members}
          isOwner={isOwner}
          onAddMembers={() => {}}
          onAddTeam={() => {}}
          onRemoveTeam={handleRemoveTeam}
        />
      </div>

      {showSettings && (
        <ProjectSettings
          project={project}
          onClose={() => setShowSettings(false)}
          onUpdated={() => setShowSettings(false)}
        />
      )}
    </Layout>
  );
}