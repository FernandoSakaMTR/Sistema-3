
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MaintenanceRequest } from '../types';
import { RequestStatus } from '../types';

interface DashboardPageProps {
  requests: MaintenanceRequest[];
}

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ requests }) => {
  const openCount = requests.filter(r => r.status === RequestStatus.OPEN).length;
  const inProgressCount = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
  const completedCount = requests.filter(r => r.status === RequestStatus.COMPLETED).length;
  const pausedCount = requests.filter(r => r.status === RequestStatus.PAUSED).length;

  const statusData = [
    { name: 'Abertas', count: openCount, fill: '#f97316' },
    { name: 'Em Andamento', count: inProgressCount, fill: '#3b82f6' },
    { name: 'Pausadas', count: pausedCount, fill: '#f59e0b' },
    { name: 'Concluídas', count: completedCount, fill: '#22c55e' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Requisições Abertas" value={openCount} color="text-status-open" />
        <StatCard title="Em Andamento" value={inProgressCount} color="text-status-progress" />
        <StatCard title="Concluídas (Total)" value={completedCount} color="text-status-completed" />
        <StatCard title="Pausadas" value={pausedCount} color="text-status-paused" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Requisições por Status</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
