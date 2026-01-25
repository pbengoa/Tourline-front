/**
 * Provider Types - Supports both individual guides and companies
 */

// Provider type: individual person or company
export type ProviderType = 'individual' | 'company';

// Provider verification status
export type ProviderStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended';

// Verification document types
export type DocumentType = 
  | 'national_id'           // Cédula/DNI
  | 'tax_id'                // RUT/RFC
  | 'business_license'      // Permiso de operación
  | 'insurance'             // Seguro de responsabilidad
  | 'guide_certification'   // Certificación de guía
  | 'other';

// Verification document
export interface VerificationDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// Guide profile (NOT a user, just a profile within a provider)
export interface GuideProfile {
  id: string;
  providerId: string;
  
  // Basic info
  name: string;
  photo?: string;
  bio?: string;
  
  // Skills
  languages: string[];
  specialties: string[];  // "hiking", "cultural", "wine", "photography"
  
  // Status
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Provider entity (the business/individual that offers tours)
export interface Provider {
  id: string;
  
  // Type
  type: ProviderType;
  
  // Basic info (common)
  name: string;                    // Display name (person name or company name)
  email: string;
  phone: string;
  description?: string;
  logo?: string;                   // Photo for individual, logo for company
  coverImage?: string;
  
  // Location
  city?: string;
  country?: string;
  address?: string;
  
  // Company-specific fields
  legalName?: string;              // Razón social
  taxId?: string;                  // RUT/RFC
  website?: string;
  
  // Individual-specific fields
  firstName?: string;
  lastName?: string;
  
  // Verification
  status: ProviderStatus;
  verificationDocs: VerificationDocument[];
  statusMessage?: string;          // Reason for rejection, etc.
  verifiedAt?: string;
  
  // Relations
  ownerId: string;                 // User ID who manages this provider
  guides: GuideProfile[];          // For companies: team. For individual: empty or self
  
  // Metrics (calculated)
  rating: number;
  reviewCount: number;
  tourCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============ REGISTRATION REQUESTS ============

// Base registration data
interface BaseProviderRegistration {
  email: string;
  password: string;
  phone: string;
  city: string;
  country: string;
  description?: string;
}

// Individual provider registration
export interface IndividualProviderRegistration extends BaseProviderRegistration {
  type: 'individual';
  firstName: string;
  lastName: string;
  photo?: string;
  languages?: string[];
  specialties?: string[];
}

// Company provider registration
export interface CompanyProviderRegistration extends BaseProviderRegistration {
  type: 'company';
  companyName: string;
  legalName?: string;
  taxId: string;
  address: string;
  website?: string;
  logo?: string;
}

// Union type for registration
export type ProviderRegistration = IndividualProviderRegistration | CompanyProviderRegistration;

// Registration response
export interface ProviderRegistrationResponse {
  user: {
    id: string;
    email: string;
    role: 'provider';
    emailVerified: boolean;
  };
  provider: Provider;
  token: string;
}

// ============ STATUS DISPLAY CONFIG ============

export const PROVIDER_STATUS_CONFIG: Record<ProviderStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}> = {
  pending: {
    label: 'Pendiente',
    color: '#D4A03A',
    bgColor: '#FDF6E3',
    icon: '⏳',
    description: 'Tu solicitud está en espera de revisión',
  },
  in_review: {
    label: 'En revisión',
    color: '#4A7FA8',
    bgColor: '#EBF4FA',
    icon: '🔍',
    description: 'Estamos verificando tu información',
  },
  approved: {
    label: 'Aprobado',
    color: '#3B8A5A',
    bgColor: '#E8F5EC',
    icon: '✅',
    description: 'Tu cuenta está activa y puedes crear tours',
  },
  rejected: {
    label: 'Rechazado',
    color: '#C75450',
    bgColor: '#FBEAEA',
    icon: '❌',
    description: 'Tu solicitud fue rechazada',
  },
  suspended: {
    label: 'Suspendido',
    color: '#C75450',
    bgColor: '#FBEAEA',
    icon: '⛔',
    description: 'Tu cuenta ha sido suspendida',
  },
};

// Document type labels
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  national_id: 'Cédula de identidad / DNI',
  tax_id: 'RUT / RFC de empresa',
  business_license: 'Permiso de operación turística',
  insurance: 'Seguro de responsabilidad civil',
  guide_certification: 'Certificación de guía',
  other: 'Otro documento',
};

// Required documents by provider type
export const REQUIRED_DOCUMENTS: Record<ProviderType, DocumentType[]> = {
  individual: ['national_id'],
  company: ['tax_id', 'business_license'],
};

// Optional but recommended documents
export const RECOMMENDED_DOCUMENTS: Record<ProviderType, DocumentType[]> = {
  individual: ['guide_certification'],
  company: ['insurance'],
};
