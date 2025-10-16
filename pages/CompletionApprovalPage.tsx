import React, { useMemo } from 'react';
import type { MaintenanceRequest } from '../types';
import { RequestStatus } from '../types';
import { ClockIcon } from '../components/icons';
import StatusBadge from '../components/StatusBadge';

// Card component for displaying a single completion approval request
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

// Main page component for listing all pending completion approvals
interface CompletionApprovalPageProps {
  requests: MaintenanceRequest[];
  onSelectRequest: (id: string) => void;
}

const CompletionApprovalPage: React.FC<CompletionApprovalPageProps> = ({ requests, onSelectRequest }) => {
    const pendingRequests = useMemo(() => {
        return requests.filter(r => r.status === RequestStatus.PENDING_COMPLETION_APPROVAL)
                       .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    }, [requests]);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">Aprovar Conclusões de Pedidos</h1>
                 <span className="flex items-center text-lg font-semibold bg-orange-200 text-orange-800 rounded-full px-4 py-1">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    {pendingRequests.length} pendente(s)
                 </span>
            </div>
            
            {pendingRequests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingRequests.map(req => (
                        <CompletionApprovalCard
                            key={req.id}
                            request={req}
                            onSelect={() => onSelectRequest(req.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center mt-6">
                    <p className="text-gray-500 text-lg">Nenhum pedido aguardando aprovação de conclusão no momento.</p>
                </div>
            )}
        </div>
    );
};

export default CompletionApprovalPage;