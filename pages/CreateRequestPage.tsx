

import React, { useState, useEffect } from 'react';
import type { User, MaintenanceRequest } from '../types';
import { MaintenanceType, EquipmentStatus } from '../types';
import { EQUIPMENT_STATUS_BG_COLORS, SECTORS } from '../constants';

interface CreateRequestPageProps {
    user: User;
    onSubmit: (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>, isEditing: boolean) => void;
    requestToEdit?: MaintenanceRequest;
    onCancel: () => void;
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

const CreateRequestPage: React.FC<CreateRequestPageProps> = ({ user, onSubmit, requestToEdit, onCancel }) => {
    const isEditing = !!requestToEdit;
    
    const [requesterName, setRequesterName] = useState('');
    const [description, setDescription] = useState('');
    const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus | ''>('');
    const [equipment, setEquipment] = useState('');
    const [requesterSector, setRequesterSector] = useState('');
    const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [failureTime, setFailureTime] = useState('');
    const [errors, setErrors] = useState<{ 
        equipment?: string, 
        description?: string, 
        requesterName?: string, 
        requesterSector?: string, 
        failureTime?: string,
        maintenanceType?: string,
        equipmentStatus?: string
    }>({});
    
    useEffect(() => {
        if (isEditing && requestToEdit) {
            setRequesterName(requestToEdit.requester.name);
            setDescription(requestToEdit.description);
            setEquipmentStatus(requestToEdit.equipmentStatus);
            setEquipment(requestToEdit.equipment.join(', '));
            setMaintenanceTypes(requestToEdit.maintenanceType);
            setAttachments(requestToEdit.attachments || []);
            setRequesterSector(requestToEdit.requesterSector);
            setFailureTime(formatDateForInput(requestToEdit.failureTime));
        } else {
            // Limpa o formulário para um novo pedido
            setRequesterName('');
            setDescription('');
            setEquipmentStatus('');
            setEquipment('');
            setMaintenanceTypes([]);
            setAttachments([]);
            setErrors({});
            setRequesterSector('');
            setFailureTime(formatDateForInput(new Date())); // Default para agora
        }
    }, [isEditing, requestToEdit, user.sector]);

    const handleMaintenanceTypeChange = (type: MaintenanceType) => {
        setMaintenanceTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};
        if (!requesterName.trim()) newErrors.requesterName = 'O campo Nome do Solicitante é obrigatório.';
        if (!equipment.trim()) newErrors.equipment = 'O campo Equipamento é obrigatório.';
        if (!requesterSector) newErrors.requesterSector = 'Por favor, selecione um setor.';
        if (!description.trim()) newErrors.description = 'O campo de descrição é obrigatório.';
        if (!failureTime) newErrors.failureTime = 'A data e hora da falha são obrigatórias.';
        if (maintenanceTypes.length === 0) newErrors.maintenanceType = 'Selecione ao menos um tipo de manutenção.';
        if (!equipmentStatus) newErrors.equipmentStatus = 'Por favor, selecione o status do equipamento.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        const newRequestData = {
            description,
            equipmentStatus: equipmentStatus as EquipmentStatus,
            requester: { ...user, name: requesterName.trim() },
            requesterSector,
            equipment: equipment.split(',').map(item => item.trim()),
            maintenanceType: maintenanceTypes,
            attachments,
            failureTime: new Date(failureTime),
        };
        onSubmit(newRequestData, isEditing);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };
    
    const baseInputStyle = "mt-1 block w-full rounded-md border shadow-sm sm:text-sm focus:border-brand-blue-light focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-all duration-200";
    const normalInputStyle = `${baseInputStyle} bg-gray-100 border-gray-300 placeholder-gray-500`;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                {isEditing ? `Editando Ordem de Serviço: ${requestToEdit.id}` : 'Abrir Nova OS'}
            </h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                 <div>
                    <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700">Seu Nome*</label>
                    <input 
                        type="text" id="requesterName" value={requesterName} onChange={e => setRequesterName(e.target.value)} 
                        className={`${normalInputStyle} ${errors.requesterName ? 'border-red-500' : ''}`} placeholder="Digite seu nome completo" 
                    />
                    {errors.requesterName && <p className="mt-1 text-sm text-red-600">{errors.requesterName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="requesterSector" className="block text-sm font-medium text-gray-700">Setor*</label>
                        <select id="requesterSector" value={requesterSector} onChange={e => setRequesterSector(e.target.value)}
                            className={`${normalInputStyle} ${errors.requesterSector ? 'border-red-500' : ''}`}>
                            <option value="" disabled>Selecione o setor</option>
                            {SECTORS.map(sector => <option key={sector} value={sector}>{sector}</option>)}
                        </select>
                        {errors.requesterSector && <p className="mt-1 text-sm text-red-600">{errors.requesterSector}</p>}
                    </div>
                    <div>
                        <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">Equipamento*</label>
                        <input type="text" id="equipment" list="equipment-numbers" value={equipment} onChange={e => setEquipment(e.target.value)} 
                            className={`${normalInputStyle} ${errors.equipment ? 'border-red-500' : ''}`} placeholder="Digite ou selecione o nome" />
                        <datalist id="equipment-numbers">{Array.from({ length: 50 }, (_, i) => i + 1).map(num => <option key={num} value={`Equipamento ${String(num)}`} />)}</datalist>
                        {errors.equipment && <p className="mt-1 text-sm text-red-600">{errors.equipment}</p>}
                    </div>
                </div>
                 <div>
                    <label htmlFor="failureTime" className="block text-sm font-medium text-gray-700">Data e Hora da Falha*</label>
                    <input type="datetime-local" id="failureTime" value={failureTime} onChange={e => setFailureTime(e.target.value)}
                           className={`${normalInputStyle} ${errors.failureTime ? 'border-red-500' : ''}`} />
                    {errors.failureTime && <p className="mt-1 text-sm text-red-600">{errors.failureTime}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Manutenção*</label>
                        <div className={`mt-2 grid grid-cols-2 gap-x-4 gap-y-2 p-3 rounded-md border ${errors.maintenanceType ? 'border-red-500' : 'border-gray-300'}`}>
                            {Object.values(MaintenanceType).map(type => (
                                <label key={type} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={maintenanceTypes.includes(type)}
                                        onChange={() => handleMaintenanceTypeChange(type)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-blue-light focus:ring-brand-blue-light"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                        {errors.maintenanceType && <p className="mt-1 text-sm text-red-600">{errors.maintenanceType}</p>}
                    </div>
                    <div>
                        <label htmlFor="equipmentStatus" className="block text-sm font-medium text-gray-700">Status do Equipamento*</label>
                        <select id="equipmentStatus" value={equipmentStatus} onChange={e => setEquipmentStatus(e.target.value as EquipmentStatus)} 
                            className={`${baseInputStyle} font-bold ${equipmentStatus ? EQUIPMENT_STATUS_BG_COLORS[equipmentStatus] : 'bg-gray-100 border-gray-300'} text-black ${errors.equipmentStatus ? 'border-red-500' : ''}`}>
                            <option value="" disabled>Selecione o status</option>
                            {Object.values(EquipmentStatus).map(s => <option key={s} value={s} className="text-black font-normal bg-white">{s}</option>)}
                        </select>
                        {errors.equipmentStatus && <p className="mt-1 text-sm text-red-600">{errors.equipmentStatus}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">O que está ocorrendo?*</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} 
                        className={`${normalInputStyle} text-base p-3 ${errors.description ? 'border-red-500' : ''}`}
                        placeholder="Descreva o problema com o máximo de detalhes possível..."></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Anexos (Fotos, Vídeos)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-slate-50 hover:border-brand-blue-light transition-colors">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Carregar arquivos</span>
                                    <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">ou arraste e solte</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                            {attachments.length > 0 && <p className="text-sm text-green-600">{attachments.length} arquivo(s) selecionado(s).</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-x-4">
                    <button type="button" onClick={onCancel} className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Cancelar
                    </button>
                    <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light">
                        {isEditing ? 'Salvar Alterações' : 'Enviar Ordem de Serviço'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRequestPage;