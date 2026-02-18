// Core Types for Medly Mock Data

export type UserRole = 'admin' | 'gestor' | 'escalista' | 'medico';

export type UserStatus = 'ativo' | 'inativo' | 'pendente';

export type ScaleStatus = 'rascunho' | 'publicada' | 'em_andamento' | 'concluida' | 'cancelada';

export type CandidatureStatus = 'interessado' | 'aceito' | 'negado' | 'aguardando';

export type DocumentStatus = 'pendente' | 'aprovado' | 'rejeitado';

export type PaymentStatus = 'pendente' | 'pago' | 'atrasado';

export type Shift = 'manha' | 'tarde' | 'noite' | 'plantao_12h' | 'plantao_24h';

// Base interface with soft delete support
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// User Profile
export interface UserProfile extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  address?: Address;
  // Medical specific
  crm?: string;
  crmState?: string;
  crmValid?: boolean;
  specialties?: string[];
  // Management
  managerId?: string;
  subordinateIds?: string[];
  // Metrics
  averageRating?: number;
  completedScales?: number;
  cancellationRate?: number;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

// Permission System
export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  viewAll: boolean; // true = ver todos os dados, false = apenas dados relacionados ao usuário
}

export interface DashboardPermission {
  view: boolean;
  viewAll: boolean;
  cards: {
    totalUsers: boolean;
    activeScales: boolean;
    pendingPayments: boolean;
    occupancyRate: boolean;
  };
  charts: {
    usersByRole: boolean;
    scalesTrend: boolean;
    locationRatings: boolean;
  };
}

export interface ProfilePermissions {
  dashboard: DashboardPermission;
  users: Permission;
  scales: Permission;
  locations: Permission;
  payments: Permission;
  documents: Permission;
  reports: Permission;
  settings: Permission;
}

export interface RoleProfile extends BaseEntity {
  name: string;
  role: UserRole;
  description: string;
  permissions: ProfilePermissions;
}

// Location
export interface Location extends BaseEntity {
  name: string;
  type: 'upa' | 'ubs' | 'hospital' | 'clinica' | 'pronto_socorro' | 'outro';
  address: Address;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  email?: string;
  averageRating?: number;
}

// Specialty
export interface Specialty extends BaseEntity {
  name: string;
  description?: string;
  scaleTypeIds?: string[];
}

// Scale Type
export interface ScaleType extends BaseEntity {
  name: string;
  description?: string;
  defaultDurationHours: number;
  defaultShift: Shift;
}

// Scale
export interface Scale extends BaseEntity {
  locationId: string;
  scaleTypeId: string;
  specialtyId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  shift: Shift;
  status: ScaleStatus;
  // Rules
  cancellationDeadlineDays: number;
  transferDeadlineDays: number;
  // Payment
  paymentValue: number;
  paymentDate?: string;
  paymentStatus: PaymentStatus;
  // Patients
  minPatients?: number;
  maxPatients?: number;
  mealBreakMinutes?: number;
  // Documents
  requiredDocuments?: string[];
  // Assignment
  assignedDoctorId?: string;
  candidateIds?: string[];
  // Check-in/out
  checkIn?: CheckRecord;
  checkOut?: CheckRecord;
}

export interface CheckRecord {
  timestamp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  verified: boolean;
}

// Candidature
export interface Candidature extends BaseEntity {
  scaleId: string;
  doctorId: string;
  status: CandidatureStatus;
  appliedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  // Post-acceptance workflow
  workflowStep?: 1 | 2 | 3 | 4 | 5 | 6;
  /*
    1: Infos envio
    2: Aceite empresa
    3: Docs assinados
    4: Validação pendente
    5: Aprovado
    6: NF envio
  */
}

// Document
export interface Document extends BaseEntity {
  userId: string;
  name: string;
  category: 'identidade' | 'crm' | 'diploma' | 'comprovante' | 'contrato' | 'outro';
  fileUrl: string;
  expirationDate?: string;
  status: DocumentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// Rating
export interface Rating extends BaseEntity {
  scaleId: string;
  fromUserId: string;
  toUserId?: string;
  toLocationId?: string;
  type: 'doctor_to_location' | 'location_to_doctor';
  overallScore: number; // 1-5
  punctualityScore?: number;
  qualityScore?: number;
  professionalismScore?: number;
  comment?: string;
}

// Payment
export interface Payment extends BaseEntity {
  scaleId: string;
  doctorId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  proofUrl?: string;
  notes?: string;
  confirmedByDoctor?: boolean;
  confirmedAt?: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

// Notification
export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
}
