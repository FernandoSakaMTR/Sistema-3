import type { MaintenanceRequest, User } from '../types';
import { RequestStatus } from '../types';

// IMPORTANTE: Substitua este IP pelo endereço real do seu servidor backend.
const API_BASE_URL = 'http://192.168.0.100:3000/api'; // Exemplo

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Ocorreu um erro na comunicação com o servidor.');
    }
    return response.json();
};

export const login = (userId: number, password?: string): Promise<User> => {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ userId, password }),
    });
};

export const getUsers = (): Promise<User[]> => {
    return apiFetch('/users');
};

export const createUser = (newUserData: Omit<User, 'id'>): Promise<User> => {
    return apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
    });
};

export const updateUser = (userId: number, updateData: Partial<Pick<User, 'name' | 'password' | 'sector'>>): Promise<User> => {
    return apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });
};

export const deleteUser = (userId: number): Promise<void> => {
    return apiFetch(`/users/${userId}`, {
        method: 'DELETE',
    });
};

export const getRequests = (): Promise<MaintenanceRequest[]> => {
    return apiFetch('/requests').then(requests => 
        // A conversão de datas deve ser feita no frontend
        requests.map((req: any) => ({
            ...req,
            createdAt: new Date(req.createdAt),
            updatedAt: new Date(req.updatedAt),
            startedAt: req.startedAt ? new Date(req.startedAt) : undefined,
            completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
        }))
    );
};

export const getRequestById = (id: string): Promise<MaintenanceRequest> => {
     return apiFetch(`/requests/${id}`).then((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        updatedAt: new Date(req.updatedAt),
        startedAt: req.startedAt ? new Date(req.startedAt) : undefined,
        completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
    }));
};

export const createRequest = (newRequestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'attachments'> & { attachments?: any }): Promise<MaintenanceRequest> => {
    // Tratamento de anexos (File) precisa de `FormData` em vez de JSON.
    // Esta é uma simplificação. Um backend real exigiria um endpoint multipart/form-data.
    const { attachments, ...jsonData } = newRequestData;
    return apiFetch('/requests', {
        method: 'POST',
        body: JSON.stringify(jsonData),
    });
};

export const updateRequestStatus = (id: string, status: RequestStatus, user: User, reason?: string): Promise<MaintenanceRequest> => {
    return apiFetch(`/requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, userId: user.id, reason }),
    });
};
