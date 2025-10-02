
export enum UserRole {
  REQUESTER = 'Requisitante',
  MAINTENANCE = 'Manutenção',
  MANAGER = 'Gestor',
  ADMIN = 'Admin'
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  sector: string;
}

export enum RequestStatus {
  OPEN = 'Aberta',
  VIEWED = 'Visualizada',
  ACCEPTED = 'Aceita',
  IN_PROGRESS = 'Em atendimento',
  PAUSED = 'Parada',
  COMPLETED = 'Concluída',
  CANCELED = 'Cancelada'
}

export enum MaintenanceType {
  ELECTRICAL = 'Elétrica',
  MECHANICAL = 'Mecânica',
  CIVIL = 'Civil',
  IT = 'T.I.',
  OTHER = 'Outro'
}

export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  URGENT = 'Urgente'
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
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
  pauseReason?: string;
  cancelReason?: string;
  attachments: File[];
}
