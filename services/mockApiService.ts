import type { MaintenanceRequest, User, MaintenanceType } from '../types';
import { RequestStatus, UserRole } from '../types';
import { USERS as initialUsers, MOCK_REQUESTS as initialRequests } from '../constants';


// --- LocalStorage Persistence ---
const USERS_KEY = 'os-app-users';
const REQUESTS_KEY = 'os-app-requests';
const SYNC_QUEUE_KEY = 'os-app-sync-queue';

type SyncAction = 
    | { type: 'create_request', payload: MaintenanceRequest, id: string }
    | { type: 'update_request', payload: { requestId: string; updateData: Partial<Omit<MaintenanceRequest, 'id' | 'createdAt' | 'requester'>>; userId: number }, id: string }
    | { type: 'update_status', payload: { id: string, status: RequestStatus, details: { reason?: string; assigneeName?: string; completerName?: string } }, id: string }
    | { type: 'approve_preventive', payload: { requestId: string, approverName: string, approverUser: User }, id: string }
    | { type: 'submit_completion', payload: { requestId: string, updateData: any }, id: string }
    | { type: 'resolve_completion', payload: { requestId: string, isApproved: boolean }, id: string }
    | { type: 'delete_request', payload: { requestId: string, userId: number }, id: string }
    | { type: 'create_user', payload: User, id: string }
    | { type: 'update_user', payload: { userId: number, updateData: Partial<Pick<User, 'name' | 'password' | 'sector' | 'role'>> }, id: string }
    | { type: 'delete_user', payload: { userId: number }, id: string };


const deepCopyRequest = (req: any): MaintenanceRequest => {
    const newReq = { ...req }; 
    newReq.requester = { ...req.requester };
    newReq.equipment = [...req.equipment];
    newReq.attachments = []; // Arquivos não podem ser serializados no localStorage
    newReq.createdAt = new Date(req.createdAt);
    newReq.updatedAt = new Date(req.updatedAt);
    newReq.failureTime = new Date(req.failureTime);
    newReq.startedAt = req.startedAt ? new Date(req.startedAt) : undefined;
    newReq.completedAt = req.completedAt ? new Date(req.completedAt) : undefined;
    newReq.requestedCompletedAt = req.requestedCompletedAt ? new Date(req.requestedCompletedAt) : undefined;
    if (req.checklists) {
        newReq.checklists = req.checklists.map(cl => ({ 
            ...cl, 
            items: cl.items.map(item => ({ ...item })) 
        }));
    }
    return newReq;
}

const deepCopyRequests = (reqs: MaintenanceRequest[]): MaintenanceRequest[] => {
    return reqs.map(deepCopyRequest);
};

const initializeState = (): { users: User[], requests: MaintenanceRequest[], syncQueue: SyncAction[], nextUserId: number } => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedRequests = localStorage.getItem(REQUESTS_KEY);
    const storedSyncQueue = localStorage.getItem(SYNC_QUEUE_KEY);

    let users: User[];
    let requests: MaintenanceRequest[];
    let syncQueue: SyncAction[] = [];

    try {
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        } else {
            users = JSON.parse(JSON.stringify(initialUsers));
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        if (storedRequests) {
            requests = JSON.parse(storedRequests).map(deepCopyRequest);
        } else {
            requests = deepCopyRequests(initialRequests);
            localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
        }

        if (storedSyncQueue) {
            syncQueue = JSON.parse(storedSyncQueue);
        }

    } catch (error) {
        console.error("Failed to parse from localStorage, resetting state.", error);
        users = JSON.parse(JSON.stringify(initialUsers));
        requests = deepCopyRequests(initialRequests);
        syncQueue = [];
    }
    
    const nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    return { users, requests, syncQueue, nextUserId };
};

let { users, requests, syncQueue, nextUserId } = initializeState();

const persistState = () => {
    try {
        const serializableRequests = requests.map(req => {
            const { attachments, ...rest } = req;
            return { ...rest, attachments: [] }; // Garante que File objects não sejam salvos
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(serializableRequests));
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
    } catch (error) {
        console.error("Failed to persist state to localStorage:", error);
    }
};

const addToSyncQueue = (action: Omit<SyncAction, 'id'>) => {
    const actionWithId = { ...action, id: crypto.randomUUID() } as SyncAction;
    syncQueue.push(actionWithId);
    persistState();
    // Dispara a sincronização, que só vai rodar se estiver online
    syncWithServer();
};

let isSyncing = false;
export const syncWithServer = async (): Promise<boolean> => {
    if (isSyncing || !navigator.onLine || syncQueue.length === 0) {
        return false;
    }
    isSyncing = true;
    
    const queueToProcess = [...syncQueue];
    let success = true;

    for (const action of queueToProcess) {
        try {
            // Simula a chamada de API real. Se fosse real, seria um fetch.
            console.log('Syncing action:', action.type, action.payload);
            await delay(1000); // Simula latência da rede
            
            // Se a chamada "API" for bem-sucedida, remove da fila local
            syncQueue = syncQueue.filter(item => item.id !== action.id);
        } catch (error) {
            console.error('Sync failed for action:', action, error);
            // Se falhar, para o processo de sincronização para tentar novamente mais tarde
            success = false;
            break; 
        }
    }
    
    persistState();
    isSyncing = false;

    // Se a fila não estiver vazia e a sincronização não foi interrompida, tenta de novo
    if (success && syncQueue.length > 0) {
        setTimeout(syncWithServer, 1000);
    }
    
    return success;
};

export const getSyncQueue = (): SyncAction[] => {
    return [...syncQueue];
}


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const login = async (userId: number, password?: string): Promise<User> => {
    await delay(500);
    const user = users.find(u => u.id === userId);
    if (user && user.password === password) {
        return user;
    }
    throw new Error('Usuário ou senha inválidos!');
};

export const getUsers = async (): Promise<User[]> => {
    await delay(300);
    return [...users];
};

export const createUser = async (newUserData: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = { ...newUserData, id: nextUserId++ };
    // Optimistic UI update
    users.push(newUser);
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'create_user', payload: newUser });
    return newUser;
};

export const updateUser = async (userId: number, updateData: Partial<Pick<User, 'name' | 'password' | 'sector' | 'role'>>): Promise<User> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('Usuário não encontrado.');
    if (updateData.password === '') delete updateData.password;
    
    // Optimistic UI update
    users[userIndex] = { ...users[userIndex], ...updateData };
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'update_user', payload: { userId, updateData } });
    return users[userIndex];
};


export const deleteUser = async (userId: number): Promise<void> => {
    const initialLength = users.length;
    // Optimistic UI update
    users = users.filter(u => u.id !== userId);
    if (users.length === initialLength) throw new Error('Usuário não encontrado.');
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'delete_user', payload: { userId } });
};

export const deleteRequest = async (requestId: string, userId: number): Promise<void> => {
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Pedido não encontrado.');
    const request = requests[requestIndex];
    if (request.requester.id !== userId) throw new Error('Você não tem permissão para excluir este pedido.');
    if (request.status) throw new Error('Apenas pedidos novos (sem status) podem ser excluídos.');
    
    // Optimistic UI update
    requests.splice(requestIndex, 1);
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'delete_request', payload: { requestId, userId } });
};

export const getRequests = async (): Promise<MaintenanceRequest[]> => {
    await delay(500);
    return deepCopyRequests(requests);
};

export const getRequestById = async (id: string): Promise<MaintenanceRequest> => {
    await delay(300);
    const request = requests.find(r => r.id === id);
    if (!request) {
        throw new Error("Pedido não encontrado");
    }
    return deepCopyRequest(request);
};

export const createRequest = async (newRequestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest> => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const datePrefix = `${day}${month}${year}`;
    const todayRequests = requests.filter(r => r.id.startsWith(`OS-${datePrefix}-`));
    const nextSequence = todayRequests.length + 1;
    const newId = `OS-${datePrefix}-${String(nextSequence).padStart(3, '0')}`;

    const newRequest: MaintenanceRequest = {
        ...newRequestData,
        id: newId,
        createdAt: today,
        updatedAt: today,
    };

    // Optimistic UI update
    requests.unshift(newRequest);
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'create_request', payload: newRequest });
    return newRequest;
};

export const updateRequest = async (
  requestId: string,
  updateData: Partial<Omit<MaintenanceRequest, 'id' | 'createdAt' | 'requester'>>,
  userId: number
): Promise<MaintenanceRequest> => {
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) throw new Error('Pedido não encontrado.');
  const originalRequest = requests[requestIndex];
  const isEditableStatus = !originalRequest.status || originalRequest.status === RequestStatus.PENDING_APPROVAL || originalRequest.status === RequestStatus.IN_PROGRESS;
  if (!isEditableStatus) throw new Error('Pedidos com status final ou pendente de aprovação não podem ser editados diretamente.');
  if (originalRequest.status !== RequestStatus.IN_PROGRESS) {
      if (!originalRequest.isPreventive && originalRequest.requester.id !== userId) {
          throw new Error('Você não tem permissão para editar este pedido.');
      }
  }

  const updatedRequest: MaintenanceRequest = {
    ...originalRequest,
    ...updateData,
    updatedAt: new Date(),
  };

  // Optimistic UI update
  requests[requestIndex] = updatedRequest;
  persistState();
  // Add to sync queue
  addToSyncQueue({ type: 'update_request', payload: { requestId, updateData, userId } });
  return updatedRequest;
};


export const updateRequestStatus = async (
    id: string, 
    status: RequestStatus, 
    details: { 
        reason?: string; 
        assigneeName?: string; 
        completerName?: string 
    }
): Promise<MaintenanceRequest> => {
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) throw new Error("Pedido não encontrado");
    
    const updatedRequest = { ...requests[requestIndex], status, updatedAt: new Date() };
    if (status === RequestStatus.IN_PROGRESS && !updatedRequest.startedAt) {
        updatedRequest.startedAt = new Date();
        updatedRequest.assignedTo = details.assigneeName;
    }
    if (status === RequestStatus.COMPLETED) {
        updatedRequest.completedAt = new Date();
        updatedRequest.maintenanceNotes = details.reason;
        updatedRequest.completedBy = details.completerName;
    }
    if (status === RequestStatus.CANCELED) {
        updatedRequest.cancelReason = details.reason;
    }

    // Optimistic UI update
    requests[requestIndex] = updatedRequest;
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'update_status', payload: { id, status, details } });
    return updatedRequest;
};

export const approvePreventiveRequest = async (requestId: string, approverName: string, approverUser: User): Promise<MaintenanceRequest> => {
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Pedido não encontrado");
    const originalRequest = requests[requestIndex];
    if (!originalRequest.isPreventive || originalRequest.status !== RequestStatus.PENDING_APPROVAL) {
        throw new Error("Este pedido não é uma preventiva pendente de aprovação.");
    }
    const updatedRequest: MaintenanceRequest = {
        ...originalRequest,
        requester: { ...approverUser, name: approverName }, 
        status: undefined, 
        isPreventive: false, 
        updatedAt: new Date(),
        approvedBy: approverName,
    };
    // Optimistic UI update
    requests[requestIndex] = updatedRequest;
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'approve_preventive', payload: { requestId, approverName, approverUser } });
    return updatedRequest;
};

export const submitCompletionForApproval = async (
    requestId: string,
    updateData: {
        requestedCompletedAt: Date;
        completionChangeReason: string;
        maintenanceNotes: string;
        completedBy: string;
        checklists: { type: MaintenanceType; items: { item: string; checked: boolean }[] }[];
    }
): Promise<MaintenanceRequest> => {
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Pedido não encontrado.');
    const originalRequest = requests[requestIndex];
    const updatedRequest: MaintenanceRequest = {
        ...originalRequest,
        ...updateData,
        status: RequestStatus.PENDING_COMPLETION_APPROVAL,
        updatedAt: new Date(),
    };
    // Optimistic UI update
    requests[requestIndex] = updatedRequest;
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'submit_completion', payload: { requestId, updateData } });
    return updatedRequest;
};

export const resolveCompletionApproval = async (
    requestId: string,
    isApproved: boolean
): Promise<MaintenanceRequest> => {
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Pedido não encontrado.');
    const originalRequest = requests[requestIndex];
    if (originalRequest.status !== RequestStatus.PENDING_COMPLETION_APPROVAL) {
        throw new Error('Este pedido não está aguardando aprovação de conclusão.');
    }
    let updatedRequest: MaintenanceRequest;
    if (isApproved) {
        updatedRequest = {
            ...originalRequest,
            status: RequestStatus.COMPLETED,
            completedAt: originalRequest.requestedCompletedAt,
            requestedCompletedAt: undefined,
            completionChangeReason: undefined,
            updatedAt: new Date(),
        };
    } else {
        updatedRequest = {
            ...originalRequest,
            status: RequestStatus.IN_PROGRESS,
            requestedCompletedAt: undefined,
            completionChangeReason: undefined,
            maintenanceNotes: originalRequest.maintenanceNotes + `\n\n[SISTEMA] Alteração de data de conclusão rejeitada em ${new Date().toLocaleString()}.`,
            updatedAt: new Date(),
        };
    }
    // Optimistic UI update
    requests[requestIndex] = updatedRequest;
    persistState();
    // Add to sync queue
    addToSyncQueue({ type: 'resolve_completion', payload: { requestId, isApproved } });
    return updatedRequest;
};
