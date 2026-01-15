# 📋 Especificación de Backend - Tourline API

> Documento para el equipo de backend con los nuevos endpoints y tablas requeridas.

---

## 📊 Resumen de Cambios

| Prioridad | Componente | Descripción |
|-----------|------------|-------------|
| 🔴 Alta | Tour Availability | Sistema de disponibilidad real por tour |
| 🔴 Alta | Favorites | Lista de deseos de usuarios |
| 🔴 Alta | **Companies** | **API de organizaciones/empresas** |
| 🟡 Media | Regions | Destinos/regiones para filtros |
| 🟡 Media | Banners | Promociones y marketing |
| 🟡 Media | Home Feed | Endpoint combinado para Home |
| 🟡 Media | **Tour Reviews** | **Reseñas de tours** |
| 🟢 Baja | Notifications | Sistema de notificaciones |
| 🟢 Baja | App Config | Configuración remota |
| 🟢 Baja | **Unified Search** | **Búsqueda unificada** |

---

## 🗄️ NUEVAS TABLAS

### 1. `regions` - Destinos/Regiones

```sql
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  country VARCHAR(50) DEFAULT 'Chile',
  description TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  tour_count INTEGER DEFAULT 0,  -- Cache, actualizar con trigger
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index para búsquedas
CREATE INDEX idx_regions_slug ON regions(slug);
CREATE INDEX idx_regions_featured ON regions(is_featured) WHERE is_featured = true;
```

**Datos iniciales sugeridos:**
- Santiago
- Valparaíso
- Cajón del Maipo
- San Pedro de Atacama
- Torres del Paine
- Isla de Pascua
- Puerto Varas
- Pucón

---

### 2. `banners` - Promociones

```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  image_url TEXT NOT NULL,
  action_type VARCHAR(50) NOT NULL,  -- 'tour', 'category', 'region', 'url', 'search'
  action_value TEXT NOT NULL,         -- ID o URL según action_type
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  placement VARCHAR(50) DEFAULT 'home',  -- 'home', 'search', 'profile'
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index para queries activos
CREATE INDEX idx_banners_active ON banners(is_active, placement) 
  WHERE is_active = true;
```

---

### 3. `companies` - Empresas/Organizaciones

> **Nota:** Si ya tienes una tabla similar (ej: `organizations`, `operators`), adapta estos campos.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image TEXT,
  
  -- Contacto
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(50) DEFAULT 'Chile',
  
  -- Métricas (calculadas con triggers o jobs)
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tour_count INTEGER DEFAULT 0,
  
  -- Info adicional
  years_active INTEGER,
  certifications TEXT[],  -- Array de certificaciones
  social_links JSONB,      -- {"instagram": "...", "facebook": "..."}
  operating_hours JSONB,   -- {"monday": "09:00-18:00", ...}
  
  -- Estado
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Owner (usuario admin de la empresa)
  owner_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_active ON companies(is_active) WHERE is_active = true;
```

---

### 4. `tour_reviews` - Reseñas de Tours

```sql
CREATE TABLE tour_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),  -- Opcional, para verificar compra
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT NOT NULL,
  images TEXT[],  -- Array de URLs de imágenes
  
  -- Respuesta de la empresa
  response TEXT,
  response_at TIMESTAMP,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  
  -- Estado
  is_visible BOOLEAN DEFAULT true,
  is_verified_purchase BOOLEAN DEFAULT false,  -- true si tiene booking_id válido
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Evitar duplicados
  UNIQUE(user_id, booking_id)
);

CREATE INDEX idx_tour_reviews_tour ON tour_reviews(tour_id);
CREATE INDEX idx_tour_reviews_rating ON tour_reviews(tour_id, rating);
CREATE INDEX idx_tour_reviews_visible ON tour_reviews(tour_id, is_visible) WHERE is_visible = true;

-- Tabla auxiliar para "helpful" votes
CREATE TABLE tour_review_helpful (
  review_id UUID NOT NULL REFERENCES tour_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);
```

---

### 5. `tour_schedules` - Horarios Base de Tours

```sql
CREATE TABLE tour_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  
  -- Horario recurrente (día de semana)
  day_of_week INTEGER,  -- 0=Domingo, 1=Lunes, ..., 6=Sábado
  
  -- O fecha específica
  specific_date DATE,
  
  start_time TIME NOT NULL,
  end_time TIME,  -- Opcional, se calcula desde tour.duration si no se especifica
  
  max_spots INTEGER NOT NULL,
  price_override DECIMAL(10, 2),  -- NULL = usar precio del tour
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Solo uno de day_of_week o specific_date debe estar presente
  CONSTRAINT check_schedule_type CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (day_of_week IS NULL AND specific_date IS NOT NULL)
  )
);

CREATE INDEX idx_tour_schedules_tour ON tour_schedules(tour_id);
CREATE INDEX idx_tour_schedules_day ON tour_schedules(day_of_week) WHERE day_of_week IS NOT NULL;
```

---

### 4. `tour_availability` - Disponibilidad Real

```sql
CREATE TABLE tour_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES tour_schedules(id) ON DELETE SET NULL,
  
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  spots_total INTEGER NOT NULL,
  spots_booked INTEGER DEFAULT 0,
  spots_blocked INTEGER DEFAULT 0,
  
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CLP',
  
  status VARCHAR(20) DEFAULT 'AVAILABLE',  -- 'AVAILABLE', 'FULL', 'BLOCKED', 'CANCELLED'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tour_id, date, start_time)
);

CREATE INDEX idx_availability_tour_date ON tour_availability(tour_id, date);
CREATE INDEX idx_availability_status ON tour_availability(status) WHERE status = 'AVAILABLE';
```

**Lógica de negocio:**
- `spots_available = spots_total - spots_booked - spots_blocked`
- Cuando `spots_available = 0`, cambiar status a 'FULL'
- Generar disponibilidad automáticamente desde `tour_schedules` (job diario o bajo demanda)

---

### 5. `favorites` - Lista de Deseos

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, tour_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
```

---

### 6. `notifications` - Notificaciones

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  -- Tipos: 'booking_confirmed', 'booking_cancelled', 'booking_reminder',
  --        'review_received', 'review_response', 'promotion', 'system', 'chat_message'
  
  title VARCHAR(200) NOT NULL,
  body TEXT,
  
  -- Datos adicionales para navegación
  data JSONB,
  -- Ejemplo: {"tourId": "uuid", "bookingId": "uuid", "actionType": "booking", "actionValue": "uuid"}
  
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

---

### 7. `app_settings` - Configuración Remota

```sql
CREATE TABLE app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO app_settings (key, value, description) VALUES
  ('min_app_version', '"1.0.0"', 'Versión mínima requerida de la app'),
  ('force_update', 'false', 'Forzar actualización'),
  ('maintenance_mode', 'false', 'Modo mantenimiento'),
  ('maintenance_message', '""', 'Mensaje de mantenimiento'),
  ('featured_categories', '["nature", "adventure"]', 'Categorías destacadas'),
  ('commission_rate', '0.15', 'Comisión de la plataforma'),
  ('min_booking_advance', '24', 'Horas mínimas de anticipación para reservar'),
  ('support_email', '"soporte@tourline.com"', 'Email de soporte'),
  ('support_phone', '"+56912345678"', 'Teléfono de soporte');
```

---

## 🔌 NUEVOS ENDPOINTS

### 📍 Regions (Destinos)

#### `GET /api/regions`
Listar todas las regiones.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Cajón del Maipo",
      "slug": "cajon-del-maipo",
      "country": "Chile",
      "description": "Naturaleza a 1 hora de Santiago",
      "imageUrl": "https://...",
      "tourCount": 15,
      "coordinates": {
        "latitude": -33.6419,
        "longitude": -70.0929
      },
      "isFeatured": true,
      "sortOrder": 1
    }
  ]
}
```

#### `GET /api/regions/featured`
Regiones destacadas para Home.

#### `GET /api/regions/:slug`
Detalle de región con sus tours.

#### `GET /api/regions/:slug/tours`
Tours de una región con paginación.

**Query params:** `page`, `limit`, `sortBy`

---

### 🎯 Banners (Promociones)

#### `GET /api/banners`
Listar banners activos.

**Query params:** `placement` (home, search, profile)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Verano en Patagonia",
      "subtitle": "Hasta 30% off en tours seleccionados",
      "imageUrl": "https://...",
      "actionType": "region",
      "actionValue": "patagonia",
      "backgroundColor": "#1E3A5F",
      "textColor": "#FFFFFF",
      "sortOrder": 1
    }
  ]
}
```

#### `POST /api/banners/:id/click`
Registrar click en banner (analytics).

---

### ❤️ Favorites (Lista de Deseos)

> **Auth requerida:** Bearer token

#### `GET /api/favorites`
Obtener favoritos del usuario.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tourId": "uuid",
      "tour": {
        "id": "uuid",
        "title": "Trekking El Morado",
        "slug": "trekking-el-morado",
        "coverImage": "https://...",
        "price": 45000,
        "currency": "CLP",
        "rating": 4.8,
        "reviewCount": 124,
        "duration": 300,
        "city": "Cajón del Maipo",
        "country": "Chile",
        "company": {
          "id": "uuid",
          "name": "Santiago Tours",
          "logoUrl": "https://..."
        }
      },
      "createdAt": "2026-01-15T..."
    }
  ]
}
```

#### `POST /api/favorites`
Agregar tour a favoritos.

**Body:**
```json
{
  "tourId": "uuid"
}
```

#### `DELETE /api/favorites/:tourId`
Quitar de favoritos.

#### `GET /api/favorites/check/:tourId`
Verificar si tour está en favoritos.

**Response:**
```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

#### `GET /api/favorites/count`
Contar favoritos del usuario.

---

### 📅 Tour Availability (CRÍTICO)

#### `GET /api/bookings/tour/:tourId/calendar`
Calendario de disponibilidad del tour.

**Query params:** `year`, `month`

**Response:**
```json
{
  "success": true,
  "data": {
    "tourId": "uuid",
    "tourName": "Trekking a Mirador Panorámico",
    "month": 1,
    "year": 2026,
    "days": [
      {
        "date": "2026-01-17",
        "dayOfWeek": "Sáb",
        "isAvailable": true,
        "slots": [
          {
            "id": "uuid",
            "startTime": "08:00",
            "endTime": "13:00",
            "spotsTotal": 10,
            "spotsBooked": 2,
            "spotsAvailable": 8,
            "price": 45000,
            "status": "AVAILABLE"
          },
          {
            "id": "uuid",
            "startTime": "14:00",
            "endTime": "19:00",
            "spotsTotal": 10,
            "spotsBooked": 10,
            "spotsAvailable": 0,
            "price": 45000,
            "status": "FULL"
          }
        ]
      },
      {
        "date": "2026-01-18",
        "dayOfWeek": "Dom",
        "isAvailable": false,
        "slots": []
      }
    ]
  }
}
```

**Lógica:**
1. Obtener slots de `tour_availability` para el mes/año
2. Si no existen, generarlos desde `tour_schedules`
3. Calcular `spotsAvailable = spotsTotal - spotsBooked - spotsBlocked`
4. Marcar `isAvailable = true` si al menos un slot tiene `spotsAvailable > 0`

---

### 🔔 Notifications

> **Auth requerida:** Bearer token

#### `GET /api/notifications`
Listar notificaciones.

**Query params:** `unread` (boolean), `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "booking_confirmed",
      "title": "Reserva Confirmada",
      "body": "Tu reserva para Trekking El Morado ha sido confirmada",
      "data": {
        "bookingId": "uuid",
        "tourId": "uuid"
      },
      "isRead": false,
      "createdAt": "2026-01-15T..."
    }
  ],
  "meta": {
    "total": 25,
    "unread": 3
  }
}
```

#### `GET /api/notifications/unread-count`
Contador de no leídas.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### `POST /api/notifications/:id/read`
Marcar como leída.

#### `POST /api/notifications/read-all`
Marcar todas como leídas.

#### `DELETE /api/notifications/:id`
Eliminar notificación.

#### `GET /api/notifications/preferences`
Obtener preferencias de notificación.

#### `PATCH /api/notifications/preferences`
Actualizar preferencias.

**Body:**
```json
{
  "bookingUpdates": true,
  "promotions": false,
  "reviews": true,
  "chatMessages": true,
  "systemAlerts": true
}
```

#### `POST /api/notifications/push-token`
Registrar token para push notifications.

**Body:**
```json
{
  "token": "ExponentPushToken[xxx]",
  "platform": "ios"
}
```

---

### ⚙️ App Configuration

#### `GET /api/app/config`
Obtener configuración de la app (llamar al iniciar).

**Response:**
```json
{
  "success": true,
  "data": {
    "minAppVersion": "1.0.0",
    "currentAppVersion": "1.2.0",
    "forceUpdate": false,
    "maintenanceMode": false,
    "featuredCategories": ["nature", "adventure"],
    "featuredRegions": ["cajon-del-maipo", "san-pedro-de-atacama"],
    "commissionRate": 0.15,
    "minBookingAdvance": 24,
    "maxParticipantsDefault": 15,
    "supportEmail": "soporte@tourline.com",
    "supportPhone": "+56912345678",
    "socialLinks": {
      "instagram": "https://instagram.com/tourline",
      "facebook": "https://facebook.com/tourline"
    },
    "termsUrl": "https://tourline.com/terms",
    "privacyUrl": "https://tourline.com/privacy",
    "defaultCurrency": "CLP",
    "defaultLanguage": "es"
  }
}
```

#### `GET /api/app/check-version`
Verificar si necesita actualización.

**Query params:** `version` (current app version)

**Response:**
```json
{
  "success": true,
  "data": {
    "needsUpdate": true,
    "forceUpdate": false,
    "latestVersion": "1.2.0",
    "updateUrl": "https://apps.apple.com/..."
  }
}
```

---

### 🏠 Home Feed (Endpoint Combinado)

#### `GET /api/home`
Un solo endpoint para cargar todo el Home screen.

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "uuid",
        "title": "Verano en Patagonia",
        "imageUrl": "https://...",
        "actionType": "region",
        "actionValue": "patagonia"
      }
    ],
    "featuredTours": [
      {
        "id": "uuid",
        "title": "Trekking El Morado",
        "slug": "trekking-el-morado",
        "coverImage": "https://...",
        "price": 45000,
        "currency": "CLP",
        "rating": 4.8,
        "reviewCount": 124,
        "duration": 300,
        "city": "Cajón del Maipo",
        "company": {
          "id": "uuid",
          "name": "Santiago Tours"
        }
      }
    ],
    "featuredRegions": [
      {
        "id": "uuid",
        "name": "Cajón del Maipo",
        "slug": "cajon-del-maipo",
        "imageUrl": "https://...",
        "tourCount": 15
      }
    ],
    "recentlyViewed": [],  // Solo si está autenticado
    "recommendations": []  // Basado en historial
  }
}
```

**Beneficio:** Reduce de 4-5 requests a 1 sola llamada al cargar Home.

---

## 🔄 Actualizar Booking (Recordatorio)

El endpoint `POST /api/bookings` debe recibir:

```json
{
  "tourId": "uuid",           // ⚠️ NO guideId
  "date": "2026-01-20",
  "startTime": "08:00",
  "participants": 2,          // ⚠️ NO groupSize
  "specialRequests": "...",
  "userPhone": "+56..."
}
```

Y debe:
1. Verificar disponibilidad en `tour_availability`
2. Incrementar `spots_booked`
3. Si `spots_booked >= spots_total`, cambiar status a 'FULL'
4. Crear registro en `bookings`

---

### 🏢 Companies (Organizaciones)

> **Prioridad:** 🔴 Alta - Requerido para CompanyDetailScreen

#### `GET /api/companies/:idOrSlug`
Obtener detalles de una empresa/organización.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Santiago Tours",
    "slug": "santiago-tours",
    "description": "Somos una empresa de turismo aventura con más de 10 años de experiencia...",
    "logoUrl": "https://...",
    "coverImage": "https://...",
    "email": "contacto@santiagotours.cl",
    "phone": "+56912345678",
    "website": "https://santiagotours.cl",
    "address": "Av. Providencia 1234, Santiago",
    "city": "Santiago",
    "country": "Chile",
    "rating": 4.8,
    "reviewCount": 234,
    "tourCount": 12,
    "yearsActive": 10,
    "certifications": ["SERNATUR", "Safe Travels"],
    "socialLinks": {
      "instagram": "https://instagram.com/santiagotours",
      "facebook": "https://facebook.com/santiagotours"
    },
    "operatingHours": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "saturday": "10:00-14:00",
      "sunday": "closed"
    },
    "isVerified": true,
    "createdAt": "2020-03-15T..."
  }
}
```

#### `GET /api/companies/:id/tours`
Listar tours de una empresa.

**Query params:** `page`, `limit`, `category`, `featured`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Trekking Cajón del Maipo",
      "slug": "trekking-cajon-del-maipo",
      "coverImage": "https://...",
      "price": 45000,
      "currency": "CLP",
      "duration": 300,
      "rating": 4.7,
      "reviewCount": 89,
      "city": "Cajón del Maipo",
      "featured": true
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "totalPages": 2
  }
}
```

#### `GET /api/companies/:id/reviews`
Listar reseñas de una empresa.

**Query params:** `page`, `limit`, `rating` (filtrar por estrellas)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "María González",
      "userAvatar": "https://...",
      "tourId": "uuid",
      "tourTitle": "Trekking El Morado",
      "rating": 5,
      "comment": "Excelente experiencia, muy profesionales.",
      "response": "Gracias María, ¡fue un placer!",
      "responseAt": "2026-01-10T...",
      "images": ["https://..."],
      "createdAt": "2026-01-08T..."
    }
  ],
  "meta": {
    "total": 234,
    "averageRating": 4.8,
    "distribution": {
      "5": 180,
      "4": 40,
      "3": 10,
      "2": 3,
      "1": 1
    }
  }
}
```

#### `GET /api/companies/:id/guides`
Listar guías certificados de una empresa.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "avatar": "https://...",
      "rating": 4.9,
      "specialties": ["trekking", "climbing"],
      "languages": ["es", "en"],
      "tourCount": 156
    }
  ]
}
```

---

### ⭐ Tour Reviews (Reseñas de Tours)

> **Prioridad:** 🟡 Media - Necesario para mostrar reseñas en DetailsScreen

#### `GET /api/tours/:id/reviews`
Listar reseñas de un tour específico.

**Query params:** `page`, `limit`, `rating`, `sort` (recent/highest/lowest)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "Carlos Mendoza",
        "avatar": "https://..."
      },
      "rating": 5,
      "title": "Experiencia inolvidable",
      "comment": "El tour superó todas mis expectativas...",
      "images": ["https://..."],
      "helpfulCount": 12,
      "response": {
        "text": "Gracias Carlos, nos alegra que hayas disfrutado!",
        "authorName": "Santiago Tours",
        "createdAt": "2026-01-12T..."
      },
      "bookingDate": "2026-01-05",
      "createdAt": "2026-01-08T..."
    }
  ],
  "meta": {
    "total": 89,
    "averageRating": 4.7,
    "distribution": {
      "5": 60,
      "4": 20,
      "3": 6,
      "2": 2,
      "1": 1
    }
  }
}
```

#### `POST /api/tours/:id/reviews`
Crear reseña de un tour (requiere haber completado una reserva).

> **Auth requerida:** Bearer token

**Body:**
```json
{
  "rating": 5,
  "title": "Increíble experiencia",
  "comment": "El guía fue muy profesional y el paisaje espectacular...",
  "images": ["base64...", "base64..."],
  "bookingId": "uuid"
}
```

**Validaciones:**
- Usuario debe tener una reserva COMPLETED para este tour
- Solo una reseña por booking
- Rating: 1-5
- Comment: min 10 caracteres

#### `POST /api/tours/:id/reviews/:reviewId/helpful`
Marcar reseña como útil.

> **Auth requerida:** Bearer token

#### `DELETE /api/tours/:id/reviews/:reviewId/helpful`
Quitar marca de útil.

---

### 🔍 Search (Búsqueda Unificada)

> **Prioridad:** 🟢 Baja - Opcional, mejora UX

#### `GET /api/search`
Búsqueda unificada de tours, guías, empresas y regiones.

**Query params:** `q` (query), `type` (tour/guide/company/region/all), `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "tours": [
      {
        "id": "uuid",
        "type": "tour",
        "title": "Trekking El Morado",
        "subtitle": "Cajón del Maipo",
        "image": "https://...",
        "price": 45000
      }
    ],
    "companies": [
      {
        "id": "uuid",
        "type": "company",
        "name": "Santiago Tours",
        "subtitle": "12 tours disponibles",
        "image": "https://..."
      }
    ],
    "regions": [
      {
        "id": "uuid",
        "type": "region",
        "name": "Cajón del Maipo",
        "subtitle": "45 tours",
        "image": "https://..."
      }
    ]
  },
  "meta": {
    "query": "maipo",
    "totalResults": 15
  }
}
```

---

## 📌 Prioridades de Implementación

### Semana 1 - Crítico
1. ✅ Tabla `tour_availability` + lógica de generación
2. ✅ `GET /api/bookings/tour/:tourId/calendar`
3. ✅ Actualizar `POST /api/bookings` para usar availability
4. ⬜ **Companies API** (`GET /api/companies/:id`, `/tours`, `/reviews`, `/guides`)

### Semana 2 - Alto Valor
5. ✅ Tabla `favorites` + endpoints
6. ✅ Tabla `regions` + endpoints básicos
7. ✅ `GET /api/home` endpoint combinado
8. ⬜ **Tour Reviews** (`GET/POST /api/tours/:id/reviews`)

### Semana 3 - Nice to Have
9. ✅ Tabla `banners` + endpoints
10. ✅ `notifications` sistema completo
11. ✅ `app_settings` configuración remota
12. ⬜ Unified Search (`GET /api/search`)

---

## ❓ Preguntas para Clarificar

1. **Generación de disponibilidad:** ¿Job nocturno o bajo demanda?
2. **Push notifications:** ¿Firebase Cloud Messaging o Expo Push?
3. **Caché:** ¿Redis para el Home feed?
4. **Rate limiting:** ¿Límites por endpoint?

---

*Documento generado para el equipo de backend de Tourline.*
*Última actualización: Enero 2026*

