import React, { useState } from 'react';
import { ChevronDownIcon, LogoutIcon, CogIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MenuIcon } from './icons';
import type { User } from '../types';
import { ROLE_ICONS } from '../constants';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onToggleDesktopSidebar: () => void;
  onToggleMobileSidebar: () => void;
  isDesktopSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate, onToggleDesktopSidebar, onToggleMobileSidebar, isDesktopSidebarCollapsed }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setDropdownOpen(false);
  }
  
  const IconComponent = ROLE_ICONS[user.role];

  return (
    <header className={`bg-white shadow-md p-4 flex justify-between items-center fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out 
      left-0 ${isDesktopSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
    `}>
      <div className="flex items-center">
         {/* Botão para Desktop */}
        <button 
          onClick={onToggleDesktopSidebar} 
          className="hidden lg:block p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-light mr-4"
          title={isDesktopSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isDesktopSidebarCollapsed ? (
            <ChevronDoubleRightIcon className="h-6 w-6 text-gray-600" />
          ) : (
            <ChevronDoubleLeftIcon className="h-6 w-6 text-gray-600" />
          )}
        </button>
         {/* Botão para Mobile */}
         <button 
          onClick={onToggleMobileSidebar} 
          className="lg:hidden p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-light mr-2"
          title="Abrir menu"
        >
            <MenuIcon className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 hidden sm:block">Sistema de Manutenção</h1>
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-slate-600" />
          </div>
          <div className="hidden md:block">
            <p className="font-semibold text-gray-700 text-sm">{user.name}</p>
            <p className="text-gray-500 text-xs">{user.role}</p>
          </div>
          <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('my-profile');
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <CogIcon className="h-5 w-5 mr-3 text-gray-500" />
              Meu Perfil
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
                setDropdownOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogoutIcon className="h-5 w-5 mr-3 text-gray-500" />
              Sair
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;