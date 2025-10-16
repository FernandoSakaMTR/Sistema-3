import React from 'react';
import { DashboardIcon, ListIcon, PlusIcon, UserIcon, XIcon, ShieldCheckIcon } from './icons';
import type { User } from '../types';
import { UserRole } from '../types';

interface SidebarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  isDesktopCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed }) => (
  <li
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${
      isActive
        ? 'bg-brand-blue-light text-white shadow-md'
        : 'text-gray-200 hover:bg-brand-blue-dark hover:text-white'
    }`}
  >
    {icon}
    {!isCollapsed && <span className="ml-4 font-medium whitespace-nowrap">{label}</span>}
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, onNavigate, isDesktopCollapsed, isMobileOpen, onMobileClose }) => {
  const isManagerOrAdmin = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role);
  const isAdmin = user.role === UserRole.ADMIN;
  const canCreate = true; // Permitir que todos os perfis criem pedidos
  const canViewAll = [UserRole.MAINTENANCE, UserRole.MANAGER, UserRole.ADMIN].includes(user.role);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    onMobileClose();
  }

  return (
    <aside className={`bg-brand-blue-dark text-white flex flex-col p-4 fixed h-full shadow-lg z-40 transition-transform lg:transition-all duration-300 ease-in-out
      ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
      lg:translate-x-0
      w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className={`flex items-center mb-8 border-b border-blue-700 pb-4 h-[56px] transition-all duration-300 ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isDesktopCollapsed ? (
          <h1 className="text-2xl font-bold text-white whitespace-nowrap">MTR TOPURA</h1>
        ) : (
           <div className="font-bold text-xl text-white">MTR</div>
        )}
        <button onClick={onMobileClose} className="lg:hidden text-gray-300 hover:text-white">
            <XIcon className="h-6 w-6" />
        </button>
      </div>
      <nav>
        <ul>
          {isManagerOrAdmin && (
            <NavItem
              icon={<DashboardIcon className="h-6 w-6" />}
              label="Dashboard"
              isActive={currentPage === 'dashboard'}
              onClick={() => handleNavigation('dashboard')}
              isCollapsed={isDesktopCollapsed}
            />
          )}
          {isManagerOrAdmin && (
            <NavItem
              icon={<ShieldCheckIcon className="h-6 w-6" />}
              label="Aprovações"
              isActive={currentPage === 'approvals'}
              onClick={() => handleNavigation('approvals')}
              isCollapsed={isDesktopCollapsed}
            />
          )}
          {canViewAll && (
            <NavItem
              icon={<ListIcon className="h-6 w-6" />}
              label="Ordens de Serviço"
              isActive={currentPage === 'all-requests'}
              onClick={() => handleNavigation('all-requests')}
              isCollapsed={isDesktopCollapsed}
            />
          )}
          {user.role !== UserRole.MANAGER && (
            <NavItem
              icon={<ListIcon className="h-6 w-6" />}
              label="Minhas OS"
              isActive={currentPage === 'my-requests'}
              onClick={() => handleNavigation('my-requests')}
              isCollapsed={isDesktopCollapsed}
            />
          )}
          {canCreate && (
            <NavItem
              icon={<PlusIcon className="h-6 w-6" />}
              label="Abrir Nova OS"
              isActive={currentPage === 'create-request'}
              onClick={() => handleNavigation('create-request')}
              isCollapsed={isDesktopCollapsed}
            />
          )}
          {isAdmin && (
            <NavItem
              icon={<UserIcon className="h-6 w-6" />}
              label="Gerenciar Usuários"
              isActive={currentPage === 'user-management'}
              onClick={() => handleNavigation('user-management')}
              isCollapsed={isDesktopCollapsed}
            />
          )}
        </ul>
      </nav>
       <div className={`mt-auto transition-opacity duration-300 ${isDesktopCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        {!isDesktopCollapsed && <p className="text-sm text-blue-300 text-center">v1.0.0</p>}
      </div>
    </aside>
  );
};

export default Sidebar;