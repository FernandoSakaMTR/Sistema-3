import React, { useState } from 'react';
import type { MaintenanceRequest, User } from '../types';
import { UserRole, RequestStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { TrashIcon, PencilIcon, ShieldCheckIcon } from '../components/icons';

interface RequestsListPageProps {
  title: string;
  requests: MaintenanceRequest[];
  onSelectRequest: (id: string) => void;
  user?: User;
  onDeleteRequest?: (id: string) => void;
  onEditRequest?: (id: string) => void;
}

const RequestCard: React.FC<{ 
    request: MaintenanceRequest, 
    onSelect: () => void, 
    user?: User, 
    onDelete?: (id: string) => void,
    onEdit?: (id: string) => void
}> = ({ request, onSelect, user, onDelete, onEdit }) => {
    const isOwner = user && user.id === request.requester.id;
    const isEditable = !request.status;
    
    // Garante que usuários de Manutenção e Admins nunca vejam o botão de excluir.
    const canDelete = isOwner && onDelete && isEditable && user?.role !== UserRole.MAINTENANCE && user?.role !== UserRole.ADMIN;
    const canEdit = isOwner && onEdit && isEditable;
    
    const isCompleted = request.status === RequestStatus.COMPLETED;
    const isCanceled = request.status === RequestStatus.CANCELED;
    const isFinalized = isCompleted || isCanceled;
    const isNew = !request.status;
    const isApprovedPreventive = !!request.approvedBy;
    const isNewForMaintenance = user?.role === UserRole.MAINTENANCE && isNew;

    const getCardBgColor = () => {
        if (isApprovedPreventive && isNew) return 'bg-purple-100';
        if (isCompleted) return 'bg-green-50';
        if (isNew) return 'bg-[#D3D1CB]';
        return 'bg-white';
    };

    return (
        <div 
            className={`p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden ${getCardBgColor()} ${isApprovedPreventive && isNew ? 'border-l-4 border-purple-500' : ''}`} 
            onClick={onSelect}
        >
            <div className="flex flex-col items-start gap-y-2 sm:flex-row sm:items-start sm:justify-between sm:gap-y-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:min-w-0">
                    <StatusBadge status={request.status} />
                    {isApprovedPreventive && (isNew || isCompleted) && (
                        <span className="inline-flex items-center gap-x-1.5 px-2 py-0.5 text-xs font-medium rounded-md bg-purple-600 text-white">
                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                            Origem: Preventiva
                        </span>
                    )}
                    <p className="text-sm font-semibold text-brand-blue">{request.id}</p>
                </div>
                <div className="flex items-center gap-x-2">
                    {!isFinalized && (
                        <PriorityBadge status={request.equipmentStatus} />
                    )}
                    {!isCompleted && (
                        <>
                            {canEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(request.id);
                                    }}
                                    className="p-1.5 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    title="Editar Pedido"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(request.id);
                                    }}
                                    className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                                    title="Excluir Pedido"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="mt-2">
                <h3 className={`text-lg font-bold text-gray-800 break-words whitespace-pre-wrap ${isCanceled ? 'line-through text-gray-500 decoration-2' : ''}`}>
                    {isNewForMaintenance ? 'Detalhes disponíveis ao iniciar o atendimento' : request.description}
                </h3>
                <p className="text-sm text-gray-500 mt-3 break-words">Solicitante: {request.requester.name}</p>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                    <p>Equipamento: <span className="font-medium">{request.equipment.join(', ')}</span></p>
                    <p>Tipo: <span className="font-medium">{request.maintenanceType}</span></p>
                </div>
                <div className="text-right">
                    <p>Criado em:</p>
                    <p className="font-medium">{request.createdAt.toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}

const TabButton: React.FC<{
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors duration-200 ease-in-out focus:outline-none ${
            isActive
                ? 'border-b-2 border-brand-blue text-brand-blue'
                : 'text-gray-500 hover:text-brand-blue'
        }`}
    >
        {label}
        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
            isActive ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-700'
        }`}>
            {count}
        </span>
    </button>
);

const RequestsListPage: React.FC<RequestsListPageProps> = ({ title, requests, onSelectRequest, user, onDeleteRequest, onEditRequest }) => {
    const [activeTab, setActiveTab] = useState('new');

    if (!requests) {
        return <div className="p-8"><h1 className="text-3xl font-bold text-gray-800 mb-8">{title}</h1><p>Carregando...</p></div>;
    }

    // Filtra para não mostrar pedidos com status 'Pendente de Aprovação'
    const visibleRequests = requests.filter(r => r.status !== RequestStatus.PENDING_APPROVAL);

    const newRequests = visibleRequests.filter(r => !r.status);
    const openRequests = visibleRequests.filter(r => r.status === RequestStatus.IN_PROGRESS);
    const completedRequests = visibleRequests
        .filter(r => r.status === RequestStatus.COMPLETED || r.status === RequestStatus.CANCELED)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const renderRequestList = (reqs: MaintenanceRequest[], emptyMessage: string) => {
        if (reqs.length === 0) {
            return (
                <div className="bg-white p-8 rounded-lg shadow-md text-center mt-6">
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {reqs.map(req => (
                    <RequestCard
                        key={req.id}
                        request={req}
                        onSelect={() => onSelectRequest(req.id)}
                        user={user}
                        onDelete={onDeleteRequest}
                        onEdit={onEditRequest}
                    />
                ))}
            </div>
        );
    };
    
    const getCurrentList = () => {
        switch(activeTab) {
            case 'new': return renderRequestList(newRequests, 'Nenhum pedido novo.');
            case 'open': return renderRequestList(openRequests, 'Nenhum pedido em aberto no momento.');
            case 'completed': return renderRequestList(completedRequests, 'Nenhum pedido finalizado encontrado.');
            default: return null;
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                    <TabButton label="Novos" count={newRequests.length} isActive={activeTab === 'new'} onClick={() => setActiveTab('new')} />
                    <TabButton label="Em Aberto" count={openRequests.length} isActive={activeTab === 'open'} onClick={() => setActiveTab('open')} />
                    <TabButton label="Finalizados" count={completedRequests.length} isActive={activeTab === 'completed'} onClick={() => setActiveTab('completed')} />
                </nav>
            </div>
            
            <div>
                {getCurrentList()}
            </div>
        </div>
    );
};

export default RequestsListPage;