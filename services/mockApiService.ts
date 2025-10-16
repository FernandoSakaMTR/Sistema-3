import type { MaintenanceRequest, User } from '../types';
import { RequestStatus, UserRole } from '../types';
import { USERS as initialUsers, MOCK_REQUESTS as initialRequests } from '../constants';


const deepCopyRequest = (req: MaintenanceRequest): MaintenanceRequest => {
    const newReq = { ...req }; 
    newReq.requester = { ...req.requester };
    newReq.equipment = [...req.equipment];
    newReq.attachments = [...req.attachments]; 
    newReq.createdAt = new Date(req.createdAt);
    newReq.updatedAt = new Date(req.updatedAt);
    newReq.startedAt = req.startedAt ? new Date(req.startedAt) : undefined;
    newReq.completedAt = req.completedAt ? new Date(req.completedAt) : undefined;
    if (req.checklist) {
        newReq.checklist = req.checklist.map(item => ({ ...item }));
    }
    return newReq;
}

const deepCopyRequests = (reqs: MaintenanceRequest[]): MaintenanceRequest[] => {
    return reqs.map(deepCopyRequest);
};

// Encapsulando o estado para garantir que as modificações funcionem
let users: User[] = JSON.parse(JSON.stringify(initialUsers));
let requests: MaintenanceRequest[] = deepCopyRequests(initialRequests);
let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

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
    await delay(500);
    const newUser: User = { ...newUserData, id: nextUserId++ };
    users.push(newUser);
    return newUser;
};

export const updateUser = async (userId: number, updateData: Partial<Pick<User, 'name' | 'password' | 'sector' | 'role'>>): Promise<User> => {
    await delay(500);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error('Usuário não encontrado.');
    }
    // Only update password if a new one is provided and not empty
    if (updateData.password === '') {
        delete updateData.password;
    }
    users[userIndex] = { ...users[userIndex], ...updateData };
    return users[userIndex];
};


export const deleteUser = async (userId: number): Promise<void> => {
    await delay(500);
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    if (users.length === initialLength) {
        throw new Error('Usuário não encontrado.');
    }
};

export const deleteRequest = async (requestId: string, userId: number): Promise<void> => {
    await delay(500);
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
        throw new Error('Pedido não encontrado.');
    }
    const request = requests[requestIndex];
    if (request.requester.id !== userId) {
        throw new Error('Você não tem permissão para excluir este pedido.');
    }
    if (request.status) {
        throw new Error('Apenas pedidos novos (sem status) podem ser excluídos.');
    }
    requests.splice(requestIndex, 1);
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
    await delay(800);
    
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = today.getFullYear();
    const datePrefix = `${day}${month}${year}`;

    // Find requests with the same date prefix to determine the next sequential number
    const todayRequests = requests.filter(r => r.id.startsWith(`OS-${datePrefix}-`));
    const nextSequence = todayRequests.length + 1;

    const newId = `OS-${datePrefix}-${String(nextSequence).padStart(3, '0')}`;

    const newRequest: MaintenanceRequest = {
        ...newRequestData,
        id: newId,
        createdAt: today,
        updatedAt: today,
    };
    requests.unshift(newRequest);
    return newRequest;
};

export const updateRequest = async (
  requestId: string,
  updateData: Partial<Omit<MaintenanceRequest, 'id' | 'createdAt' | 'requester'>>,
  userId: number
): Promise<MaintenanceRequest> => {
  await delay(800);
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) {
    throw new Error('Pedido não encontrado.');
  }

  const originalRequest = requests[requestIndex];

  const isEditableStatus = !originalRequest.status || 
                           originalRequest.status === RequestStatus.PENDING_APPROVAL ||
                           originalRequest.status === RequestStatus.IN_PROGRESS;

  if (!isEditableStatus) {
      throw new Error('Pedidos com status final ou pendente de aprovação não podem ser editados diretamente.');
  }
  
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

  requests[requestIndex] = updatedRequest;
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
    await delay(600);
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
        throw new Error("Pedido não encontrado");
    }
    
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

    requests[requestIndex] = updatedRequest;
    return updatedRequest;
};

export const approvePreventiveRequest = async (requestId: string, approverName: string, approverUser: User): Promise<MaintenanceRequest> => {
    await delay(600);
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
        throw new Error("Pedido não encontrado");
    }
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
    requests[requestIndex] = updatedRequest;
    return updatedRequest;
};

export const submitCompletionForApproval = async (
    requestId: string,
    updateData: {
        requestedCompletedAt: Date;
        completionChangeReason: string;
        maintenanceNotes: string;
        completedBy: string;
        checklist: { item: string; checked: boolean }[];
    }
): Promise<MaintenanceRequest> => {
    await delay(800);
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Pedido não encontrado.');
    
    const originalRequest = requests[requestIndex];
    const updatedRequest: MaintenanceRequest = {
        ...originalRequest,
        ...updateData,
        status: RequestStatus.PENDING_COMPLETION_APPROVAL,
        updatedAt: new Date(),
    };
    requests[requestIndex] = updatedRequest;
    return updatedRequest;
};

export const resolveCompletionApproval = async (
    requestId: string,
    isApproved: boolean
): Promise<MaintenanceRequest> => {
    await delay(600);
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
        // Rejeitado: volta para "Em atendimento"
        updatedRequest = {
            ...originalRequest,
            status: RequestStatus.IN_PROGRESS,
            requestedCompletedAt: undefined,
            completionChangeReason: undefined,
            maintenanceNotes: originalRequest.maintenanceNotes + `\n\n[SISTEMA] Alteração de data de conclusão rejeitada em ${new Date().toLocaleString()}.`,
            updatedAt: new Date(),
        };
    }
    requests[requestIndex] = updatedRequest;
    return updatedRequest;
};