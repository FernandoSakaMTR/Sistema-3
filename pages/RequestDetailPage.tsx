

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<RequestStatus | null>(null);
    const [reason, setReason] = useState('');
    const [assigneeName, setAssigneeName] = useState('');
    const [completerName, setCompleterName] = useState('');
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

    const handleActionSelect = (action: RequestStatus) => {
        setCurrentAction(action);
        setReason('');
        setAssigneeName('');
        setCompleterName('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
        setCurrentAction(null);
    };

    const handleConfirmAction = async () => {
        if (!currentAction) return;

        setIsSubmitting(true);
        try {
            await updateRequestStatus(requestId, currentAction, { 
                reason, 
                assigneeName, 
                completerName 
            });
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
    const isCompleted = request.status === RequestStatus.COMPLETED;
    const isFinalized = isCompleted || isCanceled;
    
    const canEditRequest = isOwner && isEditable;
    const canDeleteRequestAsRequester = isOwner && isEditable && user.role !== UserRole.MAINTENANCE && user.role !== UserRole.ADMIN;
    const canPerformAnyAction = (canTakeAction || canEditRequest || canDeleteRequestAsRequester) && !isCompleted && !isCanceled;

    const checkConfirmDisabled = () => {
        if (isSubmitting) return true;
        switch (currentAction) {
            case RequestStatus.IN_PROGRESS:
                return !assigneeName.trim();
            case RequestStatus.COMPLETED:
                return !reason.trim() || !completerName.trim();
            case RequestStatus.CANCELED:
                return !reason.trim();
            default:
                return true;
        }
    };
    const isConfirmDisabled = checkConfirmDisabled();

    const getModalContent = () => {
        const baseInputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
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
                        <div>
                            <label htmlFor="maintenanceNotes" className="block text-sm font-medium text-gray-700">O que foi feito?*</label>
                            <textarea id="maintenanceNotes" value={reason} onChange={e => setReason(e.target.value)} rows={4}
                                      className={baseInputStyle} placeholder="Descreva o serviço realizado..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="completerName" className="block text-sm font-medium text-gray-700">Finalizado por*</label>
                            <input type="text" id="completerName" value={completerName} onChange={e => setCompleterName(e.target.value)}
                                   className={baseInputStyle} placeholder="Digite o nome de quem finalizou" />
                        </div>
                    </div>
                );
            case RequestStatus.CANCELED:
                return (
                    <div>
                        <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">Motivo do Cancelamento*</label>
                        <textarea id="cancelReason" value={reason} onChange={(e) => setReason(e.target.value)}
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

    return (
        <div className="p-8">
            <ActionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={getModalTitle()}
            >
                <div className="space-y-6">
                    {getModalContent()}
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
                            onClick={handleConfirmAction} 
                            disabled={isConfirmDisabled}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Confirmando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </ActionModal>
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                 <div>
                    <button onClick={onBack} className="text-brand-blue hover:underline mb-2">&larr; Voltar para a lista</button>
                    <h1 className="text-3xl font-bold text-gray-800">
                       Detalhes do Pedido <span className="text-gray-500 font-medium">{request.id}</span>
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
                    <DetailItem label="Tipo" value={request.maintenanceType} />
                    <DetailItem label="Data da Abertura" value={formatDate(request.createdAt)} />
                </div>

                {/* Description Section */}
                <div className="border-t pt-8">
                    <h2 className="text-sm font-medium text-gray-500 mb-2">O que está ocorrendo?</h2>
                    <p className={`text-xl text-gray-800 whitespace-pre-wrap ${isCanceled ? 'line-through text-gray-500 decoration-2' : ''}`}>
                        {request.description}
                    </p>
                </div>

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
                                {request.approvedBy && <DetailItem label="Aprovado por" value={request.approvedBy} />}
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

                {canPerformAnyAction && (
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
                )}
            </div>
        </div>
    );
};

export default RequestDetailPage;