
import type { User, MaintenanceRequest } from './types';
import { UserRole, RequestStatus, MaintenanceType, Priority } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Ana Silva', role: UserRole.REQUESTER, sector: 'Produção' },
  { id: 2, name: 'Bruno Costa', role: UserRole.MAINTENANCE, sector: 'Manutenção Elétrica' },
  { id: 3, name: 'Carlos Dias', role: UserRole.MANAGER, sector: 'Gerência' },
  { id: 4, name: 'Daniela Souza', role: UserRole.ADMIN, sector: 'T.I.' },
  { id: 5, name: 'Eduardo Lima', role: UserRole.MAINTENANCE, sector: 'Manutenção Mecânica' }
];

export const STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.OPEN]: 'bg-status-open text-white',
  [RequestStatus.VIEWED]: 'bg-blue-200 text-blue-800',
  [RequestStatus.ACCEPTED]: 'bg-indigo-200 text-indigo-800',
  [RequestStatus.IN_PROGRESS]: 'bg-status-progress text-white',
  [RequestStatus.PAUSED]: 'bg-status-paused text-white',
  [RequestStatus.COMPLETED]: 'bg-status-completed text-white',
  [RequestStatus.CANCELED]: 'bg-status-canceled text-white'
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-500 text-white',
  [Priority.MEDIUM]: 'bg-yellow-500 text-white',
  [Priority.HIGH]: 'bg-orange-500 text-white',
  [Priority.URGENT]: 'bg-red-600 text-white'
};

export const MOCK_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'MAN-001',
    title: 'Prensa hidráulica com vazamento',
    description: 'A prensa hidráulica principal está com um vazamento de óleo contínuo na base. Necessita de verificação e reparo urgente para evitar paradas na produção.',
    status: RequestStatus.OPEN,
    priority: Priority.URGENT,
    requester: USERS[0],
    requesterSector: 'Produção A',
    equipment: ['Prensa Hidráulica PH-01'],
    maintenanceType: MaintenanceType.MECHANICAL,
    createdAt: new Date('2024-07-20T09:00:00'),
    updatedAt: new Date('2024-07-20T09:00:00'),
    attachments: [],
  },
  {
    id: 'MAN-002',
    title: 'Luz do painel da esteira E-03 queimada',
    description: 'A luz indicadora de funcionamento do painel de controle da esteira E-03 está queimada, dificultando a operação.',
    status: RequestStatus.IN_PROGRESS,
    priority: Priority.MEDIUM,
    requester: USERS[0],
    requesterSector: 'Produção B',
    equipment: ['Esteira E-03'],
    maintenanceType: MaintenanceType.ELECTRICAL,
    createdAt: new Date('2024-07-19T14:30:00'),
    updatedAt: new Date('2024-07-20T10:15:00'),
    assignedTo: USERS[1],
    startedAt: new Date('2024-07-20T10:15:00'),
    attachments: [],
  },
  {
    id: 'MAN-003',
    title: 'Reparo na estrutura do portão do armazém',
    description: 'O portão do armazém 2 sofreu uma avaria por uma empilhadeira e não está fechando corretamente.',
    status: RequestStatus.COMPLETED,
    priority: Priority.HIGH,
    requester: USERS[0],
    requesterSector: 'Logística',
    equipment: ['Portão Armazém 2'],
    maintenanceType: MaintenanceType.CIVIL,
    createdAt: new Date('2024-07-15T11:00:00'),
    updatedAt: new Date('2024-07-18T16:00:00'),
    assignedTo: USERS[4],
    startedAt: new Date('2024-07-16T08:00:00'),
    completedAt: new Date('2024-07-18T16:00:00'),
    maintenanceNotes: 'Estrutura foi realinhada e soldada. Trilhos foram lubrificados. Portão funcionando normalmente.',
    materialsUsed: ['Eletrodo de solda', 'Graxa'],
    attachments: [],
  },
  {
    id: 'MAN-004',
    title: 'Instalação de novo ponto de rede',
    description: 'Necessário instalar um novo ponto de rede na sala de controle para o novo computador de monitoramento.',
    status: RequestStatus.PAUSED,
    priority: Priority.LOW,
    requester: USERS[3],
    requesterSector: 'T.I.',
    equipment: ['Sala de Controle'],
    maintenanceType: MaintenanceType.IT,
    createdAt: new Date('2024-07-18T17:00:00'),
    updatedAt: new Date('2024-07-21T11:00:00'),
    assignedTo: USERS[3],
    startedAt: new Date('2024-07-21T09:00:00'),
    pauseReason: 'Aguardando chegada do cabo de rede.',
    attachments: [],
  },
];
