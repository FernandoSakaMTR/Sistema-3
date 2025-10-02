
import React, { useState } from 'react';
import { UserIcon, ChevronDownIcon, LogoutIcon, CogIcon } from './icons';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setDropdownOpen(false);
  }

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-64 right-0 z-10">
      <h1 className="text-2xl font-semibold text-gray-800">Sistema de Manutenção</h1>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="bg-brand-blue rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
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