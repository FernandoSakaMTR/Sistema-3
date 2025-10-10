import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Legend, Cell, Label } from 'recharts';
import type { MaintenanceRequest, User } from '../types';
import { RequestStatus, EquipmentStatus, UserRole } from '../types';

interface DashboardPageProps {
  requests: MaintenanceRequest[];
  user: User;
}

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ requests, user }) => {
  const isManagerOrAdmin = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role);

  // Dados para o gráfico de status de pedidos
  const newCount = requests.filter(r => !r.status).length;
  const inProgressCount = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
  const completedCount = requests.filter(r => r.status === RequestStatus.COMPLETED).length;

  const statusData = [
    { name: 'Novas', count: newCount, fill: '#95A5A6' },
    { name: 'Em Andamento', count: inProgressCount, fill: '#3498DB' },
    { name: 'Concluídas', count: completedCount, fill: '#7DCEA0' },
  ];

  // Dados para o gráfico de estado de equipamentos
  const operationalCount = requests.filter(r => r.equipmentStatus === EquipmentStatus.OPERATIONAL).length;
  const partialCount = requests.filter(r => r.equipmentStatus === EquipmentStatus.PARTIAL).length;
  const inoperativeCount = requests.filter(r => r.equipmentStatus === EquipmentStatus.INOPERATIVE).length;
  
  const equipmentStatusData = [
    { name: 'Funcionando', value: operationalCount, fill: '#16a34a' },
    { name: 'Parcialmente Funcionando', value: partialCount, fill: '#F1C40F' },
    { name: 'Inoperante', value: inoperativeCount, fill: '#E74C3C' },
  ];

  // --- LÓGICA PARA TEMPO MÉDIO DE REPARO ---
  const completedRequestsWithTime = requests.filter(
    r => r.status === RequestStatus.COMPLETED && r.startedAt && r.completedAt
  );

  const totalRepairTime = completedRequestsWithTime.reduce((acc, r) => {
    const duration = r.completedAt!.getTime() - r.startedAt!.getTime();
    return acc + (duration > 0 ? duration : 0);
  }, 0);
  
  const averageRepairTimeMs = completedRequestsWithTime.length > 0 
    ? totalRepairTime / completedRequestsWithTime.length 
    : 0;
  
  const formatAverageDuration = (ms: number): string => {
    if (ms <= 0) return '0 min';
    
    const totalSeconds = ms / 1000;
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor(((totalSeconds % 86400) % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}min`);

    return parts.join(' ');
  };

  const formattedAverageRepairTime = formatAverageDuration(averageRepairTimeMs);


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Gráfico de Estado dos Equipamentos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Novos Pedidos" value={newCount} color="text-gray-500" />
        <StatCard title="Em Andamento" value={inProgressCount} color="text-ticket-progress" />
        <StatCard title="Concluídas" value={completedCount} color="text-ticket-completed" />
        {isManagerOrAdmin && (
          <StatCard title="Tempo Médio de Reparo" value={formattedAverageRepairTime} color="text-gray-900" />
        )}
      </div>

      {/* Gráfico de Pedidos por Status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Status dos Pedidos</h2>
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
    </div>
  );
};

export default DashboardPage;