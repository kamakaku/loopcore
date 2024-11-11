import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, FolderKanban, Eye, MessageSquare, Activity } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Layout from '../layout/Layout';
import AnalyticsCard from '../analytics/AnalyticsCard';
import RecentActivity from './RecentActivity';
import AnalyticsChart from '../analytics/AnalyticsChart';
import { Loop, Project, Team, Comment } from '../../types';
import { subDays } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dateRange] = useState<[Date, Date]>([subDays(new Date(), 30), new Date()]);

  const { data: teams = [] } = useFirestore<Team>('teams', {
    where: user ? [['members', 'array-contains', user.uid]] : undefined,
    orderBy: [['createdAt', 'desc']]
  });

  const { data: projects = [] } = useFirestore<Project>('projects', {
    where: user ? [['members', 'array-contains', user.uid]] : undefined,
    orderBy: [['createdAt', 'desc']]
  });

  const { data: loops = [] } = useFirestore<Loop>('loops', {
    where: user ? [
      ['$or', [
        ['createdBy', '==', user.uid],
        ['teamId', 'in', teams.map(t => t.id)],
        ['projectId', 'in', projects.map(p => p.id)]
      ]]
    ] : undefined,
    orderBy: [['createdAt', 'desc']]
  });

  const { data: comments = [] } = useFirestore<Comment>('comments', {
    where: user ? [['createdBy', '==', user.uid]] : undefined,
    orderBy: [['createdAt', 'desc']]
  });

  const personalLoops = loops.filter(loop => loop.createdBy === user?.uid);
  const sharedLoops = loops.filter(loop => loop.createdBy !== user?.uid);
  const activeProjects = projects.filter(p => p.status === 'active');

  const stats = {
    totalLoops: loops.length,
    personalLoops: personalLoops.length,
    sharedLoops: sharedLoops.length,
    totalSpots: loops.reduce((acc, loop) => acc + (loop.spotCount || 0), 0),
    totalComments: loops.reduce((acc, loop) => acc + (loop.commentCount || 0), 0),
    activeProjects: activeProjects.length
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div onClick={() => navigate('/loops')} className="cursor-pointer">
          <AnalyticsCard
            title={t('dashboard.analytics.myLoops')}
            value={stats.personalLoops}
            icon={<FileText className="w-6 h-6" />}
            secondaryValue={t('dashboard.analytics.sharedWithMe', { count: stats.sharedLoops })}
          />
        </div>
        <div onClick={() => navigate('/teams')} className="cursor-pointer">
          <AnalyticsCard
            title={t('dashboard.analytics.activeProjects')}
            value={stats.activeProjects}
            icon={<FolderKanban className="w-6 h-6" />}
            secondaryValue={t('dashboard.analytics.totalProjects', { count: projects.length })}
          />
        </div>
        <div onClick={() => navigate('/loops')} className="cursor-pointer">
          <AnalyticsCard
            title={t('dashboard.analytics.totalSpots')}
            value={stats.totalSpots}
            icon={<Eye className="w-6 h-6" />}
            secondaryValue={t('dashboard.analytics.totalComments', { count: stats.totalComments })}
          />
        </div>
        <div className="cursor-pointer">
          <AnalyticsCard
            title={t('dashboard.analytics.recentActivity')}
            value={comments.length}
            icon={<Activity className="w-6 h-6" />}
            secondaryValue={t('dashboard.analytics.lastDays', { days: 7 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AnalyticsChart
          title={t('dashboard.analytics.loopActivity')}
          data={loops}
          dateRange={dateRange}
          type="line"
        />
        <AnalyticsChart
          title={t('dashboard.analytics.loopTypes')}
          data={loops}
          dateRange={dateRange}
          type="pie"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{t('dashboard.activity.title')}</h2>
            </div>
            <RecentActivity
              loops={loops.slice(0, 5)}
              comments={comments.slice(0, 5)}
              onLoopClick={(id) => navigate(`/loops/${id}`)}
            />
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{t('dashboard.teams.overview')}</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('dashboard.teams.noTeams')}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {t('dashboard.teams.createTeam')}
                    </p>
                  </div>
                ) : (
                  teams.slice(0, 5).map(team => (
                    <div 
                      key={team.id}
                      onClick={() => navigate(`/teams/${team.id}`)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-500">
                          {t('common.table.members', { count: team.members.length })}
                        </p>
                      </div>
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}