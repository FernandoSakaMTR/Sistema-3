import React, { useState, useEffect, useCallback } from 'react';
// FIX: Import RequestStatus as a value to use its members.
import type { MaintenanceRequest, User } from '../types';
import { UserRole, RequestStatus } from '../types';
import { getRequestById, updateRequestStatus } from '../services/mockApiService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { PaperclipIcon, XIcon, CheckIcon } from '../components/icons';

interface RequestDetailPageProps {
    requestId: string;
    user: User;
    onBack: () => void;
    onDeleteRequest: (id: string) => void;
    onEditRequest: (id: string) => void;
    onRequestUpdate: () => Promise<void>;
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

// Modal Configuration
// Actions that require user input (justification/notes).
const MODAL_CONFIG: Record<RequestStatus, { title: string; placeholder: string; isReasonRequired: boolean }> = {
    [RequestStatus.CANCELED]: { title: 'Cancelar Pedido', placeholder: 'Por favor, descreva o motivo do cancelamento*', isReasonRequired: true },
    [RequestStatus.COMPLETED]: { title: 'Descreva o que foi feito', placeholder: 'Descreva o serviço realizado para constar nas notas da manutenção*', isReasonRequired: true },
    // Other actions do not require a modal and will be executed immediately.
    [RequestStatus.IN_PROGRESS]: { title: '', placeholder: '', isReasonRequired: false },
    [RequestStatus.PAUSED]: { title: '', placeholder: '', isReasonRequired: false },
};


const RequestDetailPage: React.FC<RequestDetailPageProps> = ({ requestId, user, onBack, onDeleteRequest, onEditRequest, onRequestUpdate }) => {
    const [request, setRequest] = useState<MaintenanceRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

    // State for the new modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<RequestStatus | null>(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRequest = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRequestById(requestId);
            setRequest(data || null);
        } catch(error) {
            console.error("Failed to fetch request details:", error);
            setRequest(null);
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);
    
    useEffect(() => {
        if (request?.attachments && request.attachments.length > 0) {
            const urls = request.attachments.map(file => URL.createObjectURL(file));
            setAttachmentUrls(urls);
            return () => urls.forEach(url => URL.revokeObjectURL(url));
        }
    }, [request]);

    const handleOpenModal = (action: RequestStatus) => {
        // For simple actions without a modal title, execute immediately.
        if (!MODAL_CONFIG[action] || !MODAL_CONFIG[action].title) {
            handleConfirmAction(action);
            return;
        }
        setCurrentAction(action);
        setReason(''); // Reset reason on open
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
        setCurrentAction(null);
    };

    const handleConfirmAction = async (actionToConfirm?: RequestStatus) => {
        const action = actionToConfirm || currentAction;
        if (!action) return;

        setIsSubmitting(true);
        try {
            await updateRequestStatus(requestId, action, user, reason || undefined);
            // Atualiza tanto a lista principal (no App) quanto os detalhes desta página
            await Promise.all([fetchRequest(), onRequestUpdate()]);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Não foi possível atualizar o status do pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8">Carregando detalhes do pedido...</div>;
    }

    if (!request) {
        return <div className="p-8">Pedido não encontrado.</div>;
    }

    const canTakeAction = [UserRole.MAINTENANCE, UserRole.ADMIN].includes(user.role);
    const isOwner = user.id === request.requester.id;
    const isEditable = !request.status;
    const isCanceled = request.status === RequestStatus.CANCELED;
    
    const canEditRequest = isOwner && isEditable;
    const canDeleteRequestAsRequester = isOwner && isEditable && user.role !== UserRole.MAINTENANCE && user.role !== UserRole.ADMIN;
    const canPerformAnyAction = (canTakeAction || canEditRequest || canDeleteRequestAsRequester) && request.status !== RequestStatus.COMPLETED && !isCanceled;

    const modalConfig = currentAction ? MODAL_CONFIG[currentAction] : null;
    const isConfirmDisabled = isSubmitting || (modalConfig?.isReasonRequired && !reason.trim());

    return (
        <div className="p-8">
            {/* Action Confirmation Modal */}
            {isModalOpen && modalConfig && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">{modalConfig.title}</h2>
                            <button onClick={handleCloseModal} disabled={isSubmitting}>
                                <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
                            </button>
                        </div>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={modalConfig.placeholder}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <div className="flex justify-end pt-4 space-x-3">
                            <button 
                                type="button" 
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleConfirmAction()} 
                                disabled={isConfirmDisabled}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Confirmando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                 </div>
            )}
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <button onClick={onBack} className="text-brand-blue hover:underline mb-2">&larr; Voltar para a lista</button>
                    <h1 className={`text-3xl font-bold text-gray-800 ${isCanceled ? 'line-through text-gray-500 decoration-2' : ''}`}>{request.title}</h1>
                    <p className="text-gray-500">{request.id}</p>
                </div>
                <div>
                    {request.status === RequestStatus.COMPLETED ? (
                        <div className="flex items-center gap-x-3 bg-ticket-completed text-white px-4 sm:px-6 py-2 rounded-lg shadow-lg">
                            <CheckIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                            <span className="text-xl sm:text-2xl font-bold">Concluída</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            {!isCanceled && <PriorityBadge status={request.equipmentStatus} />}
                            <StatusBadge status={request.status} />
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Coluna 1: Informações do Pedido */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Detalhes do Pedido</h2>
                        <DetailItem label="Solicitante" value={request.requester.name} />
                        <DetailItem label="Setor do Solicitante" value={request.requesterSector} />
                        <DetailItem label="Equipamento(s)" value={request.equipment} />
                        <DetailItem label="Tipo de Manutenção" value={request.maintenanceType} />
                        <DetailItem label="Data da Abertura" value={new Date(request.createdAt).toLocaleString()} />
                        <DetailItem label="Última Atualização" value={new Date(request.updatedAt).toLocaleString()} />
                    </div>
                    
                    {/* Coluna 2: Descrição e Manutenção */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Descrição e Anexos</h2>
                        <DetailItem label="O que está ocorrendo?">
                            <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                        </DetailItem>
                        <DetailItem label="Anexos">
                            {request.attachments && request.attachments.length > 0 ? (
                                <ul className="space-y-2 border border-gray-200 rounded-md p-3">
                                    {request.attachments.map((file, index) => (
                                        <li key={index}>
                                            <a 
                                                href={attachmentUrls[index]} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                                            >
                                                <PaperclipIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{file.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">Nenhum anexo foi adicionado.</p>
                            )}
                        </DetailItem>
                        {isCanceled && request.cancelReason && (
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
                        <DetailItem label="Início do Atendimento" value={request.startedAt ? new Date(request.startedAt).toLocaleString() : undefined} />
                        <DetailItem label="Conclusão do Atendimento" value={request.completedAt ? new Date(request.completedAt).toLocaleString() : undefined} />
                        <DetailItem label="Notas da Manutenção">
                             <p className="text-gray-700 whitespace-pre-wrap">{request.maintenanceNotes || 'N/A'}</p>
                        </DetailItem>
                    </div>
                </div>

                {canPerformAnyAction && (
                    <div className="border-t mt-8 pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 w-full mb-4">Ações</h3>
                        <div className="flex flex-wrap gap-4">
                            {/* Maintenance Actions */}
                            {canTakeAction && !request.status && <button onClick={() => handleOpenModal(RequestStatus.IN_PROGRESS)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Iniciar Atendimento</button>}
                            {canTakeAction && request.status === RequestStatus.IN_PROGRESS && <button onClick={() => handleOpenModal(RequestStatus.PAUSED)} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Pausar</button>}
                            {canTakeAction && request.status === RequestStatus.IN_PROGRESS && <button onClick={() => handleOpenModal(RequestStatus.COMPLETED)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Concluir</button>}
                            {canTakeAction && request.status === RequestStatus.PAUSED && <button onClick={() => handleOpenModal(RequestStatus.IN_PROGRESS)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Retomar Atendimento</button>}
                            {canTakeAction && (!request.status || request.status === RequestStatus.PAUSED || request.status === RequestStatus.IN_PROGRESS) && <button onClick={() => handleOpenModal(RequestStatus.CANCELED)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Cancelar Pedido</button>}
                            
                            {/* Requester Actions */}
                            {canEditRequest && (
                                <button onClick={() => onEditRequest(request.id)} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800">Editar Pedido</button>
                            )}
                            {canDeleteRequestAsRequester && (
                                <button onClick={() => onDeleteRequest(request.id)} className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800">Excluir Pedido</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestDetailPage;