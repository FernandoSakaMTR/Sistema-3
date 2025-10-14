
import React, { useState, useEffect, useMemo } from 'react';
import type { MaintenanceRequest } from '../types';
import { RequestStatus, EquipmentStatus } from '../types';
import { getOperationalData } from '../services/operationalDataService';
import { WrenchIcon, PlusIcon, CogIcon, CheckIcon } from '../components/icons';
import { SECTORS } from '../constants';

interface EquipmentMetric {
  equipmentName: string;
  sector: string;
  failureCount: number;
  mttr: number; // in hours
  mtbf: number; // in hours
  preventiveAlert?: string;
}

// Lógica de Negócio para Manutenção Preventiva
const PREVENTIVE_MAINTENANCE_CYCLE_HOURS = 300;
const PREVENTIVE_MAINTENANCE_TRIGGER_PERCENTAGE = 0.85;
const PREVENTIVE_THRESHOLD_MS = PREVENTIVE_MAINTENANCE_CYCLE_HOURS * PREVENTIVE_MAINTENANCE_TRIGGER_PERCENTAGE * 60 * 60 * 1000;

interface DashboardPageProps {
    requests: MaintenanceRequest[];
    onTriggerPreventiveRequest: (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'requester' | 'status' | 'isPreventive' >) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    </div>
);

const SortableTableHeader: React.FC<{
    label: string;
    sortKey: keyof EquipmentMetric;
    sortConfig: { key: keyof EquipmentMetric; direction: 'ascending' | 'descending' } | null;
    setSortConfig: (config: { key: keyof EquipmentMetric; direction: 'ascending' | 'descending' }) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, setSortConfig, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig.direction : 'ascending';

    const handleSort = () => {
        const newDirection = isSorted && direction === 'ascending' ? 'descending' : 'ascending';
        setSortConfig({ key: sortKey, direction: newDirection });
    };

    return (
        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${className}`} onClick={handleSort}>
            <div className="flex items-center">
                <span>{label}</span>
                {isSorted && (
                    <span className="ml-2">{direction === 'ascending' ? '▲' : '▼'}</span>
                )}
            </div>
        </th>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ requests, onTriggerPreventiveRequest }) => {
    const [equipmentMetrics, setEquipmentMetrics] = useState<EquipmentMetric[]>([]);
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [selectedSector, setSelectedSector] = useState('Todos');
    const [sortConfig, setSortConfig] = useState<{ key: keyof EquipmentMetric; direction: 'ascending' | 'descending' }>({ key: 'mtbf', direction: 'ascending' });

    useEffect(() => {
        const calculateMetrics = async () => {
            if (requests.length === 0 && !initialLoadComplete) {
                setEquipmentMetrics([]);
                setLoadingMetrics(false);
                setInitialLoadComplete(true);
                return;
            }
            
            if (!initialLoadComplete) {
                setLoadingMetrics(true);
            }

            try {
                const operationalData = await getOperationalData();
                const requestsByEquipment: Record<string, MaintenanceRequest[]> = {};

                for (const req of requests) {
                    for (const eq of req.equipment) {
                        if (!requestsByEquipment[eq]) {
                            requestsByEquipment[eq] = [];
                        }
                        requestsByEquipment[eq].push(req);
                    }
                }

                const metrics: EquipmentMetric[] = [];

                for (const equipmentName in requestsByEquipment) {
                    const eqRequests = requestsByEquipment[equipmentName];
                    const failureCount = eqRequests.length;
                    const sector = eqRequests[0]?.requesterSector || 'N/D';

                    // Calculate MTTR
                    const completedWithTimes = eqRequests.filter(r => r.status === RequestStatus.COMPLETED && r.startedAt && r.completedAt && r.completedAt.getTime() > r.startedAt.getTime());
                    const totalRepairTimeMs = completedWithTimes.reduce((acc, r) => acc + (r.completedAt!.getTime() - r.startedAt!.getTime()), 0);
                    const mttrMs = completedWithTimes.length > 0 ? totalRepairTimeMs / completedWithTimes.length : 0;
                    const mttrHours = mttrMs / (1000 * 60 * 60);

                    // Calculate MTBF
                    const uptimeMs = operationalData[equipmentName]?.totalOperationalTimeMs || 0;
                    const mtbfMs = failureCount > 0 ? uptimeMs / failureCount : uptimeMs;
                    const mtbfHours = mtbfMs / (1000 * 60 * 60);
                    
                    // Lógica de Manutenção Preventiva
                    let preventiveAlert: string | undefined = undefined;
                    const lastCompletedRequest = eqRequests
                        .filter(r => r.status === RequestStatus.COMPLETED && r.completedAt)
                        .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0];
                    
                    if (lastCompletedRequest && uptimeMs >= PREVENTIVE_THRESHOLD_MS) {
                        preventiveAlert = `Preventiva Recomendada (${lastCompletedRequest.maintenanceType})`;

                        const isPending = requests.some(r =>
                            r.equipment.includes(equipmentName) &&
                            r.isPreventive &&
                            (r.status === RequestStatus.PENDING_APPROVAL || r.status === undefined)
                        );

                        if (!isPending) {
                            onTriggerPreventiveRequest({
                                description: `Manutenção Preventiva Programada para ${equipmentName}. Atingiu ${(uptimeMs / (1000 * 60 * 60)).toFixed(1)}h de operação, excedendo o limite de ${(PREVENTIVE_THRESHOLD_MS / (1000 * 60 * 60)).toFixed(1)}h. Último tipo de manutenção: ${lastCompletedRequest.maintenanceType}.`,
                                equipmentStatus: EquipmentStatus.OPERATIONAL,
                                requesterSector: sector,
                                equipment: [equipmentName],
                                maintenanceType: lastCompletedRequest.maintenanceType,
                                failureTime: new Date(),
                                attachments: [],
                            });
                        }
                    }

                    metrics.push({
                        equipmentName,
                        sector,
                        failureCount,
                        mttr: parseFloat(mttrHours.toFixed(2)),
                        mtbf: parseFloat(mtbfHours.toFixed(2)),
                        preventiveAlert,
                    });
                }
                setEquipmentMetrics(metrics);
            } catch (error) {
                console.error("Failed to calculate equipment metrics:", error);
                setEquipmentMetrics([]);
            } finally {
                setLoadingMetrics(false);
                setInitialLoadComplete(true);
            }
        };

        calculateMetrics();
    }, [requests, onTriggerPreventiveRequest]);

    const sortedAndFilteredMetrics = useMemo(() => {
        let filtered = [...equipmentMetrics];
        if (selectedSector !== 'Todos') {
            filtered = filtered.filter(m => m.sector === selectedSector);
        }

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [equipmentMetrics, selectedSector, sortConfig]);

    const newRequests = requests.filter(r => !r.status && !r.isPreventive).length;
    const inProgressRequests = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
    const machinesDown = requests.filter(r => r.equipmentStatus === EquipmentStatus.INOPERATIVE && r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELED).length;
    const completedThisMonth = requests.filter(r => {
        const now = new Date();
        return r.status === RequestStatus.COMPLETED && r.completedAt && r.completedAt.getMonth() === now.getMonth() && r.completedAt.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Novos Pedidos" value={newRequests} icon={<PlusIcon className="h-8 w-8 text-blue-800" />} color="bg-blue-200" />
                <StatCard title="Em Atendimento" value={inProgressRequests} icon={<WrenchIcon className="h-8 w-8 text-yellow-800" />} color="bg-yellow-200" />
                <StatCard title="Máquinas Paradas" value={machinesDown} icon={<CogIcon className="h-8 w-8 text-red-800" />} color="bg-red-200" />
                <StatCard title="Concluídos no Mês" value={completedThisMonth} icon={<CheckIcon className="h-8 w-8 text-green-800" />} color="bg-green-200" />
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-700">Análise de Confiabilidade por Equipamento</h2>
                    <div>
                        <label htmlFor="sector-filter" className="text-sm font-medium text-gray-700 mr-2">Filtrar por Setor:</label>
                        <select
                            id="sector-filter"
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="Todos">Todos os Setores</option>
                            {SECTORS.map(sector => (
                                <option key={sector} value={sector}>{sector}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loadingMetrics ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Calculando métricas...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <SortableTableHeader label="Equipamento" sortKey="equipmentName" sortConfig={sortConfig} setSortConfig={setSortConfig} />
                                    <SortableTableHeader label="Setor" sortKey="sector" sortConfig={sortConfig} setSortConfig={setSortConfig} />
                                    <SortableTableHeader label="Falhas" sortKey="failureCount" sortConfig={sortConfig} setSortConfig={setSortConfig} className="text-center" />
                                    <SortableTableHeader label="MTTR (h)" sortKey="mttr" sortConfig={sortConfig} setSortConfig={setSortConfig} className="text-center" />
                                    <SortableTableHeader label="MTBF (h)" sortKey="mtbf" sortConfig={sortConfig} setSortConfig={setSortConfig} className="text-center" />
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações Preventivas</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedAndFilteredMetrics.length > 0 ? sortedAndFilteredMetrics.map(metric => (
                                    <tr key={metric.equipmentName} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.equipmentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.sector}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{metric.failureCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{metric.mttr}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-brand-blue">{metric.mtbf}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {metric.preventiveAlert ? (
                                                <span className="inline-flex items-center gap-x-1.5 px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800">
                                                    <WrenchIcon className="h-4 w-4" />
                                                    {metric.preventiveAlert}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhum dado encontrado para os filtros selecionados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
