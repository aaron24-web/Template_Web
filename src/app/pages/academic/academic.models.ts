// src/app/pages/academic/academic.models.ts

/**
 * ============================================================================
 * MODELOS DE DATOS (Basados en el esquema SQL)
 * ============================================================================
 */

// Tabla: users
export interface User {
  id: string; // uuid
  email: string;
  full_name: string;
  role: 'admin' | 'advisor';
  availability?: any; // jsonb
  rating?: number;
  avatar?: string;
  created_at: string; // timestamp with time zone
}

// Tabla: clients
export interface Client {
  id: string; // uuid
  full_name: string;
  email: string;
  phone?: string;
  relationship?: 'mother' | 'father' | 'guardian' | 'tutor' | 'self';
  billing_info?: any; // jsonb
  created_at: string; // timestamp with time zone
}

// Tabla: students
export interface Student {
  id: string; // uuid
  client_id: string; // uuid
  full_name: string;
  birth_date?: string; // date
  grade?: string;
  medical_notes?: string;
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  avatar?: string;
  created_at: string; // timestamp with time zone

  // Campos anidados (para vistas de UI)
  client?: Partial<Client>;
}

// Tabla: subjects
export interface Subject {
  id: number; // integer
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  category?: string;
}

// Tabla: tutoring_requests
export interface TutoringRequest {
  id: string; // uuid
  client_id: string; // uuid
  student_id: string; // uuid
  need_description?: string;
  status: 'new' | 'review' | 'closed';
  created_at: string; // timestamp with time zone

  // Campos anidados (para vistas de UI)
  client?: Partial<Client>;
  student?: Partial<Student>;
}

// Tabla: enrollments
export interface Enrollment {
  id: string; // uuid
  request_id: string; // uuid
  student_id: string; // uuid
  status: 'draft' | 'pending-approval' | 'approved' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  start_date?: string; // date
  end_date?: string; // date
  created_by: string; // uuid
  created_at: string; // timestamp with time zone

  // Campos anidados (para vistas de UI)
  student?: Partial<Student>;
  request?: Partial<TutoringRequest>;
  created_by_user?: Partial<User>;
  subjects?: EnrollmentSubject[]; // De la tabla enrollment_subjects
}

// Tabla: enrollment_subjects
export interface EnrollmentSubject {
  id: string; // uuid
  enrollment_id: string; // uuid
  subject_id: number;
  advisor_id: string; // uuid
  pedagogical_plan?: PedagogicalPlan; // jsonb
  status: 'pending' | 'active' | 'completed';
  created_at: string; // timestamp with time zone

  // Campos anidados (para vistas de UI)
  subject?: Partial<Subject>;
  advisor?: Partial<User>;
}

// Tabla: advisor_specializations
export interface AdvisorSpecialization {
  user_id: string; // uuid
  subject_id: number;
}


/**
 * ============================================================================
 * MODELOS COMPLEJOS Y DE UI (Abstracciones para el Frontend)
 * ============================================================================
 */

// Modelo para representar a un asesor con su información relevante para la UI
export interface Advisor {
  id: string;
  name: string;
  email:string;
  rating?: number;
  availability?: any;
  specializations: string[];
}

// Estructura para el campo `pedagogical_plan` (jsonb)
export interface PedagogicalPlan {
  diagnosis: string;
  goals: string;
  methodology: string;
  resources?: string[];
  evaluation_criteria?: string;
}

// Modelo para la vista de tarjeta de una solicitud
export interface RequestCard {
  id: string;
  studentName: string;
  clientName: string;
  date: string;
  need: string;
  status: 'new' | 'review' | 'closed';
  // --- Relaciones para la lógica de negocio ---
  originalRequest: TutoringRequest;
}


/**
 * ============================================================================
 * TIPOS Y ENUMS
 * ============================================================================
 */

export type RequestStatus = TutoringRequest['status'];
export type EnrollmentStatus = Enrollment['status'];
export type RequestViewMode = 'kanban' | 'list';


/**
 * ============================================================================
 * CONFIGURACIONES DE UI (Helpers para la vista)
 * ============================================================================
 */

export interface StatusConfig {
  text: string;
  badge: 'info' | 'success' | 'warning' | 'danger' | 'basic' | 'primary';
  icon: string;
  color: string;
}

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  new: { text: 'Nueva', badge: 'info', icon: 'inbox-outline', color: '#0095ff' },
  review: { text: 'En Revisión', badge: 'warning', icon: 'eye-outline', color: '#ffaa00' },
  closed: { text: 'Cerrada', badge: 'success', icon: 'checkmark-circle-outline', color: '#00d68f' },
};

export const ENROLLMENT_STATUS_CONFIG: Record<EnrollmentStatus, StatusConfig> = {
  draft: { text: 'Borrador', badge: 'basic', icon: 'edit-outline', color: '#8f9bb3' },
  'pending-approval': { text: 'Pendiente', badge: 'warning', icon: 'clock-outline', color: '#ffaa00' },
  approved: { text: 'Aprobada', badge: 'info', icon: 'checkmark-outline', color: '#0095ff' },
  active: { text: 'Activa', badge: 'success', icon: 'play-circle-outline', color: '#00d68f' },
  'on-hold': { text: 'En Pausa', badge: 'warning', icon: 'pause-circle-outline', color: '#ffaa00' },
  completed: { text: 'Completada', badge: 'success', icon: 'checkmark-circle-2-outline', color: '#00d68f' },
  cancelled: { text: 'Cancelada', badge: 'danger', icon: 'close-circle-outline', color: '#ff3d71' },
};