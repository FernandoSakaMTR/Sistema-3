import React, { useState } from 'react';
import type { User } from '../types';
import * as api from '../services/mockApiService';
import { SECTORS } from '../constants';

interface MyProfilePageProps {
    user: User;
    onUserUpdate: (updatedUser: User) => void;
}

const MyProfilePage: React.FC<MyProfilePageProps> = ({ user, onUserUpdate }) => {
    const [name, setName] = useState(user.name);
    const [sector, setSector] = useState(user.sector);
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const updateData: Partial<Pick<User, 'name' | 'password' | 'sector'>> = {
            name,
            sector,
        };
        
        if (newPassword) {
            updateData.password = newPassword;
        }

        try {
            const updatedUser = await api.updateUser(user.id, updateData);
            onUserUpdate(updatedUser);
            setNewPassword(''); // Clear password field after successful submission
        } catch (error) {
            console.error("Failed to update user:", error);
            alert("Não foi possível atualizar o perfil. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Meu Perfil</h1>
            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input 
                            type="text" 
                            id="name" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                        />
                    </div>

                     <div>
                        <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Setor</label>
                        <select 
                            id="sector" 
                            value={sector} 
                            onChange={e => setSector(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {/* If current sector is not in the list, add it */}
                            {!SECTORS.includes(sector) && <option key={sector} value={sector}>{sector}</option>}
                            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Perfil de Acesso</label>
                         <p className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 p-2 text-sm text-gray-500">{user.role}</p>
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
                        <input 
                            type="password" 
                            id="newPassword" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Deixe em branco para não alterar"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyProfilePage;