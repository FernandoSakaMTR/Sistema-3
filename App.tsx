import React, { useState, useEffect, useCallback } from 'react';
import type { User, MaintenanceRequest } from './types';
import { UserRole } from './types';
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

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            alert("Não foi possível carregar as requisições. Verifique a conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchRequests();
            // Default page based on role
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

    const handleSelectRequest = (id: string) => {
        setSelectedRequestId(id);
        setCurrentPage('request-detail');
    };

    const handleBackToList = () => {
        setSelectedRequestId(null);
        setCurrentPage('all-requests');
    };
    
    const handleCreateRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
        try {
            await api.createRequest(requestData);
            await fetchRequests();
            alert('Requisição criada com sucesso!');
            setCurrentPage('my-requests');
        } catch (error) {
            console.error("Failed to create request:", error);
            alert("Não foi possível criar a requisição. Tente novamente.");
        }
    };

    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        alert('Perfil atualizado com sucesso!');
    };

    const renderPage = () => {
        if (selectedRequestId && currentPage === 'request-detail' && user) {
            return <RequestDetailPage requestId={selectedRequestId} user={user} onBack={handleBackToList} />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage requests={requests} />;
            case 'all-requests':
                return <RequestsListPage title="Todas Requisições" requests={requests} onSelectRequest={handleSelectRequest} />;
            case 'my-requests':
                const myRequests = requests.filter(r => r.requester.id === user?.id);
                return <RequestsListPage title="Minhas Requisições" requests={myRequests} onSelectRequest={handleSelectRequest} />;
            case 'create-request':
                if (user) return <CreateRequestPage user={user} onSubmit={handleCreateRequest} />;
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
        <div className="flex h-screen bg-slate-100">
            <Sidebar user={user} currentPage={currentPage} onNavigate={handleNavigation} />
            <div className="flex-1 flex flex-col ml-64">
                <Header user={user} onLogout={handleLogout} onNavigate={handleNavigation} />
                <main className="flex-1 overflow-y-auto mt-20">
                    {loading ? <div className="p-8">Carregando dados...</div> : renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;