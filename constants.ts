import { User, MaintenanceRequest, UserRole, RequestStatus, MaintenanceType, EquipmentStatus } from './types';
import { ShieldCheckIcon, BriefcaseIcon, WrenchIcon, UserIcon, CogIcon } from '../components/icons';
import React from 'react';


export const SECTORS: string[] = ['Prensa', 'Rosca', 'Forno', 'Fresa/Fenda', 'Outro'];

export const ROLE_ICONS: Record<UserRole, React.FC<React.SVGProps<SVGSVGElement>>> = {
  [UserRole.ADMIN]: ShieldCheckIcon,
  [UserRole.MANAGER]: BriefcaseIcon,
  [UserRole.MAINTENANCE]: WrenchIcon,
  [UserRole.REQUESTER]: UserIcon,
  [UserRole.SYSTEM]: CogIcon,
};

// Low priority colors
export const STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING_APPROVAL]: 'bg-purple-100 text-purple-800',
  [RequestStatus.IN_PROGRESS]: 'text-brand-blue',
  [RequestStatus.PENDING_COMPLETION_APPROVAL]: 'bg-orange-100 text-orange-800',
  [RequestStatus.COMPLETED]: 'bg-ticket-completed text-white',
  [RequestStatus.CANCELED]: 'bg-status-canceled text-white'
};

// High priority colors for badges
export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OPERATIONAL]: 'bg-machine-ok text-white',
  [EquipmentStatus.PARTIAL]: 'bg-machine-partial text-black',
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

export const PREVENTIVE_CHECKLISTS: Record<MaintenanceType, string[]> = {
    [MaintenanceType.ELECTRICAL]: [
        "SENSORES",
        "FIOS DESENCAPADOS",
        "FIOS RESSECADOS",
        "LUZES DO PAINEL",
        "FUNCIONAMENTO DO PAINEL",
    ],
    [MaintenanceType.MECHANICAL]: [
        "ROLAMENTOS",
        "DESGASTE NO CAME",
        "FOLGA DE BUCHAS",
        "FOLGA DAS RÉGUAS",
        "FOLGA NOS ROLETES",
    ],
    [MaintenanceType.PNEUMATIC]: [
        "MANGUEIRAS",
        "VÁLVULAS",
        "VAZAMENTO DE AR",
    ],
    [MaintenanceType.LUBRICATION]: [
        "TROCA DE ÓLEO",
        "ÓLEO COMPLETADO",
        "VERIFICADO DUTOS",
        "VERIFICADO VAZAMENTOS",
    ],
    [MaintenanceType.BELT]: [
        "TROCA",
        "EXCESSO DE ÓLEO",
        "SOLTANDO PÓ",
        "DESGASTE",
    ],
    [MaintenanceType.GUARDS_AND_PROTECTIONS]: [
        "CONDIÇÕES GERAIS DAS CARENAGENS E PROTEÇÕES DA MÁQUINA",
        "CANALETAS",
    ],
};

export const SYSTEM_USER: User = { id: 0, name: 'Sistema', role: UserRole.SYSTEM, sector: 'Sistema' };

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
      failureTime: new Date(2023, 10, 1, 8, 15),
      createdAt: new Date(2023, 10, 1, 8, 30),
      updatedAt: new Date(2023, 10, 1, 14, 0),
      assignedTo: 'Bruno Costa',
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
      failureTime: new Date(2023, 10, 2, 9, 50),
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
      maintenanceType: MaintenanceType.ELECTRICAL,
      failureTime: new Date(2023, 9, 28, 13, 30),
      createdAt: new Date(2023, 9, 28, 14, 0),
      updatedAt: new Date(2023, 9, 29, 11, 0),
      assignedTo: 'Bruno Costa',
      completedBy: 'Bruno Costa',
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
      failureTime: new Date(2023, 10, 4, 10, 55),
      createdAt: new Date(2023, 10, 4, 11, 0),
      updatedAt: new Date(2023, 10, 4, 11, 30),
      assignedTo: 'Bruno Costa',
      cancelReason: 'Pedido duplicado. Já existe a OS MAN-006 para o mesmo problema.',
      attachments: [],
    },
    // Adicionando mais um evento para a Prensa PH-02 para calcular MTBF
    {
      id: 'MAN-004',
      description: 'Prensa PH-02 parou novamente, mesmo problema de vazamento.',
      status: RequestStatus.COMPLETED,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: USERS[1],
      requesterSector: 'Prensa',
      equipment: ['Prensa PH-02'],
      maintenanceType: MaintenanceType.MECHANICAL,
      failureTime: new Date(2023, 9, 20, 10, 0),
      createdAt: new Date(2023, 9, 20, 10, 5),
      updatedAt: new Date(2023, 9, 20, 15, 0),
      assignedTo: 'Bruno Costa',
      completedBy: 'Carlos Pereira',
      startedAt: new Date(2023, 9, 20, 11, 0),
      completedAt: new Date(2023, 9, 20, 15, 0),
      maintenanceNotes: 'Reparo no selo do cilindro.',
      attachments: [],
    },
    // PREVENTIVAS DE EXEMPLO PARA CADA TIPO
    {
      id: 'MAN-006',
      description: 'Manutenção Preventiva Elétrica Programada para Rosqueadeira R-08.',
      status: RequestStatus.PENDING_APPROVAL,
      isPreventive: true,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: SYSTEM_USER,
      requesterSector: 'Rosca',
      equipment: ['Rosqueadeira R-08'],
      maintenanceType: MaintenanceType.ELECTRICAL,
      failureTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      checklist: PREVENTIVE_CHECKLISTS[MaintenanceType.ELECTRICAL].map(item => ({ item, checked: false })),
    },
    {
      id: 'MAN-007',
      description: 'Manutenção Preventiva Mecânica Programada para Prensa PH-05.',
      status: RequestStatus.PENDING_APPROVAL,
      isPreventive: true,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: SYSTEM_USER,
      requesterSector: 'Prensa',
      equipment: ['Prensa PH-05'],
      maintenanceType: MaintenanceType.MECHANICAL,
      failureTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      checklist: PREVENTIVE_CHECKLISTS[MaintenanceType.MECHANICAL].map(item => ({ item, checked: false })),
    },
    {
      id: 'MAN-008',
      description: 'Manutenção Preventiva Pneumática Programada para Forno F-03.',
      status: RequestStatus.PENDING_APPROVAL,
      isPreventive: true,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: SYSTEM_USER,
      requesterSector: 'Forno',
      equipment: ['Forno F-03'],
      maintenanceType: MaintenanceType.PNEUMATIC,
      failureTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      checklist: PREVENTIVE_CHECKLISTS[MaintenanceType.PNEUMATIC].map(item => ({ item, checked: false })),
    },
    {
      id: 'MAN-009',
      description: 'Manutenção Preventiva de Lubrificação Programada para Fresa FR-12.',
      status: RequestStatus.PENDING_APPROVAL,
      isPreventive: true,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: SYSTEM_USER,
      requesterSector: 'Fresa/Fenda',
      equipment: ['Fresa FR-12'],
      maintenanceType: MaintenanceType.LUBRICATION,
      failureTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      checklist: PREVENTIVE_CHECKLISTS[MaintenanceType.LUBRICATION].map(item => ({ item, checked: false })),
    },
    {
      id: 'MAN-010',
      description: 'Inspeção Preventiva de Correias na Esteira de Saída ES-01.',
      status: RequestStatus.PENDING_APPROVAL,
      isPreventive: true,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: SYSTEM_USER,
      requesterSector: 'Outro',
      equipment: ['Esteira de Saída ES-01'],
      maintenanceType: MaintenanceType.BELT,
      failureTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      checklist: PREVENTIVE_CHECKLISTS[MaintenanceType.BELT].map(item => ({ item, checked: false })),
    },
    {
      id: 'MAN-011',
      description: 'Verificação Preventiva de Carenagens e Proteções da Célula de Solda CS-02.',
      status: RequestStatus.PENDING_APPROVAL,
      isPreventive: true,
      equipmentStatus: EquipmentStatus.OPERATIONAL,
      requester: SYSTEM_USER,
      requesterSector: 'Outro',
      equipment: ['Célula de Solda CS-02'],
      maintenanceType: MaintenanceType.GUARDS_AND_PROTECTIONS,
// FIX: Corrected typo from `failureNo` to `failureTime` to match the MaintenanceRequest interface.
      failureTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      checklist: PREVENTIVE_CHECKLISTS[MaintenanceType.GUARDS_AND_PROTECTIONS].map(item => ({ item, checked: false })),
    }
];