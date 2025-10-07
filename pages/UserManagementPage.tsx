
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import * as api from '../services/mockApiService';
import { ROLE_ICONS } from '../constants';
import { TrashIcon, PencilIcon } from '../components/icons';

interface UserManagementPageProps {
    user: User;
}

const EditUserModal: React.FC<{
    user: User;
    currentUser: User;
    onClose: () => void;
    onSave: (id: number, data: Partial<Pick<User, 'name' | 'role'>>) => Promise<void>;
}> = ({ user, currentUser, onClose, onSave }) => {
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState(user.role);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(user.id, { name, role });
        setIsSaving(false);
    };

    const isEditingSelf = user.id === currentUser.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Usuário</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" id="edit-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">Perfil de Acesso</label>
                        <select 
                            id="edit-role" 
                            value={role} 
                            onChange={e => setRole(e.target.value as UserRole)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-200"
                            disabled={isEditingSelf}
                        >
                            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {isEditingSelf && <p className="text-xs text-gray-500 mt-1">Você não pode alterar seu próprio perfil de acesso.</p>}
                    </div>
                    <div className="flex justify-end pt-4 space-x-4">
                         <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light disabled:bg-gray-400">
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserManagementPage: React.FC<UserManagementPageProps> = ({ user: currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.REQUESTER);
    const [password, setPassword] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const userList = await api.getUsers();
            setUsers(userList);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            alert("Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        try {
            await api.createUser({ name, sector: 'Não definido', role, password });
            alert('Usuário criado com sucesso!');
            // Reset form
            setName('');
            setRole(UserRole.REQUESTER);
            setPassword('');
            // Refresh user list
            fetchUsers();
        } catch (error) {
            console.error("Failed to create user:", error);
            alert("Não foi possível criar o usuário.");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário? A ação não pode ser desfeita.')) {
            try {
                await api.deleteUser(userId);
                alert('Usuário excluído com sucesso!');
                fetchUsers();
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Não foi possível excluir o usuário.");
            }
        }
    };

    const handleSaveUserUpdate = async (id: number, data: Partial<Pick<User, 'name' | 'role'>>) => {
        try {
            await api.updateUser(id, data);
            alert('Usuário atualizado com sucesso!');
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
             console.error("Failed to update user:", error);
            alert("Não foi possível atualizar o usuário.");
        }
    };

    return (
        <div className="p-8">
            {editingUser && (
                <EditUserModal 
                    user={editingUser} 
                    currentUser={currentUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleSaveUserUpdate}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciar Usuários</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulário de Criação */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleCreateSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Criar Novo Usuário</h2>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Perfil de Acesso</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light">
                                Criar Usuário
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Lista de Usuários */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h2 className="text-xl font-bold text-gray-700 mb-4">Usuários Cadastrados</h2>
                         {loading ? <p>Carregando...</p> : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => {
                                            const IconComponent = ROLE_ICONS[user.role];
                                            return (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                          <IconComponent className="h-6 w-6 text-slate-600" />
                                                      </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.sector}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-4">
                                                            <button
                                                                onClick={() => setEditingUser(user)}
                                                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                                title="Editar Usuário"
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </button>
                                                            {currentUser.id !== user.id && (
                                                                <button 
                                                                    onClick={() => handleDeleteUser(user.id)} 
                                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                                    title="Excluir Usuário"
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;