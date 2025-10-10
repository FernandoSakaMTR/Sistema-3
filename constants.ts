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

// Low priority colors
export const STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.IN_PROGRESS]: 'text-brand-blue',
  [RequestStatus.COMPLETED]: 'bg-ticket-completed text-white',
  [RequestStatus.CANCELED]: 'bg-status-canceled text-white'
};

// High priority colors for badges
export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OPERATIONAL]: 'bg-machine-ok text-white',
  // FIX: Used correct enum `EquipmentStatus` instead of `RequestStatus`.
  [EquipmentStatus.PARTIAL]: 'bg-machine-partial text-black',
  // FIX: Used correct enum `EquipmentStatus` instead of `RequestStatus`.
  [EquipmentStatus.INOPERATIVE]: 'bg-machine-down text-white'
};

// Lighter high priority colors for form inputs/backgrounds
export const EQUIPMENT_STATUS_BG_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OPERATIONAL]: 'bg-machine-ok-light',
  [EquipmentStatus.PARTIAL]: 'bg-machine-partial-light',
  [EquipmentStatus.INOPERATIVE]: 'bg-machine-down-light'
};

export const EQUIPMENT_STATUS_TEXT_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OPERATIONAL]: 'text-machine-ok',
  [EquipmentStatus.PARTIAL]: 'text-machine-partial',
  [EquipmentStatus.INOPERATIVE]: 'text-machine-down'
};

export let USERS: User[] = [
    { id: 1, name: 'Admin Geral', role: UserRole.ADMIN, sector: 'T.I.', password: 'senha123' },
    { id: 2, name: 'Ana Silva', role: UserRole.REQUESTER, sector: 'Prensa', password: 'senha123' },
    { id: 3, name: 'Bruno Costa', role: UserRole.MAINTENANCE, sector: 'Manutenção', password: 'senha123' },
    { id: 4, name: 'Carlos Pereira', role: UserRole.MANAGER, sector: 'Gerência', password: 'senha123' },
    { id: 5, name: 'Daniela Martins', role: UserRole.REQUESTER, sector: 'Expedição', password: 'senha123' },
];

// Mock File objects for attachments demonstration
const file1 = new File(["Conteúdo simulado de uma imagem de vazamento"], "vazamento_ph02.jpg", { type: "image/jpeg" });
const file2 = new File(["Conteúdo simulado de um PDF com diagrama elétrico"], "diagrama_eletrico_R05.pdf", { type: "application/pdf" });


export let MOCK_REQUESTS: MaintenanceRequest[] = [
    {
      id: 'MAN-001',
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
      attachments: [file1],
    },
    {
      id: 'MAN-002',
      description: 'O painel da Rosqueadeira R-05 está desarmando o disjuntor principal intermitentemente.',
      equipmentStatus: EquipmentStatus.PARTIAL,
      requester: USERS[4],
      requesterSector: 'Expedição',
      equipment: ['Rosqueadeira R-05'],
      maintenanceType: MaintenanceType.ELECTRICAL,
      createdAt: new Date(2023, 10, 2, 10, 0),
      updatedAt: new Date(2023, 10, 2, 10, 0),
      attachments: [file2],
    },
    {
      id: 'MAN-003',
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
      id: 'MAN-005',
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
      cancelReason: 'Pedido duplicado. Já existe a OS MAN-006 para o mesmo problema.',
      attachments: [],
    },
];