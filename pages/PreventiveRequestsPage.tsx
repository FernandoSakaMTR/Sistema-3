
import React, { useState, useMemo } from 'react';
import type { MaintenanceRequest, User } from '../types';
import { RequestStatus } from '../types';
import * as api from '../services/mockApiService';
import { PencilIcon, CheckIcon, XIcon, CogIcon } from '../components/icons';
import StatusBadge from '../components/StatusBadge';

// Modal Component
const ActionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose}><XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Request Card Component
const PreventiveRequestCard: React.FC<{
    request: MaintenanceRequest;
    onEdit: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}> = ({ request, onEdit, onApprove, onReject }) => {
    return (
        <div className="p-5 rounded-lg shadow-md bg-white border-l-4 border-purple-400">
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
                <div className="flex items-center gap-x-2 mt-3 sm:mt-0">
                    <button
                        onClick={() => onEdit(request.id)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Editar Pedido"
                    >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                    </button>
                    <button
                        onClick={() => onReject(request.id)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                        title="Rejeitar Pedido"
                    >
                        <XIcon className="h-4 w-4" />
                        Rejeitar
                    </button>
                    <button
                        onClick={() => onApprove(request.id)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors"
                        title="Aprovar Pedido"
                    >
                        <CheckIcon className="h-4 w-4" />
                        Aprovar
                    </button>
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
}

const PreventiveRequestsPage: React.FC<PreventiveRequestsPageProps> = ({ user, requests, onEditRequest, onRequestUpdate }) => {
    const [isRejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [selectedRequestToReject, setSelectedRequestToReject] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedRequestToApprove, setSelectedRequestToApprove] = useState<string | null>(null);
    const [approverName, setApproverName] = useState(user.name);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const preventiveRequests = useMemo(() => {
        return requests.filter(r => r.isPreventive && r.status === RequestStatus.PENDING_APPROVAL)
                       .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [requests]);

    const openApprovalModal = (id: string) => {
        setSelectedRequestToApprove(id);
        setApproverName(user.name);
        setApprovalModalOpen(true);
    };

    const closeApprovalModal = () => {
        if (isSubmitting) return;
        setApprovalModalOpen(false);
        setSelectedRequestToApprove(null);
    };

    const handleConfirmApproval = async () => {
        if (!selectedRequestToApprove || !approverName.trim()) {
            alert('O nome do aprovador é obrigatório.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.approvePreventiveRequest(selectedRequestToApprove, approverName);
            await onRequestUpdate();
            alert('Pedido preventivo aprovado com sucesso!');
            closeApprovalModal();
        } catch (error: any) {
            console.error("Failed to approve request:", error);
            alert(error.message || "Não foi possível aprovar o pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const openRejectionModal = (id: string) => {
        setSelectedRequestToReject(id);
        setRejectionReason('');
        setRejectionModalOpen(true);
    };

    const closeRejectionModal = () => {
        if (isSubmitting) return;
        setRejectionModalOpen(false);
        setSelectedRequestToReject(null);
    };

    const handleReject = async () => {
        if (!selectedRequestToReject || !rejectionReason.trim()) {
            alert('Por favor, forneça um motivo para a rejeição.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.updateRequestStatus(selectedRequestToReject, RequestStatus.CANCELED, { reason: rejectionReason });
            await onRequestUpdate();
            alert('Pedido preventivo rejeitado com sucesso.');
            closeRejectionModal();
        } catch (error: any) {
            console.error("Failed to reject request:", error);
            alert(error.message || "Não foi possível rejeitar o pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8">
            <ActionModal
                isOpen={isApprovalModalOpen}
                onClose={closeApprovalModal}
                title="Aprovar Pedido Preventivo"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Ao aprovar, este pedido será convertido em uma ordem de serviço e movido para a lista de "Novos Pedidos".</p>
                    <div>
                        <label htmlFor="approverName" className="block text-sm font-medium text-gray-700">Seu Nome (Aprovador)*</label>
                        <input
                            id="approverName"
                            value={approverName}
                            onChange={(e) => setApproverName(e.target.value)}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Digite seu nome completo"
                        />
                    </div>
                    <div className="flex justify-end pt-2 space-x-3">
                        <button type="button" onClick={closeApprovalModal} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleConfirmApproval} disabled={isSubmitting || !approverName.trim()} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Aprovando...' : 'Confirmar Aprovação'}
                        </button>
                    </div>
                </div>
            </ActionModal>

            <ActionModal
                isOpen={isRejectionModalOpen}
                onClose={closeRejectionModal}
                title="Rejeitar Pedido Preventivo"
            >
                <div className="space-y-4">
                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Motivo da Rejeição*</label>
                    <textarea
                        id="rejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Descreva por que este pedido está sendo rejeitado..."
                    />
                    <div className="flex justify-end pt-2 space-x-3">
                        <button type="button" onClick={closeRejectionModal} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleReject} disabled={isSubmitting || !rejectionReason.trim()} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Rejeitando...' : 'Confirmar Rejeição'}
                        </button>
                    </div>
                </div>
            </ActionModal>

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
                            onEdit={onEditRequest}
                            onApprove={openApprovalModal}
                            onReject={openRejectionModal}
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