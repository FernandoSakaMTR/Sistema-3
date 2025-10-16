

import React, { useState, useMemo } from 'react';
import type { MaintenanceRequest, User } from '../types';
import { RequestStatus } from '../types';
import { CogIcon } from '../components/icons';
import StatusBadge from '../components/StatusBadge';

// Request Card Component
const PreventiveRequestCard: React.FC<{
    request: MaintenanceRequest;
    onSelect: () => void;
}> = ({ request, onSelect }) => {
    return (
        <div 
            onClick={onSelect}
            className="p-5 rounded-lg shadow-md bg-white border-l-4 border-purple-400 hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer"
        >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <div className="flex items-center gap-x-3">
                    <StatusBadge status={request.status} />
                    <p className="text-sm font-semibold text-brand-blue">{request.id}</p>
                </div>
                <p className="text-xs text-gray-500">
                    Criado em: {new Date(request.createdAt).toLocaleDateString()}
                </p>
            </div>
            
            <p className="text-md text-gray-800 mb-4">{request.description}</p>
            
            <div className="border-t pt-3 flex flex-wrap justify-between items-center text-sm text-gray-600">
                <div>
                    <p>Equipamento: <span className="font-medium">{request.equipment.join(', ')}</span></p>
                    <p>Tipo: <span className="font-medium">{request.maintenanceType}</span></p>
                </div>
            </div>
        </div>
    );
};


// Main Page Component
interface PreventiveRequestsPageProps {
  user: User;
  requests: MaintenanceRequest[];
  onEditRequest: (id: string) => void;
  onRequestUpdate: () => Promise<void>;
  onSelectRequest: (id: string) => void;
}

const PreventiveRequestsPage: React.FC<PreventiveRequestsPageProps> = ({ user, requests, onSelectRequest }) => {
    const preventiveRequests = useMemo(() => {
        return requests.filter(r => r.isPreventive && r.status === RequestStatus.PENDING_APPROVAL)
                       .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [requests]);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">Preventivas para Aprovação</h1>
                 <span className="flex items-center text-lg font-semibold bg-purple-200 text-purple-800 rounded-full px-4 py-1">
                    <CogIcon className="h-5 w-5 mr-2" />
                    {preventiveRequests.length} pendente(s)
                 </span>
            </div>
            
            {preventiveRequests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {preventiveRequests.map(req => (
                        <PreventiveRequestCard
                            key={req.id}
                            request={req}
                            onSelect={() => onSelectRequest(req.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center mt-6">
                    <p className="text-gray-500 text-lg">Nenhum pedido de manutenção preventiva aguardando aprovação no momento.</p>
                </div>
            )}
        </div>
    );
};

export default PreventiveRequestsPage;
