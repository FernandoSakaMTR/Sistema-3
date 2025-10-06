
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Legend, Cell } from 'recharts';
import type { MaintenanceRequest } from '../types';
import { RequestStatus, EquipmentStatus } from '../types';

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
  // Dados para o gráfico de status de requisições
  const openCount = requests.filter(r => r.status === RequestStatus.OPEN).length;
  const inProgressCount = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
  const completedCount = requests.filter(r => r.status === RequestStatus.COMPLETED).length;
  const pausedCount = requests.filter(r => r.status === RequestStatus.PAUSED).length;

  const statusData = [
    { name: 'Abertas', count: openCount, fill: '#1E90FF' },
    { name: 'Em Andamento', count: inProgressCount, fill: '#FFA500' },
    { name: 'Atend. Parados', count: pausedCount, fill: '#E74C3C' },
    { name: 'Concluídas', count: completedCount, fill: '#2ECC71' },
  ];

  // Dados para o gráfico de estado de equipamentos
  const operationalCount = requests.filter(r => r.equipmentStatus === EquipmentStatus.OPERATIONAL).length;
  const partialCount = requests.filter(r => r.equipmentStatus === EquipmentStatus.PARTIAL).length;
  const inoperativeCount = requests.filter(r => r.equipmentStatus === EquipmentStatus.INOPERATIVE).length;
  
  const equipmentStatusData = [
    { name: 'Funcionando', value: operationalCount, fill: '#2ECC71' },
    { name: 'Parcialmente Funcionando', value: partialCount, fill: '#F1C40F' },
    { name: 'Inoperante', value: inoperativeCount, fill: '#E74C3C' },
  ];


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Requisições Abertas" value={openCount} color="text-status-open" />
        <StatCard title="Em Andamento" value={inProgressCount} color="text-status-progress" />
        <StatCard title="Concluídas (Total)" value={completedCount} color="text-status-completed" />
        <StatCard title="Atendimentos Parados" value={pausedCount} color="text-status-paused" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Requisições por Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Requisições por Status</h2>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" dy={10} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Estado dos Equipamentos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Estado dos Equipamentos</h2>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={equipmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  innerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {equipmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;