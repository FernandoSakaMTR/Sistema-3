import { User, MaintenanceRequest, UserRole, RequestStatus, MaintenanceType, EquipmentStatus } from './types';
import { ShieldCheckIcon, BriefcaseIcon, WrenchIcon, UserIcon } from '../components/icons';
import React from 'react';


export const SECTORS: string[] = ['Rosqueadeira', 'Prensa', 'Expedição', 'Outro'];

export const ROLE_ICONS: Record<UserRole, React.FC<React.SVGProps<SVGSVGElement>>> = {
  [UserRole.ADMIN]: ShieldCheckIcon,
  [UserRole.MANAGER]: BriefcaseIcon,
  [UserRole.MAINTENANCE]: WrenchIcon,
  [UserRole.REQUESTER]: UserIcon,
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.OPEN]: 'bg-indigo-200 text-indigo-800',
  [RequestStatus.VIEWED]: 'bg-indigo-200 text-indigo-800',
  [RequestStatus.ACCEPTED]: 'bg-indigo-200 text-indigo-800',
  [RequestStatus.IN_PROGRESS]: 'bg-blue-200 text-blue-800',
  [RequestStatus.PAUSED]: 'bg-yellow-200 text-yellow-800',
  [RequestStatus.COMPLETED]: 'bg-teal-200 text-teal-800',
  [RequestStatus.CANCELED]: 'bg-slate-500 text-white'
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OPERATIONAL]: 'bg-green-200 text-green-800',
  [EquipmentStatus.PARTIAL]: 'bg-orange-200 text-orange-800',
  [EquipmentStatus.INOPERATIVE]: 'bg-red-500 text-white'
};

export let USERS: User[] = [
    { id: 1, name: 'Admin Geral', role: UserRole.ADMIN, sector: 'T.I.', password: 'senha123' },
    { id: 2, name: 'Ana Silva', role: UserRole.REQUESTER, sector: 'Prensa', password: 'senha123' },
    { id: 3, name: 'Bruno Costa', role: UserRole.MAINTENANCE, sector: 'Manutenção', password: 'senha123' },
    { id: 4, name: 'Carlos Pereira', role: UserRole.MANAGER, sector: 'Gerência', password: 'senha123' },
    { id: 5, name: 'Daniela Martins', role: UserRole.REQUESTER, sector: 'Expedição', password: 'senha123' },
];

export let MOCK_REQUESTS: MaintenanceRequest[] = [
    {
      id: 'MAN-001',
      title: 'Prensa Hidráulica com vazamento',
      description: 'A prensa PH-02 está com um vazamento de óleo na base do cilindro principal. Necessita de verificação urgente pois está parando a produção.',
      status: RequestStatus.IN_PROGRESS,
      equipmentStatus: EquipmentStatus.INOPERATIVE,
      requester: USERS[1],
      requesterSector: 'Prensa',
      equipment: ['Prensa PH-02'],
      maintenanceType: MaintenanceType.MECHANICAL,
      createdAt: new Date(2023, 10, 1, 8, 30),
      updatedAt: new Date(2023, 10, 1, 14, 0),
      assignedTo: USERS[2],
      startedAt: new Date(2023, 10, 1, 13, 45),
      attachments: [],
    },
    {
      id: 'MAN-002',
      title: 'Painel elétrico da Rosqueadeira R-05 desligando',
      description: 'O painel da Rosqueadeira R-05 está desarmando o disjuntor principal intermitentemente.',
      status: RequestStatus.OPEN,
      equipmentStatus: EquipmentStatus.PARTIAL,
      requester: USERS[4],
      requesterSector: 'Expedição',
      equipment: ['Rosqueadeira R-05'],
      maintenanceType: MaintenanceType.ELECTRICAL,
      createdAt: new Date(2023, 10, 2, 10, 0),
      updatedAt: new Date(2023, 10, 2, 10, 0),
      attachments: [],
    },
    {
      id: 'MAN-003',
      title: 'Computador da expedição não liga',
      description: 'O computador da bancada de expedição não está ligando. Já foi testado em outra tomada.',
      status: RequestStatus.COMPLETED,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: USERS[4],
      requesterSector: 'Expedição',
      equipment: ['PC-EXP-01'],
      maintenanceType: MaintenanceType.OTHER,
      createdAt: new Date(2023, 9, 28, 14, 0),
      updatedAt: new Date(2023, 9, 29, 11, 0),
      assignedTo: USERS[2],
      startedAt: new Date(2023, 9, 29, 9, 5),
      completedAt: new Date(2023, 9, 29, 11, 0),
      maintenanceNotes: 'Fonte do computador queimada. Realizada a troca da fonte e testes de inicialização. Sistema operacional funcionando normalmente.',
      attachments: [],
    },
    {
        id: 'MAN-004',
        title: 'Esteira transportadora com ruído',
        description: 'A esteira da linha 2 está com um ruído estranho no motor.',
        status: RequestStatus.PAUSED,
        equipmentStatus: EquipmentStatus.PARTIAL,
        requester: USERS[1],
        requesterSector: 'Prensa',
        equipment: ['Esteira-02'],
        maintenanceType: MaintenanceType.MECHANICAL,
        createdAt: new Date(2023, 10, 3, 9, 0),
        updatedAt: new Date(2023, 10, 3, 15, 30),
        assignedTo: USERS[2],
        startedAt: new Date(2023, 10, 3, 14, 0),
        pauseReason: 'Aguardando peça (rolamento XYZ) chegar do almoxarifado.',
        attachments: [],
    },
    {
      id: 'MAN-005',
      title: 'Lâmpada queimada no setor de Prensas',
      description: 'Uma das lâmpadas do galpão das prensas está queimada.',
      status: RequestStatus.CANCELED,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: USERS[1],
      requesterSector: 'Prensa',
      equipment: ['Iluminação Galpão Prensas'],
      maintenanceType: MaintenanceType.ELECTRICAL,
      createdAt: new Date(2023, 10, 4, 11, 0),
      updatedAt: new Date(2023, 10, 4, 11, 30),
      assignedTo: USERS[2],
      cancelReason: 'Requisição duplicada. Já existe a OS MAN-006 para o mesmo problema.',
      attachments: [],
    },
];