import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import * as api from '../services/mockApiService';
import { WrenchIcon, UserIcon, LockIcon } from '../components/icons';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await api.getUsers();
        setUsers(userList);
        if (userList.length > 0) {
          setSelectedUserId(userList[0].id.toString());
        }
      } catch (error) {
        setError("Falha ao carregar usuários. Verifique se o servidor está online.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await api.login(parseInt(selectedUserId, 10), password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Usuário ou senha inválidos!');
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-100 flex items-center justify-center">
              <p>Carregando usuários...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-10 space-y-8 transform transition-all hover:scale-105">
        <div className="text-center">
          <WrenchIcon className="mx-auto h-16 w-16 text-brand-blue" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistema de Manutenção
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Selecione um perfil para continuar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue-light focus:border-brand-blue-light sm:text-sm"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
                <LockIcon className="absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue-light focus:border-brand-blue-light sm:text-sm"
                />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-light transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;