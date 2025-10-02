import type { User, MaintenanceRequest } from './types';
import { UserRole, RequestStatus, MaintenanceType, EquipmentStatus } from './types';

export let USERS: User[] = [
  { id: 1, name: 'Ana Silva', role: UserRole.REQUESTER, sector: 'Prensa', password: 'senha123' },
  { id: 2, name: 'Bruno Costa', role: UserRole.MAINTENANCE, sector: 'Manutenção Elétrica', password: 'senha123' },
  { id: 3, name: 'Carlos Dias', role: UserRole.MANAGER, sector: 'Gerência', password: 'senha123' },
  { id: 4, name: 'Daniela Souza', role: UserRole.ADMIN, sector: 'T.I.', password: 'senha123' },
  { id: 5, name: 'Eduardo Lima', role: UserRole.MAINTENANCE, sector: 'Manutenção Mecânica', password: 'senha123' }
];

export const SECTORS: string[] = ['Rosqueadeira', 'Prensa', 'Expedição', 'Outro'];

export const STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.OPEN]: 'bg-slate-300 text-slate-800',
  [RequestStatus.VIEWED]: 'bg-slate-300 text-slate-800',
  [RequestStatus.ACCEPTED]: 'bg-slate-300 text-slate-800',
  [RequestStatus.IN_PROGRESS]: 'bg-slate-500 text-white',
  [RequestStatus.PAUSED]: 'bg-slate-300 text-slate-800',
  [RequestStatus.COMPLETED]: 'bg-slate-700 text-white',
  [RequestStatus.CANCELED]: 'bg-slate-700 text-white'
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OPERATIONAL]: 'bg-green-200 text-green-800',
  [EquipmentStatus.PARTIAL]: 'bg-orange-200 text-orange-800',
  [EquipmentStatus.INOPERATIVE]: 'bg-red-500 text-white'
};

export const MOCK_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'MAN-001',
    title: 'Prensa hidráulica com vazamento',
    description: 'A prensa hidráulica principal está com um vazamento de óleo contínuo na base. Necessita de verificação e reparo urgente para evitar paradas na produção.',
    status: RequestStatus.OPEN,
    equipmentStatus: EquipmentStatus.INOPERATIVE,
    requester: USERS[0],
    requesterSector: 'Prensa',
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
    equipmentStatus: EquipmentStatus.PARTIAL,
    requester: USERS[0],
    requesterSector: 'Rosqueadeira',
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
    equipmentStatus: EquipmentStatus.OPERATIONAL,
    requester: USERS[0],
    requesterSector: 'Logística',
    equipment: ['Portão Armazém 2'],
    maintenanceType: MaintenanceType.OTHER,
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
    equipmentStatus: EquipmentStatus.OPERATIONAL,
    requester: USERS[3],
    requesterSector: 'T.I.',
    equipment: ['Sala de Controle'],
    maintenanceType: MaintenanceType.OTHER,
    createdAt: new Date('2024-07-18T17:00:00'),
    updatedAt: new Date('2024-07-21T11:00:00'),
    assignedTo: USERS[3],
    startedAt: new Date('2024-07-21T09:00:00'),
    pauseReason: 'Aguardando chegada do cabo de rede.',
    attachments: [],
  },
];