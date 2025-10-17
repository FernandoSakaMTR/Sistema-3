import React, { useState, useEffect, useCallback } from 'react';
import type { MaintenanceRequest, User, MaintenanceType } from '../types';
import { UserRole, RequestStatus } from '../types';
import { getRequestById, updateRequestStatus, approvePreventiveRequest, updateRequest, submitCompletionForApproval, resolveCompletionApproval } from '../services/mockApiService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { PaperclipIcon, XIcon, CheckIcon, WrenchIcon, ShieldCheckIcon } from '../components/icons';

interface RequestDetailPageProps {
    requestId: string;
    user: User;
    onBack: (targetPage?: string) => void;
    onDeleteRequest: (id: string) => void;
    onEditRequest: (id: string) => void;
    onRequestUpdate: () => Promise<void>;
}

// Função para formatar a data para o input datetime-local
const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDate = (date: Date | undefined | null): string | undefined => {
    if (!date) return undefined;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatDuration = (start: Date, end: Date): string => {
    let diff = end.getTime() - start.getTime();
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));

    const parts = [];
    if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Menos de 1 minuto';
};


const DetailItem: React.FC<{ label: string; value?: string | string[] | null, children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {children ? <div className="mt-1">{children}</div> : <p className="text-md text-gray-800 font-semibold">{Array.isArray(value) ? value.join(', ') : value || 'N/A'}</p>}
    </div>
);

const ReasonBox: React.FC<{ title: string; reason: string; color: 'red' | 'yellow' | 'orange' }> = ({ title, reason, color }) => {
    const colorClasses = {
        red: 'bg-red-50 border-red-300 text-red-900',
        yellow: 'bg-yellow-50 border-yellow-300 text-yellow-900',
        orange: 'bg-orange-50 border-orange-300 text-orange-900',
    };
    return (
        <div className={`p-4 mt-4 border-l-4 rounded-md ${colorClasses[color]}`}>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm mt-1 whitespace-pre-wrap">{reason}</p>
        </div>
    );
};

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
                    <button onClick={onClose}>
                        <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};


const RequestDetailPage: React.FC<RequestDetailPageProps> = ({ requestId, user, onBack, onDeleteRequest, onEditRequest, onRequestUpdate }) => {
    const [request, setRequest] = useState<MaintenanceRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for standard actions
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<RequestStatus | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [assigneeName, setAssigneeName] = useState('');
    const [completerName, setCompleterName] = useState('');
    
    // State for preventive actions
    const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
    const [isRejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [approverName, setApproverName] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // State for checklist
    const [checklists, setChecklists] = useState<{ type: MaintenanceType; items: { item: string; checked: boolean; }[] }[]>([]);
    
    // State for completion date change
    const [isCompletionDateChanged, setIsCompletionDateChanged] = useState(false);
    const [newCompletionDate, setNewCompletionDate] = useState(formatDateForInput(new Date()));
    const [completionChangeReason, setCompletionChangeReason] = useState('');


    const fetchRequest = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRequestById(requestId);
            setRequest(data || null);
            if (data?.checklists) {
                setChecklists(data.checklists);
            }
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

    const handleActionSelect = (action: RequestStatus) => {
        setCurrentAction(action);
        setActionReason('');
        setAssigneeName('');
        setCompleterName('');
        setIsCompletionDateChanged(false);
        setNewCompletionDate(formatDateForInput(new Date()));
        setCompletionChangeReason('');

        if (request?.checklists) {
            setChecklists(JSON.parse(JSON.stringify(request.checklists))); // Deep copy
        }
        setIsActionModalOpen(true);
    };
    
    const handleCloseActionModal = () => {
        if (isSubmitting) return;
        setIsActionModalOpen(false);
        setCurrentAction(null);
    };

    const handleConfirmAction = async () => {
        if (!currentAction) return;
        setIsSubmitting(true);
        try {
            if (currentAction === RequestStatus.COMPLETED) {
                if (isCompletionDateChanged) {
                     await submitCompletionForApproval(requestId, {
                        requestedCompletedAt: new Date(newCompletionDate),
                        completionChangeReason: completionChangeReason,
                        maintenanceNotes: actionReason,
                        completedBy: completerName,
                        checklists: checklists,
                    });
                    alert('Solicitação de alteração de data enviada para aprovação!');
                    onBack('all-requests');
                    return;
                } else {
                     const updateData = {
                        status: RequestStatus.COMPLETED,
                        completedAt: new Date(),
                        maintenanceNotes: actionReason,
                        completedBy: completerName,
                        checklists: checklists,
                    };
                    await updateRequest(requestId, updateData, user.id);
                }
            } else {
                 await updateRequestStatus(requestId, currentAction, { 
                    reason: actionReason, 
                    assigneeName, 
                    completerName 
                });
            }
           
            await Promise.all([fetchRequest(), onRequestUpdate()]);
            handleCloseActionModal();
        } catch (error: any) {
            console.error("Failed to update status:", error);
            alert(error.message || "Não foi possível atualizar o status do pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- Preventive Action Handlers ---
    const handleConfirmApproval = async () => {
        if (!approverName.trim()) {
            alert('O nome do aprovador é obrigatório.');
            return;
        }
        setIsSubmitting(true);
        try {
            await approvePreventiveRequest(requestId, approverName, user);
            await onRequestUpdate();
            alert('Pedido preventivo aprovado com sucesso!');
            onBack('approvals');
        } catch (error: any) {
            console.error("Failed to approve request:", error);
            alert(error.message || "Não foi possível aprovar o pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmRejection = async () => {
        if (!rejectionReason.trim()) {
            alert('Por favor, forneça um motivo para a rejeição.');
            return;
        }
        setIsSubmitting(true);
        try {
            await updateRequestStatus(requestId, RequestStatus.CANCELED, { reason: rejectionReason });
            await onRequestUpdate();
            alert('Pedido preventivo rejeitado com sucesso.');
            onBack('approvals');
        } catch (error: any) {
            console.error("Failed to reject request:", error);
            alert(error.message || "Não foi possível rejeitar o pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

     // --- Completion Approval Handlers ---
    const handleCompletionApproval = async (isApproved: boolean) => {
        setIsSubmitting(true);
        try {
            await resolveCompletionApproval(requestId, isApproved);
            await onRequestUpdate();
            alert(`Alteração de conclusão ${isApproved ? 'aprovada' : 'rejeitada'} com sucesso.`);
            onBack('approvals');
        } catch (error: any) {
            console.error("Failed to resolve completion approval:", error);
            alert(error.message || "Não foi possível processar a aprovação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChecklistChange = (checklistIndex: number, itemIndex: number) => {
        const newChecklists = [...checklists];
        newChecklists[checklistIndex].items[itemIndex].checked = !newChecklists[checklistIndex].items[itemIndex].checked;
        setChecklists(newChecklists);
    };

    const handleDatePartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDatePart = e.target.value;
        const currentTimePart = newCompletionDate.split('T')[1] || '00:00';
        setNewCompletionDate(`${newDatePart}T${currentTimePart}`);
    };

    const handleHourPartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newHourPart = e.target.value;
        const currentParts = newCompletionDate.split('T');
        const currentDatePart = currentParts[0];
        const currentMinutePart = currentParts[1] ? currentParts[1].split(':')[1] : '00';
        setNewCompletionDate(`${currentDatePart}T${newHourPart}:${currentMinutePart}`);
    };

    const handleMinutePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMinutePart = e.target.value;
        const currentParts = newCompletionDate.split('T');
        const currentDatePart = currentParts[0];
        const currentHourPart = currentParts[1] ? currentParts[1].split(':')[0] : '00';
        setNewCompletionDate(`${currentDatePart}T${currentHourPart}:${newMinutePart}`);
    };

    if (loading) {
        return <div className="p-8">Carregando detalhes do pedido...</div>;
    }

    if (!request) {
        return <div className="p-8">Pedido não encontrado.</div>;
    }

    const isNewRequestForMaintenance = user.role === UserRole.MAINTENANCE && request && !request.status;
    const canTakeAction = [UserRole.MAINTENANCE, UserRole.ADMIN].includes(user.role);
    const isOwner = user.id === request.requester.id;
    const isEditable = !request.status;
    const isCanceled = request.status === RequestStatus.CANCELED;
    const isCompleted = request.status === RequestStatus.COMPLETED;
    const isFinalized = isCompleted || isCanceled;
    
    const canEditRequest = isOwner && isEditable;
    const canDeleteRequestAsRequester = isOwner && isEditable && user.role !== UserRole.MAINTENANCE && user.role !== UserRole.ADMIN;
    const isPendingPreventive = request.isPreventive && request.status === RequestStatus.PENDING_APPROVAL;
    const isPendingCompletionApproval = request.status === RequestStatus.PENDING_COMPLETION_APPROVAL;
    const canManagePreventive = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role) && isPendingPreventive;
    const canManageCompletion = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role) && isPendingCompletionApproval;

    const canPerformAnyAction = (canTakeAction || canEditRequest || canDeleteRequestAsRequester) && !isFinalized && !isPendingCompletionApproval;

    const checkConfirmDisabled = () => {
        if (isSubmitting) return true;
        switch (currentAction) {
            case RequestStatus.IN_PROGRESS:
                return !assigneeName.trim();
            case RequestStatus.COMPLETED:
                if (isCompletionDateChanged) {
                    return !actionReason.trim() || !completerName.trim() || !newCompletionDate || !completionChangeReason.trim();
                }
                return !actionReason.trim() || !completerName.trim();
            case RequestStatus.CANCELED:
                return !actionReason.trim();
            default:
                return true;
        }
    };
    const isConfirmDisabled = checkConfirmDisabled();

    const getModalContent = () => {
        const baseInputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
        const prominentInputStyle = "mt-2 block w-full rounded-lg border-2 border-gray-300 shadow-sm p-3 text-lg bg-gray-50 focus:border-brand-blue focus:ring focus:ring-brand-blue-light focus:ring-opacity-50 transition-colors duration-200";

        switch (currentAction) {
            case RequestStatus.IN_PROGRESS:
                return (
                    <div>
                        <label htmlFor="assigneeName" className="block text-sm font-medium text-gray-700">Nome do Responsável*</label>
                        <input type="text" id="assigneeName" value={assigneeName} onChange={e => setAssigneeName(e.target.value)}
                               className={baseInputStyle} placeholder="Digite o nome completo" />
                    </div>
                );
            case RequestStatus.COMPLETED:
                return (
                    <div className="space-y-4">
                        {checklists && checklists.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="block text-sm font-medium text-gray-700">Checklist de Verificação*</h3>
                                <div className="space-y-4 border rounded-md p-4 bg-gray-50 max-h-60 overflow-y-auto">
                                    {checklists.map((checklist, checklistIndex) => (
                                        <div key={checklist.type}>
                                            <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">{checklist.type}</h4>
                                            {checklist.items.map((item, itemIndex) => (
                                                <label key={itemIndex} className="flex items-center cursor-pointer p-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.checked}
                                                        onChange={() => handleChecklistChange(checklistIndex, itemIndex)}
                                                        className="h-5 w-5 rounded border-gray-300 text-brand-blue-light focus:ring-brand-blue-light"
                                                    />
                                                    <span className={`ml-3 text-md text-gray-800`}>{item.item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="maintenanceNotes" className="block text-sm font-medium text-gray-700">O que foi feito?*</label>
                            <textarea id="maintenanceNotes" value={actionReason} onChange={e => setActionReason(e.target.value)} rows={4}
                                      className={prominentInputStyle} placeholder="Descreva o serviço realizado..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="completerName" className="block text-sm font-medium text-gray-700">Finalizado por*</label>
                            <input type="text" id="completerName" value={completerName} onChange={e => setCompleterName(e.target.value)}
                                   className={prominentInputStyle} placeholder="Digite o nome de quem finalizou" />
                        </div>

                         <div className="border-t pt-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isCompletionDateChanged}
                                    onChange={() => setIsCompletionDateChanged(!isCompletionDateChanged)}
                                    className="h-5 w-5 rounded border-gray-300 text-brand-blue-light focus:ring-brand-blue-light"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-800">Alterar data e hora de conclusão?</span>
                            </label>
                             {isCompletionDateChanged && (
                                <div className="mt-4 space-y-4 pl-8 border-l-2 border-gray-200">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nova Data e Hora da Conclusão*</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border rounded-md bg-gray-50">
                                            <div>
                                                <label htmlFor="newCompletionDate_date" className="block text-xs font-medium text-gray-600">Data</label>
                                                <input
                                                    type="date"
                                                    id="newCompletionDate_date"
                                                    value={newCompletionDate.split('T')[0]}
                                                    onChange={handleDatePartChange}
                                                    className={baseInputStyle}
                                                />
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <div>
                                                    <label htmlFor="newCompletionDate_hour" className="block text-xs font-medium text-gray-600">Hora</label>
                                                    <select
                                                        id="newCompletionDate_hour"
                                                        value={newCompletionDate.split('T')[1]?.split(':')[0] || '00'}
                                                        onChange={handleHourPartChange}
                                                        className={baseInputStyle}
                                                    >
                                                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (
                                                            <option key={hour} value={hour}>{hour}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <span className="pb-2 font-bold text-gray-500">:</span>
                                                <div>
                                                    <label htmlFor="newCompletionDate_minute" className="block text-xs font-medium text-gray-600">Minuto</label>
                                                    <select
                                                        id="newCompletionDate_minute"
                                                        value={newCompletionDate.split('T')[1]?.split(':')[1] || '00'}
                                                        onChange={handleMinutePartChange}
                                                        className={baseInputStyle}
                                                    >
                                                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(minute => (
                                                            <option key={minute} value={minute}>{minute}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="completionChangeReason" className="block text-sm font-medium text-gray-700">Justificativa da Alteração*</label>
                                        <textarea id="completionChangeReason" value={completionChangeReason} onChange={e => setCompletionChangeReason(e.target.value)} rows={3} className={prominentInputStyle} placeholder="Ex: Falha na conexão com a internet no local"></textarea>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case RequestStatus.CANCELED:
                return (
                    <div>
                        <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">Motivo do Cancelamento*</label>
                        <textarea id="cancelReason" value={actionReason} onChange={(e) => setActionReason(e.target.value)}
                                  placeholder="Por favor, descreva o motivo do cancelamento..." rows={4} className={baseInputStyle} />
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch (currentAction) {
            case RequestStatus.IN_PROGRESS: return "Iniciar Atendimento";
            case RequestStatus.COMPLETED: return "Concluir Atendimento";
            case RequestStatus.CANCELED: return "Cancelar Pedido";
            default: return "";
        }
    }

    const isManagerOrAdmin = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role);
    const waitingTime = request.startedAt ? formatDuration(request.createdAt, request.startedAt) : undefined;
    const totalRepairTime = (request.status === RequestStatus.COMPLETED && request.startedAt && request.completedAt) 
        ? formatDuration(request.startedAt, request.completedAt) 
        : undefined;

    const getChecklistContainerClass = () => {
        if (isPendingPreventive) return 'bg-purple-50 border border-purple-200';
        if (request.status === RequestStatus.IN_PROGRESS) return 'bg-yellow-50 border border-yellow-200';
        if (isCompleted) return 'bg-green-50 border border-green-200';
        return 'bg-blue-50 border border-blue-200';
    };

    const getChecklistTitleClass = () => {
        if (isPendingPreventive) return 'text-purple-800';
        if (request.status === RequestStatus.IN_PROGRESS) return 'text-yellow-800';
        if (isCompleted) return 'text-green-800';
        return 'text-brand-blue';
    };

    const shouldDisplayChecklist = request.checklists && request.checklists.length > 0 && (request.isPreventive || request.approvedBy);


    return (
        <div className="p-8">
            {/* Modal for Standard Actions */}
            <ActionModal
                isOpen={isActionModalOpen}
                onClose={handleCloseActionModal}
                title={getModalTitle()}
            >
                <div className="space-y-6">
                    {getModalContent()}
                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={handleCloseActionModal} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleConfirmAction} disabled={isConfirmDisabled} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Confirmando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </ActionModal>
            
            {/* Modal for Preventive Approval */}
            <ActionModal
                isOpen={isApprovalModalOpen}
                onClose={() => setApprovalModalOpen(false)}
                title="Aprovar Pedido Preventivo"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Ao aprovar, este pedido será convertido em uma ordem de serviço e movido para a lista de "Novos Pedidos".</p>
                    <div>
                        <label htmlFor="approverName" className="block text-base font-semibold text-gray-800">Seu Nome*</label>
                        <input
                            id="approverName"
                            value={approverName}
                            onChange={(e) => setApproverName(e.target.value)}
                            type="text"
                            className="mt-2 block w-full rounded-lg border-2 border-gray-300 shadow-sm p-3 text-lg bg-gray-50 focus:border-brand-blue focus:ring focus:ring-brand-blue-light focus:ring-opacity-50 transition-colors duration-200"
                            placeholder="Digite seu nome completo aqui"
                        />
                    </div>
                    <div className="flex justify-end pt-2 space-x-3">
                        <button type="button" onClick={() => setApprovalModalOpen(false)} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleConfirmApproval} disabled={isSubmitting || !approverName.trim()} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Aprovando...' : 'Confirmar Aprovação'}
                        </button>
                    </div>
                </div>
            </ActionModal>

            {/* Modal for Preventive Rejection */}
             <ActionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setRejectionModalOpen(false)}
                title="Rejeitar Pedido Preventivo"
            >
                <div className="space-y-4">
                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Motivo da Rejeição*</label>
                    <textarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Descreva por que este pedido está sendo rejeitado..." />
                    <div className="flex justify-end pt-2 space-x-3">
                        <button type="button" onClick={() => setRejectionModalOpen(false)} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleConfirmRejection} disabled={isSubmitting || !rejectionReason.trim()} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Rejeitando...' : 'Confirmar Rejeição'}
                        </button>
                    </div>
                </div>
            </ActionModal>
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                 <div>
                    <button onClick={() => onBack()} className="text-brand-blue hover:underline mb-2">&larr; Voltar para a lista</button>
                    <h1 className="text-3xl font-bold text-gray-800">
                       Detalhes da Ordem de Serviço <span className="text-gray-500 font-medium">{request.id}</span>
                    </h1>
                </div>
                <div>
                    {isCompleted ? (
                         <div className="flex items-center gap-x-3 bg-ticket-completed text-white px-4 sm:px-6 py-2 rounded-lg shadow-lg">
                            <CheckIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                            <span className="text-xl sm:text-2xl font-bold">Concluída</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                             {isFinalized && request.approvedBy && (
                                <span className="inline-flex items-center gap-x-1.5 px-3 py-1 text-sm font-medium rounded-full bg-purple-600 text-white">
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    Origem Preventiva
                                </span>
                            )}
                            {!isCanceled && <PriorityBadge status={request.equipmentStatus} />}
                            <StatusBadge status={request.status} />
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
                {/* Top Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-6">
                    <DetailItem label="Solicitante" value={request.requester.name} />
                    <DetailItem label="Setor" value={request.requesterSector} />
                    <DetailItem label="Equipamento" value={request.equipment} />
                    <DetailItem label="Tipo" value={request.maintenanceType.join(', ')} />
                    <DetailItem label="Data da Abertura" value={formatDate(request.createdAt)} />
                </div>
                
                {isNewRequestForMaintenance ? (
                    <div className="border-t pt-8 text-center">
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h2 className="text-xl font-bold text-brand-blue mb-4 flex items-center justify-center">
                                <WrenchIcon className="h-6 w-6 mr-3" />
                                Pronto para começar?
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                                Para visualizar os detalhes e anexos, você precisa primeiro iniciar o atendimento. Isso formaliza o começo do trabalho e garante que o tempo de atendimento seja registrado corretamente.
                            </p>
                            <button 
                                onClick={() => handleActionSelect(RequestStatus.IN_PROGRESS)} 
                                className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-brand-blue-dark transition-colors shadow-lg text-lg font-semibold flex items-center justify-center mx-auto"
                            >
                                Iniciar Atendimento
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {isPendingCompletionApproval && (
                            <div className="border-t pt-8">
                                <div className="p-6 rounded-lg bg-orange-50 border-2 border-dashed border-orange-300">
                                    <h2 className="text-xl font-bold text-orange-800 flex items-center mb-4">
                                        Aprovação de Conclusão Pendente
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Conclusão registrada em</p>
                                            <p className="text-md text-gray-500 font-semibold line-through">{formatDate(request.updatedAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-orange-600">Nova data de conclusão solicitada</p>
                                            <p className="text-lg text-orange-900 font-bold">{formatDate(request.requestedCompletedAt)}</p>
                                        </div>
                                    </div>
                                    <ReasonBox title="Justificativa da Alteração" reason={request.completionChangeReason || 'N/A'} color="orange" />
                                    <p className="text-sm mt-2 text-gray-600">Finalizado por: <span className="font-semibold">{request.completedBy}</span></p>
                                </div>
                            </div>
                        )}
                        {/* Description Section */}
                        <div className="border-t pt-8">
                            <h2 className="text-sm font-medium text-gray-500 mb-2">O que está ocorrendo?</h2>
                            <p className={`text-xl text-gray-800 whitespace-pre-wrap ${isCanceled ? 'line-through text-gray-500 decoration-2' : ''}`}>
                                {request.description}
                            </p>
                        </div>

                         {/* Checklist Section */}
                        {shouldDisplayChecklist && (
                            <div className="border-t pt-8">
                                <div className={`p-6 rounded-lg ${getChecklistContainerClass()}`}>
                                    <h2 className={`text-xl font-bold flex items-center mb-4 ${getChecklistTitleClass()}`}>
                                        <WrenchIcon className="h-6 w-6 mr-3" />
                                        Checklist de Verificação Preventiva
                                    </h2>
                                    {isPendingPreventive && <p className="text-sm text-purple-700 mb-4">Este é o checklist que a equipe de manutenção deverá seguir após a aprovação.</p>}
                                    {request.status === RequestStatus.IN_PROGRESS && <p className="text-sm text-yellow-700 mb-4">Este checklist deve ser preenchido ao concluir o atendimento.</p>}
                                     {isCompleted && <p className="text-sm text-green-700 mb-4">Checklist preenchido na conclusão do serviço.</p>}
                                    <div className="space-y-4">
                                        {checklists.map((checklist) => (
                                             <div key={checklist.type}>
                                                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">{checklist.type}</h4>
                                                <div className="space-y-3 pl-2">
                                                    {checklist.items.map((item) => (
                                                        <label key={item.item} className={`flex items-center p-2 rounded-md transition-colors`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={item.checked}
                                                                disabled
                                                                className="h-5 w-5 rounded border-gray-300 text-brand-blue-light focus:ring-brand-blue-light disabled:bg-gray-200 disabled:cursor-not-allowed"
                                                            />
                                                            <span className={`ml-3 text-md ${item.checked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.item}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Attachments and Maintenance Section */}
                        <div className="border-t pt-8">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                                {/* Attachments */}
                                <div className={`${isFinalized ? 'lg:col-span-3' : 'lg:col-span-5'} space-y-6`}>
                                    <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Anexos</h2>
                                    <DetailItem label="">
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
                                </div>

                                {/* Maintenance Details (Conditional) */}
                                {isFinalized && (
                                    <div className="lg:col-span-2 space-y-4 bg-slate-100 p-6 rounded-lg h-fit">
                                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2 mb-4">Manutenção</h2>
                                        {request.approvedBy && <DetailItem label="Solicitado por" value={request.approvedBy} />}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                            <DetailItem label="Iniciado por" value={request.assignedTo} />
                                            <DetailItem label="Finalizado por" value={request.completedBy} />
                                            <DetailItem label="Início" value={formatDate(request.startedAt)} />
                                            <DetailItem label="Conclusão" value={formatDate(request.completedAt)} />
                                        </div>
                                        {isManagerOrAdmin && waitingTime && (
                                            <div className="pt-2">
                                                <DetailItem label="Aguardo no Atendimento" value={waitingTime} />
                                            </div>
                                        )}
                                        {isManagerOrAdmin && totalRepairTime && (
                                            <div className="pt-2">
                                                <DetailItem label="Tempo Total de Reparo" value={totalRepairTime} />
                                            </div>
                                        )}
                                        <div className="pt-2">
                                            <DetailItem label="Notas da Manutenção">
                                                <p className="text-lg text-gray-800 whitespace-pre-wrap mt-1">{request.maintenanceNotes || 'N/A'}</p>
                                            </DetailItem>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- ACTION BUTTONS --- */}
                         {canManageCompletion ? (
                            <div className="border-t pt-8">
                                <h3 className="text-lg font-semibold text-gray-700 w-full mb-4">Ações de Aprovação da Conclusão</h3>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => handleCompletionApproval(true)} className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors shadow-md">
                                        Aprovar Alteração
                                    </button>
                                    <button onClick={() => handleCompletionApproval(false)} className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors shadow-md">
                                        Rejeitar Alteração
                                    </button>
                                </div>
                            </div>
                        ) : canManagePreventive ? (
                             <div className="border-t pt-8">
                                <h3 className="text-lg font-semibold text-gray-700 w-full mb-4">Ações da Preventiva</h3>
                                <div className="flex flex-wrap gap-4">
                                     <button onClick={() => setApprovalModalOpen(true)} className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors shadow-md">
                                        Aprovar
                                    </button>
                                    <button onClick={() => setRejectionModalOpen(true)} className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors shadow-md">
                                        Rejeitar
                                    </button>
                                     <button onClick={() => onEditRequest(request.id)} className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-md">Editar</button>
                                </div>
                            </div>
                        ) : canPerformAnyAction ? (
                            <div className="border-t pt-8">
                                <h3 className="text-lg font-semibold text-gray-700 w-full mb-4">Ações Disponíveis</h3>
                                <div className="flex flex-wrap gap-4">
                                    {canTakeAction && (
                                        <>
                                            {request.status === undefined && (
                                                <button onClick={() => handleActionSelect(RequestStatus.IN_PROGRESS)} className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-md">
                                                    Iniciar Atendimento
                                                </button>
                                            )}
                                            {request.status === RequestStatus.IN_PROGRESS && (
                                                <button onClick={() => handleActionSelect(RequestStatus.COMPLETED)} className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors shadow-md">
                                                    Concluir
                                                </button>
                                            )}
                                            {(request.status === undefined || request.status === RequestStatus.IN_PROGRESS) && (
                                                <button onClick={() => handleActionSelect(RequestStatus.CANCELED)} className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors shadow-md">
                                                    Cancelar
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {canEditRequest && (
                                        <button onClick={() => onEditRequest(request.id)} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800">Editar Pedido</button>
                                    )}
                                    {canDeleteRequestAsRequester && (
                                        <button onClick={() => onDeleteRequest(request.id)} className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800">Excluir Pedido</button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestDetailPage;