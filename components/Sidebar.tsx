
import React from 'react';
import { DashboardIcon, ListIcon, PlusIcon, WrenchIcon, UserIcon } from './icons';
import type { User } from '../types';
import { UserRole } from '../types';

interface SidebarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
      isActive
        ? 'bg-brand-blue-light text-white shadow-md'
        : 'text-gray-200 hover:bg-brand-blue-dark hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, onNavigate }) => {
  const isManagerOrAdmin = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role);
  const isAdmin = user.role === UserRole.ADMIN;
  const canCreate = [UserRole.REQUESTER, UserRole.ADMIN].includes(user.role);
  const canViewAll = [UserRole.MAINTENANCE, UserRole.MANAGER, UserRole.ADMIN].includes(user.role);

  return (
    <aside className="w-64 bg-brand-blue-dark text-white flex flex-col p-4 fixed h-full shadow-lg">
      <div className="flex items-center mb-8 border-b border-blue-700 pb-4">
        <WrenchIcon className="h-10 w-10 text-brand-blue-light" />
        <h1 className="text-xl font-bold ml-3">Manutenção</h1>
      </div>
      <nav>
        <ul>
          {isManagerOrAdmin && (
            <NavItem
              icon={<DashboardIcon className="h-6 w-6" />}
              label="Dashboard"
              isActive={currentPage === 'dashboard'}
              onClick={() => onNavigate('dashboard')}
            />
          )}
          {canViewAll && (
            <NavItem
              icon={<ListIcon className="h-6 w-6" />}
              label="Todas Requisições"
              isActive={currentPage === 'all-requests'}
              onClick={() => onNavigate('all-requests')}
            />
          )}
          <NavItem
            icon={<ListIcon className="h-6 w-6" />}
            label="Minhas Requisições"
            isActive={currentPage === 'my-requests'}
            onClick={() => onNavigate('my-requests')}
          />
          {canCreate && (
            <NavItem
              icon={<PlusIcon className="h-6 w-6" />}
              label="Abrir Requisição"
              isActive={currentPage === 'create-request'}
              onClick={() => onNavigate('create-request')}
            />
          )}
          {isAdmin && (
            <NavItem
              icon={<UserIcon className="h-6 w-6" />}
              label="Gerenciar Usuários"
              isActive={currentPage === 'user-management'}
              onClick={() => onNavigate('user-management')}
            />
          )}
        </ul>
      </nav>
      <div className="mt-auto">
        <p className="text-sm text-blue-300">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;