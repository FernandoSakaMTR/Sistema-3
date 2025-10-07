import React, { useState, useEffect } from 'react';
import type { User, MaintenanceRequest } from '../types';
import { MaintenanceType, EquipmentStatus } from '../types';
import { EQUIPMENT_STATUS_TEXT_COLORS } from '../constants';

interface CreateRequestPageProps {
    user: User;
    onSubmit: (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>, isEditing: boolean) => void;
    requestToEdit?: MaintenanceRequest;
    onCancel: () => void;
}

const CreateRequestPage: React.FC<CreateRequestPageProps> = ({ user, onSubmit, requestToEdit, onCancel }) => {
    const isEditing = !!requestToEdit;
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus>(EquipmentStatus.PARTIAL);
    const [equipment, setEquipment] = useState('');
    const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>(MaintenanceType.MECHANICAL);
    const [attachments, setAttachments] = useState<File[]>([]);
    
    useEffect(() => {
        if (isEditing) {
            setTitle(requestToEdit.title);
            setDescription(requestToEdit.description);
            setEquipmentStatus(requestToEdit.equipmentStatus);
            setEquipment(requestToEdit.equipment.join(', '));
            setMaintenanceType(requestToEdit.maintenanceType);
            setAttachments(requestToEdit.attachments || []);
        }
    }, [isEditing, requestToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !equipment) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const newRequestData = {
            title,
            description,
            equipmentStatus,
            requester: user,
            requesterSector: user.sector,
            equipment: equipment.split(',').map(item => item.trim()),
            maintenanceType,
            attachments,
        };
        onSubmit(newRequestData, isEditing);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                {isEditing ? `Editando Pedido: ${requestToEdit.id}` : 'Abrir Novo Pedido'}
            </h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título Curto*</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                
                <div>
                    <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">Equipamento(s)*</label>
                    <input type="text" id="equipment" value={equipment} onChange={e => setEquipment(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Ex: Prensa PH-02, Esteira-01" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-700">Tipo de Manutenção*</label>
                        <select id="maintenanceType" value={maintenanceType} onChange={e => setMaintenanceType(e.target.value as MaintenanceType)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            {Object.values(MaintenanceType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="equipmentStatus" className="block text-sm font-medium text-gray-700">Status do Equipamento*</label>
                        <select 
                            id="equipmentStatus" 
                            value={equipmentStatus} 
                            onChange={e => setEquipmentStatus(e.target.value as EquipmentStatus)} 
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-bold transition-colors ${EQUIPMENT_STATUS_TEXT_COLORS[equipmentStatus]}`}
                        >
                            {Object.values(EquipmentStatus).map(s => (
                                <option key={s} value={s} className="text-black font-normal">
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">O que está ocorrendo?*</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Anexos (Fotos, Vídeos)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                        {isEditing ? 'Salvar Alterações' : 'Enviar Pedido'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRequestPage;