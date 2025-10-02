
import { MOCK_REQUESTS, USERS } from '../constants';
import type { MaintenanceRequest, User } from '../types';
import { RequestStatus } from '../types';

export let requests: MaintenanceRequest[] = [...MOCK_REQUESTS];

export const __resetRequests = () => {
    requests = [...MOCK_REQUESTS];
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockLogin = async (userId: number): Promise<User | undefined> => {
  await delay(500);
  return USERS.find(u => u.id === userId);
};

export const getRequests = async (): Promise<MaintenanceRequest[]> => {
  await delay(500);
  return [...requests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getRequestById = async (id: string): Promise<MaintenanceRequest | undefined> => {
  await delay(300);
  return requests.find(r => r.id === id);
};

export const createRequest = async (newRequestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<MaintenanceRequest> => {
  await delay(700);
  const newIdNumber = Math.max(...requests.map(r => parseInt(r.id.split('-')[1], 10))) + 1;
  const newRequest: MaintenanceRequest = {
    ...newRequestData,
    id: `MAN-${String(newIdNumber).padStart(3, '0')}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: RequestStatus.OPEN,
  };
  requests.unshift(newRequest);
  return newRequest;
};

export const updateRequestStatus = async (id: string, status: RequestStatus, user: User, reason?: string): Promise<MaintenanceRequest> => {
    await delay(500);
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) throw new Error('Request not found');

    const updatedRequest = { ...requests[requestIndex], status, updatedAt: new Date() };

    if (status === RequestStatus.IN_PROGRESS) {
        updatedRequest.assignedTo = user;
        updatedRequest.startedAt = new Date();
    } else if (status === RequestStatus.COMPLETED) {
        updatedRequest.completedAt = new Date();
        updatedRequest.maintenanceNotes = reason; // Using reason for notes
    } else if (status === RequestStatus.PAUSED) {
        updatedRequest.pauseReason = reason;
    } else if (status === RequestStatus.CANCELED) {
        updatedRequest.cancelReason = reason;
    }
    
    requests[requestIndex] = updatedRequest;
    return updatedRequest;
};
