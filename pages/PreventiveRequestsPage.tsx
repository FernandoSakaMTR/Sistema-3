import React from 'react';
import type { MaintenanceRequest } from '../types';
import { ClockIcon, CogIcon } from '../components/icons';
import StatusBadge from '../components/StatusBadge';

// Card for Preventive Approval
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
                    <p>Tipo: <span className="font-medium">{request.maintenanceType.join(', ')}</span></p>
                </div>
            </div>
        </div>
    );
};

// Card for Completion Approval
const CompletionApprovalCard: React.FC<{
    request: MaintenanceRequest;
    onSelect: () => void;
}> = ({ request, onSelect }) => {
    const formatDate = (date: Date | undefined) => date ? new Date(date).toLocaleString('pt-BR') : 'N/A';
    return (
        <div 
            onClick={onSelect}
            className="p-5 rounded-lg shadow-md bg-white border-l-4 border-orange-400 hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer"
        >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <div className="flex items-center gap-x-3">
                    <StatusBadge status={request.status} />
                    <p className="text-sm font-semibold text-brand-blue">{request.id}</p>
                </div>
                <p className="text-xs text-gray-500">
                    Enviado para aprovação em: {formatDate(request.updatedAt)}
                </p>
            </div>
            
            <div className="my-4 p-3 bg-orange-50 rounded-md border border-orange-200">
                <p className="text-sm text-gray-600">
                    Data de conclusão solicitada: <span className="font-bold text-orange-800">{formatDate(request.requestedCompletedAt)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Justificativa:</span> {request.completionChangeReason}
                </p>
            </div>
            
            <p className="text-md text-gray-800 mb-4">{request.description}</p>
            
            <div className="border-t pt-3 flex flex-wrap justify-between items-center text-sm text-gray-600">
                <div>
                    <p>Equipamento: <span className="font-medium">{request.equipment.join(', ')}</span></p>
                    <p>Finalizado por: <span className="font-medium">{request.completedBy}</span></p>
                </div>
            </div>
        </div>
    );
};

// Main Page Component
interface ApprovalPageProps {
  pendingPreventiveRequests: MaintenanceRequest[];
  pendingCompletionRequests: MaintenanceRequest[];
  onSelectRequest: (id: string) => void;
}

const ApprovalPage: React.FC<ApprovalPageProps> = ({ pendingPreventiveRequests, pendingCompletionRequests, onSelectRequest }) => {
    const totalPending = pendingPreventiveRequests.length + pendingCompletionRequests.length;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                 <h1 className="text-3xl font-bold text-gray-800">Aprovações Pendentes</h1>
                 {totalPending > 0 && (
                    <span className="flex items-center text-lg font-semibold bg-blue-100 text-blue-800 rounded-full px-4 py-1">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        {totalPending} item(s) no total
                    </span>
                 )}
            </div>
            
            {totalPending === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center mt-6">
                    <p className="text-gray-500 text-lg">Nenhum item aguardando sua aprovação no momento.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Preventive Approvals Section */}
                    <div>
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-700">Preventivas para Aprovação</h2>
                            <span className="ml-3 flex items-center text-md font-semibold bg-purple-200 text-purple-800 rounded-full px-3 py-0.5">
                                <CogIcon className="h-4 w-4 mr-1.5" />
                                {pendingPreventiveRequests.length}
                            </span>
                        </div>
                        {pendingPreventiveRequests.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {pendingPreventiveRequests.map(req => (
                                    <PreventiveRequestCard
                                        key={req.id}
                                        request={req}
                                        onSelect={() => onSelectRequest(req.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <p className="text-gray-500">Nenhum pedido de manutenção preventiva para aprovar.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Completion Approvals Section */}
                    <div>
                        <div className="flex items-center mb-4">
                             <h2 className="text-2xl font-bold text-gray-700">Conclusões para Aprovação</h2>
                             <span className="ml-3 flex items-center text-md font-semibold bg-orange-200 text-orange-800 rounded-full px-3 py-0.5">
                                <ClockIcon className="h-4 w-4 mr-1.5" />
                                {pendingCompletionRequests.length}
                            </span>
                        </div>
                        {pendingCompletionRequests.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {pendingCompletionRequests.map(req => (
                                    <CompletionApprovalCard
                                        key={req.id}
                                        request={req}
                                        onSelect={() => onSelectRequest(req.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                             <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <p className="text-gray-500">Nenhuma conclusão de pedido para aprovar.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalPage;