import React, { useState, useEffect, useCallback } from 'react';
import type { User, MaintenanceRequest } from './types';
import { UserRole, RequestStatus, EquipmentStatus, MaintenanceType } from './types';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import RequestsListPage from './pages/RequestsListPage';
import RequestDetailPage from './pages/RequestDetailPage';
import CreateRequestPage from './pages/CreateRequestPage';
import UserManagementPage from './pages/UserManagementPage';
import MyProfilePage from './pages/MyProfilePage';
import PreventiveRequestsPage from './pages/PreventiveRequestsPage';
import * as api from './services/mockApiService';
import { getOperationalData } from './services/operationalDataService';
import { SYSTEM_USER, PREVENTIVE_CHECKLISTS } from './constants';

const PREVENTIVE_MAINTENANCE_CYCLE_HOURS = 300;
const PREVENTIVE_MAINTENANCE_TRIGGER_PERCENTAGE = 0.85;
const PREVENTIVE_THRESHOLD_MS = PREVENTIVE_MAINTENANCE_CYCLE_HOURS * PREVENTIVE_MAINTENANCE_TRIGGER_PERCENTAGE * 60 * 60 * 1000;


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchRequests = useCallback(async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) setLoading(true);
        try {
            const data = await api.getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            if (!isBackgroundRefresh) {
              alert("Não foi possível carregar os pedidos. Verifique a conexão com o servidor.");
            }
        } finally {
            if (!isBackgroundRefresh) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchRequests(false); // Carga inicial
            let defaultPage: string;
            if ([UserRole.MANAGER, UserRole.ADMIN].includes(user.role)) {
                defaultPage = 'dashboard';
            } else if (user.role === UserRole.MAINTENANCE) {
                defaultPage = 'all-requests';
            } else {
                defaultPage = 'my-requests';
            }
            setCurrentPage(defaultPage);
        }
    }, [user, fetchRequests]);
    
    // Efeito para polling de dados (atualização em tempo real)
    useEffect(() => {
        if (user) {
            const intervalId = setInterval(() => {
                fetchRequests(true); // Atualização em segundo plano
            }, 15000); // Atualiza a cada 15 segundos

            // Limpa o intervalo quando o usuário desloga ou o componente é desmontado
            return () => clearInterval(intervalId);
        }
    }, [user, fetchRequests]);

    // Efeito centralizado para criar pedidos preventivos
    useEffect(() => {
        const checkAndCreatePreventives = async () => {
            if (requests.length === 0) return;

            try {
                const operationalData = await getOperationalData();
                const requestsByEquipment: Record<string, MaintenanceRequest[]> = {};
                 for (const req of requests) {
                    for (const eq of req.equipment) {
                        if (!requestsByEquipment[eq]) requestsByEquipment[eq] = [];
                        requestsByEquipment[eq].push(req);
                    }
                }

                const triggeredEquipment = new Set<string>();

                for (const equipmentName in requestsByEquipment) {
                    if (triggeredEquipment.has(equipmentName)) continue;

                    const eqRequests = requestsByEquipment[equipmentName];
                    const uptimeMs = operationalData[equipmentName]?.totalOperationalTimeMs || 0;

                    const lastCompletedRequest = eqRequests
                        .filter(r => r.status === RequestStatus.COMPLETED && r.completedAt)
                        .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0];
                    
                    if (lastCompletedRequest && uptimeMs >= PREVENTIVE_THRESHOLD_MS) {
                        const hasActiveWorkOrder = requests.some(r =>
                            r.equipment.includes(equipmentName) && (
                                (r.isPreventive && r.status === RequestStatus.PENDING_APPROVAL) || // Is a pending preventive
                                !r.status || // Is a "New" request (could be a just-approved preventive)
                                r.status === RequestStatus.IN_PROGRESS // Is in progress
                            )
                        );
                        
                        if (!hasActiveWorkOrder) {
                             const maintenanceType = lastCompletedRequest.maintenanceType;
                             const checklistTemplate = PREVENTIVE_CHECKLISTS[maintenanceType as MaintenanceType] || [];
                             const checklist = checklistTemplate.map(item => ({ item, checked: false }));

                             const preventiveRequestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'> = {
                                description: `Manutenção Preventiva Programada para ${equipmentName}. Atingiu ${(uptimeMs / (1000 * 60 * 60)).toFixed(1)}h de operação, excedendo o limite de ${(PREVENTIVE_THRESHOLD_MS / (1000 * 60 * 60)).toFixed(1)}h. Último tipo de manutenção: ${maintenanceType}.`,
                                equipmentStatus: EquipmentStatus.OPERATIONAL,
                                requester: SYSTEM_USER,
                                requesterSector: lastCompletedRequest.requesterSector,
                                equipment: [equipmentName],
                                maintenanceType: maintenanceType,
                                failureTime: new Date(),
                                attachments: [],
                                status: RequestStatus.PENDING_APPROVAL,
                                isPreventive: true,
                                checklist: checklist.length > 0 ? checklist : undefined,
                            };
                            await api.createRequest(preventiveRequestData);
                            triggeredEquipment.add(equipmentName);
                        }
                    }
                }

                if (triggeredEquipment.size > 0) {
                    fetchRequests(true); // Refresh list silently if new requests were created
                }

            } catch (error) {
                console.error("Falha ao verificar/criar pedidos preventivos:", error);
            }
        };

        checkAndCreatePreventives();
    }, [requests]); // Executa toda vez que a lista de pedidos é atualizada

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

    const handleBackToList = (targetPage?: string) => {
        setSelectedRequestId(null);
        if (targetPage) {
            setCurrentPage(targetPage);
            return;
        }
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
                const originalRequest = requests.find(r => r.id === selectedRequestId);
                await api.updateRequest(selectedRequestId, requestData, user.id);
                await fetchRequests();
                alert('Pedido atualizado com sucesso!');
                setCurrentPage(originalRequest?.isPreventive ? 'approvals' : 'request-detail');
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
        if (user) {
            if (selectedRequestId) {
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
                    const onCancelPage = request.isPreventive ? 'approvals' : 'request-detail';
                    return <CreateRequestPage 
                                user={user} 
                                onSubmit={handleUpsertRequest}
                                requestToEdit={request}
                                onCancel={() => handleNavigation(onCancelPage)}
                            />;
                }
            }
        }

        switch (currentPage) {
            case 'dashboard':
                if (user) return <DashboardPage requests={requests} />;
                return null;
            case 'approvals':
                 if (user && [UserRole.MANAGER, UserRole.ADMIN].includes(user.role)) {
                    const pendingPreventives = requests.filter(r => r.isPreventive && r.status === RequestStatus.PENDING_APPROVAL);
                    const pendingCompletions = requests.filter(r => r.status === RequestStatus.PENDING_COMPLETION_APPROVAL);
                    return <PreventiveRequestsPage
                                pendingPreventiveRequests={pendingPreventives}
                                pendingCompletionRequests={pendingCompletions}
                                onSelectRequest={handleSelectRequest} 
                            />;
                 }
                 setCurrentPage('dashboard'); // Redirect non-admins
                 return null;
            case 'all-requests':
                return <RequestsListPage title="Todos os Pedidos" requests={requests.filter(r => !r.isPreventive)} onSelectRequest={handleSelectRequest} user={user} />;
            case 'my-requests':
                const myRequests = requests.filter(r => r.requester.id === user?.id && !r.isPreventive);
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
                if (user) return <DashboardPage requests={requests} />;
                return null;
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