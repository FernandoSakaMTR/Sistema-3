import React, { useState } from 'react';
import { ChevronDownIcon, LogoutIcon, CogIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MenuIcon, CloudOffIcon, SyncIcon, CloudCheckIcon, UserIcon } from './icons';
import type { User } from '../types';
import { ROLE_ICONS } from '../constants';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onToggleDesktopSidebar: () => void;
    isDesktopSidebarCollapsed: boolean;
    onToggleMobileSidebar: () => void;
    isOnline: boolean;
    syncStatus: SyncStatus;
}

const SyncStatusIndicator: React.FC<{ status: SyncStatus, pendingActions: number }> = ({ status, pendingActions }) => {
    if (status === 'syncing') {
        return (
            <div className="flex items-center gap-x-2 text-sm text-blue-600" title="Sincronizando dados com o servidor...">
                <SyncIcon className="h-5 w-5 animate-spin" />
                <span>Sincronizando...</span>
            </div>
        );
    }
    if (status === 'synced' && pendingActions === 0) {
        return (
            <div className="flex items-center gap-x-2 text-sm text-green-600" title="Todos os dados estão salvos e sincronizados.">
                <CloudCheckIcon className="h-5 w-5" />
                <span>Sincronizado</span>
            </div>
        );
    }
     if (pendingActions > 0) {
        return (
            <div className="flex items-center gap-x-2 text-sm text-yellow-600" title={`${pendingActions} ações pendentes para sincronizar.`}>
                <SyncIcon className="h-5 w-5" />
                <span>{pendingActions} pendente(s)</span>
            </div>
        );
    }
    return null;
};


const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate, onToggleDesktopSidebar, isDesktopSidebarCollapsed, onToggleMobileSidebar, isOnline, syncStatus }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const UserRoleIcon = ROLE_ICONS[user.role];

    return (
        <header className="bg-white shadow-md fixed top-0 w-full z-30 h-20 flex items-center pr-8 transition-all duration-300 ease-in-out">
            <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-300 ease-in-out ${isDesktopSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                 <button 
                    onClick={onToggleDesktopSidebar}
                    className="hidden lg:block text-gray-500 hover:text-brand-blue"
                    title={isDesktopSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                 >
                    {isDesktopSidebarCollapsed ? <ChevronDoubleRightIcon className="h-6 w-6" /> : <ChevronDoubleLeftIcon className="h-6 w-6" />}
                </button>
                 <button 
                    onClick={onToggleMobileSidebar}
                    className="lg:hidden text-gray-500 hover:text-brand-blue p-4"
                 >
                    <MenuIcon className="h-6 w-6" />
                </button>
            </div>
            
            <div className="flex-1">
                 <div className="flex items-center gap-x-4">
                    {!isOnline && (
                        <div className="flex items-center gap-x-2 text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full" title="Você está offline. As alterações serão salvas localmente e sincronizadas quando a conexão voltar.">
                            <CloudOffIcon className="h-5 w-5" />
                            <span>Offline</span>
                        </div>
                    )}
                    {isOnline && <SyncStatusIndicator status={syncStatus} pendingActions={0} />}
                 </div>
            </div>

            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <UserRoleIcon className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onNavigate('my-profile'); }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <CogIcon className="h-4 w-4 mr-3" />
                            Meu Perfil
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onLogout(); }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <LogoutIcon className="h-4 w-4 mr-3" />
                            Sair
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
