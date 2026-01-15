# API Endpoints para Panel Admin - Tourline

## Resumen de Tablas Necesarias

### Tablas existentes que deben usarse:
- `users` - Usuarios (admins, guides, tourists)
- `companies` - Empresas de turismo
- `tours` - Tours disponibles
- `bookings` - Reservas
- `guides` - Perfiles de guías
- `reviews` - Reseñas

### Campos adicionales sugeridos:

```sql
-- En tabla 'tours' agregar:
ALTER TABLE tours ADD COLUMN featured BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN bookings_count INTEGER DEFAULT 0;

-- En tabla 'bookings' agregar (si no existen):
ALTER TABLE bookings ADD COLUMN reference VARCHAR(20) UNIQUE;

-- En tabla 'companies' agregar:
ALTER TABLE companies ADD COLUMN monthly_revenue_goal DECIMAL(12,2);
```

---

## 1. DASHBOARD ENDPOINTS

### GET `/api/admin/dashboard`
Obtiene datos completos del dashboard para el admin.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "uuid",
      "name": "Aventuras Chile",
      "slug": "aventuras-chile",
      "logo": "https://...",
      "email": "contacto@empresa.com",
      "isVerified": true
    },
    "stats": {
      "totalTours": 12,
      "activeTours": 8,
      "totalGuides": 5,
      "activeGuides": 4,
      "totalBookings": 156,
      "pendingBookings": 3,
      "monthlyRevenue": 4450000,
      "averageRating": 4.7
    },
    "recentBookings": [
      {
        "id": "uuid",
        "reference": "TL-ABC123",
        "tour": { "id": "uuid", "title": "Santiago Histórico" },
        "guide": { "id": "uuid", "name": "Carolina Muñoz" },
        "user": { "id": "uuid", "name": "María González", "email": "maria@email.com" },
        "date": "2026-02-15",
        "startTime": "09:00",
        "endTime": "12:00",
        "groupSize": 4,
        "totalPrice": 140000,
        "currency": "CLP",
        "status": "PENDING",
        "createdAt": "2026-02-01T15:30:00Z"
      }
    ],
    "alerts": [
      { "type": "pending_booking", "count": 3, "message": "3 reservas pendientes de confirmar" },
      { "type": "review", "count": 5, "message": "5 reseñas nuevas sin responder" }
    ]
  }
}
```

**SQL Query sugerido para stats:**
```sql
SELECT 
  (SELECT COUNT(*) FROM tours WHERE company_id = $1) as total_tours,
  (SELECT COUNT(*) FROM tours WHERE company_id = $1 AND status = 'published') as active_tours,
  (SELECT COUNT(*) FROM guides WHERE company_id = $1) as total_guides,
  (SELECT COUNT(*) FROM guides WHERE company_id = $1 AND is_active = true) as active_guides,
  (SELECT COUNT(*) FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE t.company_id = $1) as total_bookings,
  (SELECT COUNT(*) FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE t.company_id = $1 AND b.status = 'PENDING') as pending_bookings,
  (SELECT COALESCE(SUM(b.total_price), 0) FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE t.company_id = $1 AND b.created_at >= date_trunc('month', CURRENT_DATE)) as monthly_revenue,
  (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN tours t ON r.tour_id = t.id WHERE t.company_id = $1) as average_rating
```

---

## 2. BOOKINGS ADMIN ENDPOINTS

### GET `/api/admin/bookings`
Lista todas las reservas de la empresa.

**Query params:**
- `status` - PENDING | CONFIRMED | COMPLETED | CANCELLED (opcional)
- `guideId` - UUID del guía (opcional)
- `tourId` - UUID del tour (opcional)
- `fromDate` - Fecha inicio YYYY-MM-DD (opcional)
- `toDate` - Fecha fin YYYY-MM-DD (opcional)
- `page` - Número de página (default: 1)
- `limit` - Items por página (default: 20)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reference": "TL-ABC123",
      "tour": {
        "id": "uuid",
        "title": "Santiago Histórico",
        "image": "https://..."
      },
      "guide": {
        "id": "uuid",
        "name": "Carolina Muñoz",
        "avatar": "https://..."
      },
      "user": {
        "id": "uuid",
        "name": "María González",
        "email": "maria@email.com",
        "phone": "+56911111111"
      },
      "date": "2026-02-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "groupSize": 4,
      "totalPrice": 140000,
      "currency": "CLP",
      "status": "PENDING",
      "specialRequests": "Vegetariano",
      "createdAt": "2026-02-01T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### GET `/api/admin/bookings/stats`
Estadísticas de reservas.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "today": { "bookings": 3, "revenue": 385000 },
    "thisWeek": { "bookings": 12, "revenue": 1540000 },
    "thisMonth": { "bookings": 45, "revenue": 4450000 },
    "byStatus": {
      "pending": 3,
      "confirmed": 28,
      "completed": 120,
      "cancelled": 5
    },
    "topTours": [
      { "id": "uuid", "title": "Torres del Paine", "bookings": 23, "revenue": 2760000 }
    ],
    "topGuides": [
      { "id": "uuid", "name": "Sebastián Lagos", "bookings": 31, "revenue": 1860000 }
    ]
  }
}
```

### PATCH `/api/admin/bookings/:id/confirm`
Confirma una reserva pendiente.

**Response 200:**
```json
{
  "success": true,
  "message": "Reserva confirmada",
  "data": { "id": "uuid", "status": "CONFIRMED" }
}
```

### PATCH `/api/admin/bookings/:id/cancel`
Cancela/rechaza una reserva.

**Body:**
```json
{
  "reason": "Guía no disponible en esa fecha"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Reserva cancelada",
  "data": { "id": "uuid", "status": "CANCELLED_COMPANY" }
}
```

---

## 3. TOURS ADMIN ENDPOINTS

### GET `/api/admin/tours`
Lista todos los tours de la empresa.

**Query params:**
- `status` - published | draft | archived (opcional)
- `search` - Búsqueda por título/ubicación (opcional)
- `guideId` - UUID del guía (opcional)
- `page` - Número de página
- `limit` - Items por página

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Santiago Histórico y Cultural",
      "description": "Recorre el centro histórico...",
      "image": "https://...",
      "price": 35000,
      "currency": "CLP",
      "duration": "3 horas",
      "maxParticipants": 10,
      "location": "Santiago",
      "categories": ["cultural", "history"],
      "includes": ["Guía experto", "Transporte"],
      "status": "published",
      "guideId": "uuid",
      "guideName": "Carolina Muñoz",
      "guideAvatar": "https://...",
      "rating": 4.9,
      "reviewCount": 128,
      "bookingsCount": 45,
      "featured": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ],
  "pagination": { "total": 12, "page": 1, "limit": 20, "pages": 1 }
}
```

### POST `/api/admin/tours`
Crea un nuevo tour.

**Body:**
```json
{
  "title": "Nuevo Tour",
  "description": "Descripción del tour...",
  "price": 50000,
  "currency": "CLP",
  "duration": 180,
  "maxParticipants": 8,
  "location": "Santiago",
  "meetingPoint": "Metro Baquedano",
  "meetingPointInstructions": "Salida Plaza Italia",
  "categories": ["adventure"],
  "includes": ["Transporte", "Snack"],
  "excludes": ["Almuerzo"],
  "requirements": ["Zapatos cómodos"],
  "guideId": "uuid",
  "status": "draft"
}
```

### PATCH `/api/admin/tours/:id`
Actualiza un tour.

### PATCH `/api/admin/tours/:id/publish`
Publica un tour (cambia status a 'published').

### PATCH `/api/admin/tours/:id/unpublish`
Despublica un tour (cambia status a 'draft').

### DELETE `/api/admin/tours/:id`
Archiva un tour (cambia status a 'archived').

---

## 4. GUIDES ADMIN ENDPOINTS

### GET `/api/admin/guides`
Lista los guías de la empresa.

**Query params:**
- `search` - Búsqueda por nombre/email
- `isActive` - true/false
- `isVerified` - true/false

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Carolina Muñoz",
      "email": "carolina@aventuraschile.com",
      "avatar": "https://...",
      "phone": "+56912345678",
      "location": "Santiago, Chile",
      "languages": ["Español", "Inglés"],
      "specialties": ["City tours", "Historia"],
      "bio": "Guía oficial con más de 8 años...",
      "pricePerHour": 35000,
      "currency": "CLP",
      "rating": 4.9,
      "reviewCount": 234,
      "toursCount": 3,
      "bookingsCount": 120,
      "isVerified": true,
      "isActive": true,
      "createdAt": "2023-06-01T10:00:00Z"
    }
  ]
}
```

### POST `/api/admin/guides/invite`
Invita a un nuevo guía (envía email de invitación).

**Body:**
```json
{
  "email": "nuevo@guia.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+56999999999",
  "location": "Santiago",
  "languages": ["Español", "Inglés"],
  "specialties": ["Adventure", "Trekking"],
  "pricePerHour": 40000
}
```

### PATCH `/api/admin/guides/:id/verify`
Verifica a un guía.

### PATCH `/api/admin/guides/:id/deactivate`
Desactiva a un guía.

### PATCH `/api/admin/guides/:id/activate`
Reactiva a un guía.

---

## 5. COMPANY SETTINGS ENDPOINTS

### GET `/api/admin/company`
Obtiene datos de la empresa del admin.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Aventuras Chile",
    "slug": "aventuras-chile",
    "description": "La mejor experiencia de tours...",
    "logo": "https://...",
    "coverImage": "https://...",
    "email": "contacto@aventuraschile.com",
    "phone": "+56222334455",
    "website": "https://aventuraschile.com",
    "address": "Av. Providencia 1234",
    "city": "Santiago",
    "country": "Chile",
    "isVerified": true,
    "isActive": true,
    "socialMedia": {
      "instagram": "@aventuraschile",
      "facebook": "aventuraschile",
      "twitter": "@aventuraschile"
    },
    "businessHours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" }
    },
    "createdAt": "2023-01-01T10:00:00Z"
  }
}
```

### PATCH `/api/admin/company`
Actualiza datos de la empresa.

**Body:**
```json
{
  "name": "Aventuras Chile",
  "description": "Nueva descripción...",
  "email": "nuevo@email.com",
  "phone": "+56111222333",
  "website": "https://nuevositio.com",
  "address": "Nueva Dirección 123"
}
```

### POST `/api/admin/company/logo`
Sube nuevo logo de empresa.

**Body:** `multipart/form-data` con campo `logo`

---

## 6. NOTIFICATIONS ENDPOINTS (Opcional)

### GET `/api/admin/notifications`
Lista notificaciones del admin.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "new_booking",
      "title": "Nueva reserva",
      "message": "María González reservó Santiago Histórico",
      "data": { "bookingId": "uuid" },
      "read": false,
      "createdAt": "2026-02-01T15:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

### PATCH `/api/admin/notifications/:id/read`
Marca notificación como leída.

---

## Resumen de Endpoints Nuevos Necesarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard completo |
| GET | `/api/admin/bookings` | Lista reservas |
| GET | `/api/admin/bookings/stats` | Stats de reservas |
| PATCH | `/api/admin/bookings/:id/confirm` | Confirmar reserva |
| PATCH | `/api/admin/bookings/:id/cancel` | Cancelar reserva |
| GET | `/api/admin/tours` | Lista tours (admin) |
| POST | `/api/admin/tours` | Crear tour |
| PATCH | `/api/admin/tours/:id` | Actualizar tour |
| PATCH | `/api/admin/tours/:id/publish` | Publicar tour |
| PATCH | `/api/admin/tours/:id/unpublish` | Despublicar tour |
| DELETE | `/api/admin/tours/:id` | Archivar tour |
| GET | `/api/admin/guides` | Lista guías |
| POST | `/api/admin/guides/invite` | Invitar guía |
| PATCH | `/api/admin/guides/:id/verify` | Verificar guía |
| PATCH | `/api/admin/guides/:id/deactivate` | Desactivar guía |
| GET | `/api/admin/company` | Obtener empresa |
| PATCH | `/api/admin/company` | Actualizar empresa |

---

## Autenticación

Todos los endpoints admin requieren:
1. Token JWT válido en header `Authorization: Bearer {token}`
2. Usuario con rol `ADMIN` o `SUPER_ADMIN`
3. Usuario debe pertenecer a la empresa (excepto SUPER_ADMIN)

**Middleware sugerido:**
```typescript
const adminMiddleware = async (req, res, next) => {
  const user = req.user; // Del JWT
  
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  // Obtener company del admin
  if (user.role === 'ADMIN') {
    const admin = await db.query('SELECT company_id FROM admins WHERE user_id = $1', [user.id]);
    req.companyId = admin.rows[0]?.company_id;
  }
  
  next();
};
```

