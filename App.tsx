import React, { useState, useEffect, useCallback } from 'react';
import type { User, MaintenanceRequest } from './types';
import { UserRole, RequestStatus } from './types';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import RequestsListPage from './pages/RequestsListPage';
import RequestDetailPage from './pages/RequestDetailPage';
import CreateRequestPage from './pages/CreateRequestPage';
import UserManagementPage from './pages/UserManagementPage';
import MyProfilePage from './pages/MyProfilePage';
import * as api from './services/mockApiService';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            alert("Não foi possível carregar os pedidos. Verifique a conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchRequests();
            const defaultPage = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role) ? 'dashboard' : 'my-requests';
            setCurrentPage(defaultPage);
        }
    }, [user, fetchRequests]);

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentPage('dashboard');
    };

    const handleNavigation = (page: string) => {
        setCurrentPage(page);
        setSelectedRequestId(null);
    };
    
    const toggleDesktopSidebar = () => {
        setIsDesktopSidebarCollapsed(prevState => !prevState);
    };

    const handleSelectRequest = (id: string) => {
        setSelectedRequestId(id);
        setCurrentPage('request-detail');
    };

    const handleBackToList = () => {
        setSelectedRequestId(null);
        // Navigate back to the most relevant list page
        const canViewAll = [UserRole.MAINTENANCE, UserRole.MANAGER, UserRole.ADMIN].includes(user?.role || UserRole.REQUESTER);
        setCurrentPage(canViewAll ? 'all-requests' : 'my-requests');
    };
    
    const handleEditRequest = (id: string) => {
        setSelectedRequestId(id);
        setCurrentPage('edit-request');
    };
    
    const handleUpsertRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>, isEditing: boolean) => {
        if (!user) return;
        try {
            if (isEditing) {
                if (!selectedRequestId) return;
                await api.updateRequest(selectedRequestId, requestData, user.id);
                await fetchRequests();
                alert('Pedido atualizado com sucesso!');
                setCurrentPage('request-detail');
            } else {
                await api.createRequest(requestData);
                await fetchRequests();
                alert('Pedido criado com sucesso!');
                setCurrentPage('my-requests');
            }
        } catch (error: any) {
            console.error(`Failed to ${isEditing ? 'update' : 'create'} request:`, error);
            alert(error.message || `Não foi possível ${isEditing ? 'atualizar' : 'criar'} o pedido. Tente novamente.`);
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        if (!user) return;
        if (window.confirm('Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.')) {
            try {
                await api.deleteRequest(requestId, user.id);
                alert('Pedido excluído com sucesso!');
                await fetchRequests();
                if (selectedRequestId === requestId) {
                    handleBackToList();
                }
            } catch (error: any) {
                console.error("Failed to delete request:", error);
                alert(error.message || "Não foi possível excluir o pedido.");
            }
        }
    };

    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        alert('Perfil atualizado com sucesso!');
    };

    const renderPage = () => {
        if (selectedRequestId && user) {
            const request = requests.find(r => r.id === selectedRequestId);
            if (currentPage === 'request-detail') {
                return <RequestDetailPage 
                            requestId={selectedRequestId} 
                            user={user} 
                            onBack={handleBackToList}
                            onDeleteRequest={handleDeleteRequest} 
                            onEditRequest={handleEditRequest}
                            onRequestUpdate={fetchRequests}
                        />;
            }
            if (currentPage === 'edit-request' && request) {
                return <CreateRequestPage 
                            user={user} 
                            onSubmit={handleUpsertRequest}
                            requestToEdit={request}
                            onCancel={() => setCurrentPage('request-detail')}
                        />;
            }
        }

        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage requests={requests} />;
            case 'all-requests':
                return <RequestsListPage title="Todos os Pedidos" requests={requests} onSelectRequest={handleSelectRequest} />;
            case 'my-requests':
                const myRequests = requests.filter(r => r.requester.id === user?.id);
                return <RequestsListPage 
                            title="Meus Pedidos" 
                            requests={myRequests} 
                            onSelectRequest={handleSelectRequest} 
                            user={user}
                            onDeleteRequest={handleDeleteRequest}
                            onEditRequest={handleEditRequest}
                        />;
            case 'create-request':
                if (user) return <CreateRequestPage user={user} onSubmit={handleUpsertRequest} onCancel={() => setCurrentPage('my-requests')} />;
                return null;
            case 'user-management':
                 if (user?.role === UserRole.ADMIN) return <UserManagementPage user={user} />;
                 setCurrentPage('dashboard'); // Redirect non-admins
                 return null;
            case 'my-profile':
                 if (user) return <MyProfilePage user={user} onUserUpdate={handleUserUpdate} />;
                 return null;
            default:
                return <DashboardPage requests={requests} />;
        }
    };

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="h-screen bg-slate-100 overflow-hidden">
            <Sidebar 
              user={user} 
              currentPage={currentPage} 
              onNavigate={handleNavigation} 
              isDesktopCollapsed={isDesktopSidebarCollapsed}
              isMobileOpen={isMobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
            <div className={`h-full flex-1 flex flex-col transition-all duration-300 ease-in-out ${isDesktopSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header 
                    user={user} 
                    onLogout={handleLogout} 
                    onNavigate={handleNavigation}
                    onToggleDesktopSidebar={toggleDesktopSidebar}
                    isDesktopSidebarCollapsed={isDesktopSidebarCollapsed} 
                    onToggleMobileSidebar={() => setMobileMenuOpen(true)}
                />
                <main className="flex-1 overflow-y-auto pt-20">
                    {loading ? <div className="p-8">Carregando dados...</div> : renderPage()}
                </main>
            </div>
            {/* Mobile menu backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default App;