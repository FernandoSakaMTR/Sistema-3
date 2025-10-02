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
  password?: string; // Adicionado para suportar senhas
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
  OTHER = 'Outro'
}

export enum EquipmentStatus {
  OPERATIONAL = 'Funcionando',
  PARTIAL = 'Parcialmente funcionando',
  INOPERATIVE = 'INOPERANTE'
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
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
  pauseReason?: string;
  cancelReason?: string;
  attachments: File[];
}