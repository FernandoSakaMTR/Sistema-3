
import React, { useState } from 'react';
import type { User, MaintenanceRequest } from '../types';
import { MaintenanceType, Priority } from '../types';

interface CreateRequestPageProps {
    user: User;
    onSubmit: (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
}

const CreateRequestPage: React.FC<CreateRequestPageProps> = ({ user, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
    const [equipment, setEquipment] = useState('');
    const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>(MaintenanceType.MECHANICAL);
    const [attachments, setAttachments] = useState<File[]>([]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !equipment) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const newRequestData = {
            title,
            description,
            priority,
            requester: user,
            requesterSector: user.sector,
            equipment: equipment.split(',').map(item => item.trim()),
            maintenanceType,
            attachments,
        };
        onSubmit(newRequestData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Abrir Nova Requisição</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título Curto*</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                
                <div>
                    <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">Equipamento(s)* (separados por vírgula)</label>
                    <input type="text" id="equipment" value={equipment} onChange={e => setEquipment(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-700">Tipo de Manutenção*</label>
                        <select id="maintenanceType" value={maintenanceType} onChange={e => setMaintenanceType(e.target.value as MaintenanceType)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            {Object.values(MaintenanceType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridade*</label>
                        <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição do Problema*</label>
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

                <div className="flex justify-end">
                    <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light">
                        Enviar Requisição
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRequestPage;
