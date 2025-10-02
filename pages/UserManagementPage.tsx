import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import * as api from '../services/mockApiService';

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [sector, setSector] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.REQUESTER);
    const [password, setPassword] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const userList = await api.getUsers();
        setUsers(userList);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sector || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        await api.createUser({ name, sector, role, password });
        alert('Usuário criado com sucesso!');
        // Reset form
        setName('');
        setSector('');
        setRole(UserRole.REQUESTER);
        setPassword('');
        // Refresh user list
        fetchUsers();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciar Usuários</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulário de Criação */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Criar Novo Usuário</h2>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Setor</label>
                            <input type="text" id="sector" value={sector} onChange={e => setSector(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
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
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.sector}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                            </tr>
                                        ))}
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