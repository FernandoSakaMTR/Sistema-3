
import React from 'react';
import type { MaintenanceRequest, User } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { ExternalLinkIcon } from '../components/icons';

interface RequestsListPageProps {
  title: string;
  requests: MaintenanceRequest[];
  onSelectRequest: (id: string) => void;
}

const RequestCard: React.FC<{ request: MaintenanceRequest, onSelect: () => void }> = ({ request, onSelect }) => (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer" onClick={onSelect}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-semibold text-brand-blue">{request.id}</p>
                <h3 className="text-lg font-bold text-gray-800 mt-1">{request.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Requisitante: {request.requester.name}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
            </div>
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

const RequestsListPage: React.FC<RequestsListPageProps> = ({ title, requests, onSelectRequest }) => {
    if (!requests) {
        return <div className="p-8"><h1 className="text-3xl font-bold text-gray-800 mb-8">{title}</h1><p>Carregando...</p></div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">{title}</h1>
            {requests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests.map(req => (
                        <RequestCard key={req.id} request={req} onSelect={() => onSelectRequest(req.id)} />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <p className="text-gray-500">Nenhuma requisição encontrada.</p>
                </div>
            )}
        </div>
    );
};

export default RequestsListPage;
