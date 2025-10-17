// FIX: Removed self-import of `UserRole`.
export enum UserRole {
  REQUESTER = 'Solicitante',
  MAINTENANCE = 'Manutenção',
  MANAGER = 'Gestor',
  ADMIN = 'Admin',
  SYSTEM = 'Sistema'
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  sector: string;
  password?: string; // Adicionado para suportar senhas
}

export enum RequestStatus {
  PENDING_APPROVAL = 'Pendente de Aprovação',
  IN_PROGRESS = 'Em atendimento',
  PENDING_COMPLETION_APPROVAL = 'Aguardando Aprovação da Conclusão',
  COMPLETED = 'Concluída',
  CANCELED = 'Cancelada'
}

export enum MaintenanceType {
  MECHANICAL = 'Mecânica',
  ELECTRICAL = 'Elétrica',
  PNEUMATIC = 'Pneumática',
  LUBRICATION = 'Lubrificação',
  BELT = 'Correia',
  GUARDS_AND_PROTECTIONS = 'Carenagens e Proteção'
}

export enum EquipmentStatus {
  OPERATIONAL = 'Funcionando',
  PARTIAL = 'Parcialmente funcionando',
  INOPERATIVE = 'INOPERANTE'
}

export interface MaintenanceRequest {
  id: string;
  description: string;
  status?: RequestStatus;
  equipmentStatus: EquipmentStatus;
  requester: User;
  requesterSector: string;
  equipment: string[];
  maintenanceType: MaintenanceType[];
  failureTime: Date; // Data e hora exata da falha para cálculo de MTBF
  createdAt: Date;
  deadline?: Date;
  updatedAt: Date;
  assignedTo?: string; // Nome do responsável que iniciou
  completedBy?: string; // Nome de quem finalizou
  startedAt?: Date;
  completedAt?: Date;
  maintenanceNotes?: string;
  materialsUsed?: string[];
  cancelReason?: string;
  attachments: File[];
  isPreventive?: boolean;
  approvedBy?: string;
  checklists?: { type: MaintenanceType; items: { item: string; checked: boolean }[] }[];
  requestedCompletedAt?: Date;
  completionChangeReason?: string;
}