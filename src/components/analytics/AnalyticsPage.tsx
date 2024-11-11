import React, { useState, useMemo } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { Loop, Project, Team } from '../../types';
import { Users, FolderKanban, Eye, MessageSquare } from 'lucide-react';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    startOfDay(subDays(new Date(), 30)),
    endOfDay(new Date())
  ]);

  const { data: teams = [] } = useFirestore<Team>('teams', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  const { data: projects = [] } = useFirestore<Project>('projects', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  const { data: loops = [] } = useFirestore<Loop>('loops', {
    where: [['createdBy', '==', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  const stats = useMemo(() => {
    const filteredLoops = loops.filter(loop => {
      const loopDate = new Date(loop.createdAt);
      return loopDate >= dateRange[0] && loopDate <= dateRange[1];
    });

    const totalSpots = filteredLoops.reduce((acc, loop) => acc + (loop.spotCount || 0), 0);
    const totalComments = filteredLoops.reduce((acc, loop) => acc + (loop.commentCount || 0), 0);

    return {
      loops: filteredLoops.length,
      spots: totalSpots,
      comments: totalComments,
      avgSpotsPerLoop: filteredLoops.length ? (totalSpots / filteredLoops.length).toFixed(1) : '0',
      avgCommentsPerLoop: filteredLoops.length ? (totalComments / filteredLoops.length).toFixed(1) : '0'
    };
  }, [loops, dateRange]);

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Loops Created',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      }
    ],
  };

  const pieChartData = {
    labels: ['URL', 'Image', 'PDF'],
    datasets: [
      {
        data: [12, 19, 3],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Loops</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.loops}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Spots</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.spots}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Comments</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.comments}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Spots per Loop</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.avgSpotsPerLoop}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Loop Activity</h3>
          <div className="h-[300px]">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Loop Types Distribution</h3>
          <div className="h-[300px]">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Most Active Teams</h3>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team.id}>
                    <td className="px-4 py-2">{team.name}</td>
                    <td className="px-4 py-2">{team.members.length}</td>
                    <td className="px-4 py-2">{projects.filter(p => p.teamId === team.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top Projects</h3>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loops</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id}>
                    <td className="px-4 py-2">{project.name}</td>
                    <td className="px-4 py-2">{loops.filter(l => l.projectId === project.id).length}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}