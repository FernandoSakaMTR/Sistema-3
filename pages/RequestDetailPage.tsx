import React, { useState, useEffect, useCallback } from 'react';
import type { MaintenanceRequest, User } from '../types';
import { UserRole, RequestStatus } from '../types';
import { getRequestById, updateRequestStatus } from '../services/mockApiService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

interface RequestDetailPageProps {
    requestId: string;
    user: User;
    onBack: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | string[] | null, children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {children ? <div className="mt-1">{children}</div> : <p className="text-md text-gray-800 font-semibold">{Array.isArray(value) ? value.join(', ') : value || 'N/A'}</p>}
    </div>
);

const ReasonBox: React.FC<{ title: string; reason: string; color: 'red' | 'yellow' }> = ({ title, reason, color }) => {
    const colorClasses = {
        red: 'bg-red-50 border-red-300 text-red-900',
        yellow: 'bg-yellow-50 border-yellow-300 text-yellow-900'
    };
    return (
        <div className={`p-4 mt-4 border-l-4 rounded-md ${colorClasses[color]}`}>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm mt-1">{reason}</p>
        </div>
    );
};

const RequestDetailPage: React.FC<RequestDetailPageProps> = ({ requestId, user, onBack }) => {
    const [request, setRequest] = useState<MaintenanceRequest | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRequest = useCallback(async () => {
        setLoading(true);
        const data = await getRequestById(requestId);
        setRequest(data || null);
        setLoading(false);
    }, [requestId]);

    useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);

    const handleStatusUpdate = async (newStatus: RequestStatus) => {
        let reason: string | undefined = undefined;
        if(newStatus === RequestStatus.CANCELED || newStatus === RequestStatus.PAUSED || newStatus === RequestStatus.COMPLETED) {
            let promptMessage = "Por favor, insira o motivo:";
            if(newStatus === RequestStatus.COMPLETED) promptMessage = "Por favor, descreva o serviço realizado:";
            reason = prompt(promptMessage) || undefined;
            if(!reason && newStatus !== RequestStatus.COMPLETED) return;
        }
        await updateRequestStatus(requestId, newStatus, user, reason);
        fetchRequest();
    }

    if (loading) {
        return <div className="p-8">Carregando detalhes da requisição...</div>;
    }

    if (!request) {
        return <div className="p-8">Requisição não encontrada.</div>;
    }

    const canTakeAction = [UserRole.MAINTENANCE, UserRole.ADMIN].includes(user.role);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button onClick={onBack} className="text-brand-blue hover:underline mb-2">&larr; Voltar para a lista</button>
                    <h1 className="text-3xl font-bold text-gray-800">{request.title}</h1>
                    <p className="text-gray-500">{request.id}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <PriorityBadge status={request.equipmentStatus} />
                    <StatusBadge status={request.status} />
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Coluna 1: Informações da Requisição */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Detalhes da Requisição</h2>
                        <DetailItem label="Requisitante" value={request.requester.name} />
                        <DetailItem label="Setor do Requisitante" value={request.requesterSector} />
                        <DetailItem label="Equipamento(s)" value={request.equipment} />
                        <DetailItem label="Tipo de Manutenção" value={request.maintenanceType} />
                        <DetailItem label="Data da Abertura" value={request.createdAt.toLocaleString()} />
                        <DetailItem label="Última Atualização" value={request.updatedAt.toLocaleString()} />
                    </div>
                    
                    {/* Coluna 2: Descrição e Manutenção */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Descrição</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                        {request.status === RequestStatus.CANCELED && request.cancelReason && (
                           <ReasonBox title="Motivo do Cancelamento" reason={request.cancelReason} color="red" />
                        )}
                        {request.status === RequestStatus.PAUSED && request.pauseReason && (
                            <ReasonBox title="Motivo da Pausa" reason={request.pauseReason} color="yellow" />
                        )}
                    </div>

                    {/* Coluna 3: Detalhes da Execução */}
                    <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Execução</h2>
                        <DetailItem label="Responsável" value={request.assignedTo?.name} />
                        <DetailItem label="Início do Atendimento" value={request.startedAt?.toLocaleString()} />
                        <DetailItem label="Conclusão do Atendimento" value={request.completedAt?.toLocaleString()} />
                        <DetailItem label="Notas da Manutenção">
                             <p className="text-gray-700 whitespace-pre-wrap">{request.maintenanceNotes || 'N/A'}</p>
                        </DetailItem>
                    </div>
                </div>

                {canTakeAction && request.status !== RequestStatus.COMPLETED && request.status !== RequestStatus.CANCELED && (
                    <div className="border-t mt-8 pt-6 flex flex-wrap gap-4">
                        <h3 className="text-lg font-semibold text-gray-700 w-full">Ações</h3>
                        {request.status === RequestStatus.OPEN && <button onClick={() => handleStatusUpdate(RequestStatus.IN_PROGRESS)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Iniciar Atendimento</button>}
                        {request.status === RequestStatus.IN_PROGRESS && <button onClick={() => handleStatusUpdate(RequestStatus.PAUSED)} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Pausar</button>}
                        {request.status === RequestStatus.IN_PROGRESS && <button onClick={() => handleStatusUpdate(RequestStatus.COMPLETED)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Concluir</button>}
                        {request.status === RequestStatus.PAUSED && <button onClick={() => handleStatusUpdate(RequestStatus.IN_PROGRESS)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Retomar Atendimento</button>}
                        {(request.status === RequestStatus.OPEN || request.status === RequestStatus.PAUSED || request.status === RequestStatus.IN_PROGRESS) && <button onClick={() => handleStatusUpdate(RequestStatus.CANCELED)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Cancelar Requisição</button>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestDetailPage;
