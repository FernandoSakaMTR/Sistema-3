import type { MaintenanceRequest, User } from '../types';
import { RequestStatus, UserRole } from '../types';
import { USERS as initialUsers, MOCK_REQUESTS as initialRequests } from '../constants';

// Encapsulando o estado para garantir que as modificações funcionem
let users: User[] = JSON.parse(JSON.stringify(initialUsers));
let requests: MaintenanceRequest[] = JSON.parse(JSON.stringify(initialRequests)).map((req: any) => ({
    ...req,
    createdAt: new Date(req.createdAt),
    updatedAt: new Date(req.updatedAt),
    startedAt: req.startedAt ? new Date(req.startedAt) : undefined,
    completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
}));
let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
let nextRequestId = requests.length > 0 ? Math.max(...requests.map(r => parseInt(r.id.split('-')[1]))) + 1 : 1;

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

export const getRequests = async (): Promise<MaintenanceRequest[]> => {
    await delay(500);
    // Retorna uma cópia para evitar mutações externas
    return JSON.parse(JSON.stringify(requests)).map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        updatedAt: new Date(req.updatedAt),
        startedAt: req.startedAt ? new Date(req.startedAt) : undefined,
        completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
    }));
};

export const getRequestById = async (id: string): Promise<MaintenanceRequest> => {
    await delay(300);
    const request = requests.find(r => r.id === id);
    if (!request) {
        throw new Error("Requisição não encontrada");
    }
    // Retorna uma cópia
    const reqCopy = JSON.parse(JSON.stringify(request));
    return {
        ...reqCopy,
        createdAt: new Date(reqCopy.createdAt),
        updatedAt: new Date(reqCopy.updatedAt),
        startedAt: reqCopy.startedAt ? new Date(reqCopy.startedAt) : undefined,
        completedAt: reqCopy.completedAt ? new Date(reqCopy.completedAt) : undefined,
    };
};

export const createRequest = async (newRequestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<MaintenanceRequest> => {
    await delay(800);
    const newRequest: MaintenanceRequest = {
        ...newRequestData,
        id: `MAN-${String(nextRequestId++).padStart(3, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: RequestStatus.OPEN
    };
    requests.unshift(newRequest);
    return newRequest;
};

export const updateRequestStatus = async (id: string, status: RequestStatus, user: User, reason?: string): Promise<MaintenanceRequest> => {
    await delay(600);
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
        throw new Error("Requisição não encontrada");
    }
    
    const updatedRequest = { ...requests[requestIndex], status, updatedAt: new Date() };

    if (status === RequestStatus.IN_PROGRESS && !updatedRequest.startedAt) {
        updatedRequest.startedAt = new Date();
        updatedRequest.assignedTo = user;
    }
    if (status === RequestStatus.PAUSED) {
        updatedRequest.pauseReason = reason;
    }
    if (status === RequestStatus.COMPLETED) {
        updatedRequest.completedAt = new Date();
        updatedRequest.maintenanceNotes = reason;
    }
    if (status === RequestStatus.CANCELED) {
        updatedRequest.cancelReason = reason;
    }

    requests[requestIndex] = updatedRequest;
    return updatedRequest;
};