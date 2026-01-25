# 📋 Especificación Backend - Sistema de Proveedores

> Documento para el equipo de backend con los endpoints y tablas requeridas para el sistema de proveedores (guías independientes y empresas).

---

## 📊 Resumen de Cambios

| Prioridad | Componente | Descripción |
|-----------|------------|-------------|
| 🔴 Alta | **Providers** | Nueva tabla y API para proveedores |
| 🔴 Alta | **Provider Registration** | Endpoint de registro diferenciado |
| 🔴 Alta | **Verification Documents** | Sistema de documentos para verificación |
| 🟡 Media | **Guide Profiles** | Perfiles de guías dentro de proveedores |
| 🟡 Media | **Verification Flow** | Estados y flujo de aprobación |

---

## 🗄️ NUEVAS TABLAS

### 1. `providers` - Proveedores (Empresas y Guías Independientes)

```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de proveedor
  type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'company')),
  
  -- Datos comunes
  name VARCHAR(200) NOT NULL,           -- Nombre display (persona o empresa)
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  description TEXT,
  logo_url TEXT,                         -- Foto personal o logo empresa
  cover_image_url TEXT,
  
  -- Ubicación
  city VARCHAR(100),
  country VARCHAR(50) DEFAULT 'Chile',
  address TEXT,
  
  -- Campos específicos de empresa
  legal_name VARCHAR(200),               -- Razón social
  tax_id VARCHAR(50),                    -- RUT/RFC
  website VARCHAR(255),
  
  -- Campos específicos de persona
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Estado de verificación
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'suspended')),
  status_message TEXT,                   -- Razón de rechazo, etc.
  verified_at TIMESTAMP,
  
  -- Relaciones
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Métricas (calculadas con triggers o jobs)
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tour_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_providers_owner ON providers(owner_id);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_type ON providers(type);
CREATE INDEX idx_providers_city ON providers(city);
CREATE UNIQUE INDEX idx_providers_tax_id ON providers(tax_id) WHERE tax_id IS NOT NULL;
```

---

### 2. `verification_documents` - Documentos de Verificación

```sql
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Tipo de documento
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'national_id',           -- Cédula/DNI
    'tax_id',                -- RUT/RFC empresa
    'business_license',      -- Permiso de operación
    'insurance',             -- Seguro de responsabilidad
    'guide_certification',   -- Certificación de guía
    'other'
  )),
  
  -- Archivo
  name VARCHAR(255) NOT NULL,           -- Nombre original del archivo
  url TEXT NOT NULL,                     -- URL en S3/storage
  mime_type VARCHAR(100),
  file_size INTEGER,
  
  -- Estado de revisión
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  
  -- Timestamps
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_verification_docs_provider ON verification_documents(provider_id);
CREATE INDEX idx_verification_docs_status ON verification_documents(status);
CREATE INDEX idx_verification_docs_type ON verification_documents(type);
```

---

### 3. `guide_profiles` - Perfiles de Guías (dentro de proveedores)

> **IMPORTANTE:** Los guías NO son usuarios del sistema. Son perfiles informativos creados por proveedores.

```sql
CREATE TABLE guide_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Información básica
  name VARCHAR(200) NOT NULL,
  photo_url TEXT,
  bio TEXT,
  
  -- Habilidades
  languages TEXT[],                      -- ['es', 'en', 'fr']
  specialties TEXT[],                    -- ['hiking', 'cultural', 'wine']
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_guide_profiles_provider ON guide_profiles(provider_id);
CREATE INDEX idx_guide_profiles_active ON guide_profiles(is_active) WHERE is_active = true;
```

---

### 4. Modificaciones a `users` existente

Agregar campos si no existen:

```sql
-- Agregar rol de provider si no existe
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PROVIDER';

-- O si usan varchar para roles, verificar que acepte 'PROVIDER'

-- Relación con provider (opcional, para acceso rápido)
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id);
```

---

## 🔌 NUEVOS ENDPOINTS

### 1. Registro de Proveedor

#### `POST /api/auth/register-provider`

Registra un nuevo proveedor (individual o empresa).

**Request Body - Guía Independiente:**
```json
{
  "type": "individual",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com",
  "password": "securepassword123",
  "phone": "+56912345678",
  "city": "Santiago",
  "country": "Chile",
  "description": "Guía con 5 años de experiencia..."
}
```

**Request Body - Empresa:**
```json
{
  "type": "company",
  "companyName": "Aventuras Chile",
  "legalName": "Aventuras Chile SpA",
  "taxId": "12.345.678-9",
  "email": "contacto@aventuras.cl",
  "password": "securepassword123",
  "phone": "+56912345678",
  "address": "Av. Principal 123",
  "city": "Santiago",
  "country": "Chile",
  "website": "https://aventuras.cl",
  "description": "Empresa de tours outdoor..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "juan@email.com",
      "role": "PROVIDER",
      "emailVerified": false
    },
    "provider": {
      "id": "uuid",
      "type": "individual",
      "name": "Juan Pérez",
      "status": "pending",
      "email": "juan@email.com",
      "phone": "+56912345678",
      "city": "Santiago",
      "country": "Chile"
    },
    "token": "jwt_token"
  }
}
```

**Lógica del Backend:**
1. Crear usuario con role = 'PROVIDER'
2. Crear registro en `providers` con status = 'pending'
3. Enviar email de verificación
4. Retornar token JWT

---

### 2. Perfil del Proveedor

#### `GET /api/providers/me`

Obtener perfil del proveedor autenticado.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "individual",
    "name": "Juan Pérez",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "phone": "+56912345678",
    "description": "...",
    "logo": "https://...",
    "city": "Santiago",
    "country": "Chile",
    "status": "pending",
    "statusMessage": null,
    "verifiedAt": null,
    "rating": 0,
    "reviewCount": 0,
    "tourCount": 0,
    "guides": [],
    "createdAt": "2024-01-15T...",
    "updatedAt": "2024-01-15T..."
  }
}
```

#### `PATCH /api/providers/me`

Actualizar perfil del proveedor.

**Request Body:**
```json
{
  "description": "Nueva descripción...",
  "phone": "+56987654321",
  "website": "https://nuevo-sitio.com"
}
```

---

### 3. Documentos de Verificación

#### `GET /api/providers/me/documents`

Listar documentos del proveedor.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "national_id",
      "name": "cedula_frente.jpg",
      "url": "https://s3.../cedula_frente.jpg",
      "status": "approved",
      "uploadedAt": "2024-01-15T..."
    },
    {
      "id": "uuid",
      "type": "guide_certification",
      "name": "certificacion.pdf",
      "url": "https://s3.../certificacion.pdf",
      "status": "pending",
      "uploadedAt": "2024-01-15T..."
    }
  ]
}
```

#### `POST /api/providers/me/documents`

Subir nuevo documento.

**Request:** `multipart/form-data`
- `file`: Archivo (imagen o PDF)
- `type`: Tipo de documento (`national_id`, `tax_id`, etc.)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "national_id",
    "name": "cedula.jpg",
    "url": "https://s3.../cedula.jpg",
    "status": "pending",
    "uploadedAt": "2024-01-15T..."
  }
}
```

#### `DELETE /api/providers/me/documents/:documentId`

Eliminar documento.

**Response:**
```json
{
  "success": true,
  "message": "Documento eliminado"
}
```

---

### 4. Estado de Verificación

#### `GET /api/providers/me/verification-status`

Obtener estado detallado de verificación.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "message": null,
    "missingDocuments": ["national_id"],
    "nextSteps": [
      "Sube tu cédula de identidad",
      "Espera la revisión de tu cuenta"
    ]
  }
}
```

#### `POST /api/providers/me/request-verification`

Solicitar revisión (cuando todos los documentos están subidos).

**Response:**
```json
{
  "success": true,
  "message": "Solicitud de verificación enviada"
}
```

**Lógica:**
1. Verificar que todos los documentos requeridos estén subidos
2. Cambiar status de 'pending' a 'in_review'
3. Notificar a admin para revisión
4. Enviar email de confirmación al proveedor

---

### 5. Perfiles de Guías (Solo para empresas)

#### `GET /api/providers/me/guides`

Listar guías del proveedor.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Carlos Muñoz",
      "photo": "https://...",
      "bio": "Guía especializado en...",
      "languages": ["es", "en"],
      "specialties": ["hiking", "photography"],
      "isActive": true
    }
  ]
}
```

#### `POST /api/providers/me/guides`

Crear perfil de guía.

**Request:**
```json
{
  "name": "Carlos Muñoz",
  "bio": "Guía especializado en...",
  "languages": ["es", "en"],
  "specialties": ["hiking", "photography"]
}
```

#### `PATCH /api/providers/me/guides/:guideId`

Actualizar perfil de guía.

#### `DELETE /api/providers/me/guides/:guideId`

Eliminar perfil de guía.

---

### 6. Endpoints Públicos

#### `GET /api/providers/:id`

Obtener proveedor público (solo aprobados).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "company",
    "name": "Aventuras Chile",
    "description": "...",
    "logo": "https://...",
    "city": "Santiago",
    "rating": 4.8,
    "reviewCount": 234,
    "tourCount": 15,
    "guides": [
      {
        "id": "uuid",
        "name": "Carlos",
        "photo": "https://..."
      }
    ]
  }
}
```

---

## 👨‍💼 ENDPOINTS DE ADMIN

### Gestión de Proveedores

#### `GET /api/admin/providers`

Listar proveedores para revisión.

**Query Params:**
- `status`: `pending` | `in_review` | `approved` | `rejected` | `suspended`
- `type`: `individual` | `company`
- `page`, `limit`

#### `GET /api/admin/providers/:id`

Ver detalle de proveedor con todos sus documentos.

#### `PATCH /api/admin/providers/:id/verify`

Aprobar o rechazar proveedor.

**Request:**
```json
{
  "action": "approve" | "reject",
  "message": "Motivo del rechazo (si aplica)"
}
```

**Lógica:**
1. Cambiar status a 'approved' o 'rejected'
2. Si aprobado: set verified_at = NOW()
3. Enviar email de notificación al proveedor
4. Si rechazado: incluir mensaje con razón

#### `PATCH /api/admin/providers/:id/suspend`

Suspender proveedor activo.

**Request:**
```json
{
  "reason": "Motivo de suspensión"
}
```

### Gestión de Documentos

#### `PATCH /api/admin/documents/:documentId/review`

Aprobar o rechazar documento individual.

**Request:**
```json
{
  "action": "approve" | "reject",
  "reason": "Documento ilegible (si rechazado)"
}
```

---

## 📧 NOTIFICACIONES

### Emails a enviar

| Evento | Destinatario | Asunto |
|--------|--------------|--------|
| Registro | Proveedor | Verifica tu email |
| Documentos subidos | Admin | Nuevo proveedor para revisar |
| Aprobación | Proveedor | ¡Tu cuenta ha sido aprobada! |
| Rechazo | Proveedor | Tu solicitud necesita correcciones |
| Suspensión | Proveedor | Tu cuenta ha sido suspendida |

### Push Notifications

- Proveedor aprobado → "¡Tu cuenta ha sido verificada!"
- Proveedor rechazado → "Tu solicitud necesita correcciones"
- Nuevo documento rechazado → "Uno de tus documentos fue rechazado"

---

## 🔒 PERMISOS Y SEGURIDAD

### Roles y acceso

| Endpoint | TOURIST | PROVIDER | ADMIN |
|----------|---------|----------|-------|
| POST /auth/register-provider | ✅ | - | - |
| GET /providers/me | - | ✅ (own) | ✅ |
| PATCH /providers/me | - | ✅ (own) | ✅ |
| GET /providers/me/documents | - | ✅ (own) | ✅ |
| POST /providers/me/documents | - | ✅ (own) | - |
| DELETE /providers/me/documents/:id | - | ✅ (own) | ✅ |
| GET /providers/:id (público) | ✅ | ✅ | ✅ |
| GET /admin/providers | - | - | ✅ |
| PATCH /admin/providers/:id/verify | - | - | ✅ |

### Validaciones importantes

1. **Registro:**
   - Email único
   - Tax ID único (si es empresa)
   - Validar formato de RUT/RFC

2. **Documentos:**
   - Máximo 5MB por archivo
   - Solo JPG, PNG, PDF
   - Escanear malware antes de almacenar

3. **Proveedores:**
   - Solo proveedores aprobados pueden crear tours
   - Proveedores suspendidos no pueden operar

---

## 📝 DOCUMENTOS REQUERIDOS POR TIPO

### Guía Independiente

| Documento | Requerido | Descripción |
|-----------|-----------|-------------|
| `national_id` | ✅ Sí | Cédula de identidad |
| `guide_certification` | ❌ No | Certificación de guía turístico |

### Empresa

| Documento | Requerido | Descripción |
|-----------|-----------|-------------|
| `tax_id` | ✅ Sí | RUT/RFC de la empresa |
| `business_license` | ✅ Sí | Permiso de operación turística |
| `national_id` | ✅ Sí | Cédula del representante legal |
| `insurance` | ❌ No | Seguro de responsabilidad civil |

---

## 🔄 FLUJO DE ESTADOS

```
                    ┌─────────────┐
                    │   PENDING   │ ← Registro inicial
                    └──────┬──────┘
                           │
                           │ Sube documentos + solicita verificación
                           ▼
                    ┌─────────────┐
                    │  IN_REVIEW  │ ← Admin revisa
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  APPROVED   │          │  REJECTED   │
       └──────┬──────┘          └──────┬──────┘
              │                        │
              │                        │ Corrige y reenvía
              │                        └──────────┐
              │                                   │
              ▼                                   ▼
       ┌─────────────┐                    (vuelve a PENDING)
       │  SUSPENDED  │ ← Admin suspende
       └─────────────┘
```

---

## ⚡ PRIORIDADES DE IMPLEMENTACIÓN

### Fase 1 (MVP)
1. ✅ Tabla `providers`
2. ✅ Tabla `verification_documents`
3. ✅ `POST /auth/register-provider`
4. ✅ `GET/PATCH /providers/me`
5. ✅ `GET/POST/DELETE /providers/me/documents`
6. ✅ `GET /providers/me/verification-status`
7. ✅ `POST /providers/me/request-verification`

### Fase 2
1. ⏳ Endpoints de admin para verificación
2. ⏳ Emails de notificación
3. ⏳ Push notifications

### Fase 3
1. ⏳ Tabla `guide_profiles`
2. ⏳ Endpoints de guías
3. ⏳ Asignación de guías a tours

---

## ❓ PREGUNTAS PARA BACKEND

1. ¿Ya existe una tabla de usuarios que pueda extenderse?
2. ¿Qué storage usan para archivos? (S3, GCS, local)
3. ¿Tienen sistema de emails configurado? (SendGrid, SES)
4. ¿Prefieren validación de RUT en backend o solo formato?
5. ¿Necesitan webhook cuando un proveedor es aprobado?

---

## ⚠️ MENSAJES DE ERROR ESTANDARIZADOS

El frontend tiene un sistema de parseo de errores que convierte errores técnicos en mensajes amigables. 

### Formato recomendado de respuestas de error:

```json
{
  "success": false,
  "error": {
    "message": "Descripción clara del error",
    "code": "ERROR_CODE_OPCIONAL"
  }
}
```

### Mensajes específicos importantes:

| Caso | Mensaje recomendado | Lo detecta como |
|------|---------------------|-----------------|
| Email duplicado | "El email ya está registrado" | Email ya existe → ofrece login/verificación |
| RUT/RFC duplicado | "El RUT/RFC ya está registrado" | RUT duplicado |
| Usuario no existe | "Usuario no encontrado" | Usuario no encontrado |
| Contraseña incorrecta | "Contraseña incorrecta" | Credenciales incorrectas |
| Código inválido | "Código de verificación inválido" | Código inválido |
| Código expirado | "El código ha expirado" | Código expirado → ofrece reenviar |

### Evitar:

❌ No enviar errores técnicos de Prisma/ORM directamente al cliente:
```
"Unique constraint failed on the fields: (`email`)"  // ← Muy técnico
```

✅ Mejor:
```json
{
  "error": {
    "message": "El email ya está registrado"
  }
}
```

---

## 📞 CONTACTO

Si tienen dudas sobre esta especificación, contactar al equipo de frontend.
