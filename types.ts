
export enum UserRole {
  REQUESTER = 'Solicitante',
  MAINTENANCE = 'Manutenção',
  MANAGER = 'Gestor',
  ADMIN = 'Admin'
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  sector: string;
  password?: string; // Adicionado para suportar senhas
}

export enum RequestStatus {
  IN_PROGRESS = 'Em atendimento',
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
  maintenanceType: MaintenanceType;
  createdAt: Date;
  deadline?: Date;
  updatedAt: Date;
  assignedTo?: User;
  startedAt?: Date;
  completedAt?: Date;
  maintenanceNotes?: string;
  materialsUsed?: string[];
  cancelReason?: string;
  attachments: File[];
}