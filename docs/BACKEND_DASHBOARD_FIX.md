# 🔧 FIX URGENTE: Dashboard - Acceso Denegado para Providers

## 🐛 Problema Actual

Cuando un usuario con rol `PROVIDER` intenta acceder al dashboard, recibe:

```
❌ Error 403 - Acceso denegado
"No tienes permisos de administrador"
```

---

## 📍 Endpoint Afectado

```
GET /admin/dashboard
```

**Validación actual (INCORRECTA):**
```javascript
// ❌ ESTO ESTÁ MAL:
if (user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

---

## ✅ Solución

### Permitir acceso a ADMIN y PROVIDER, pero filtrar datos según el rol:

```javascript
// ✅ CORREGIR ASÍ:
const allowedRoles = ['ADMIN', 'PROVIDER'];
if (!allowedRoles.includes(user.role)) {
  return res.status(403).json({ error: 'Acceso denegado' });
}

// Filtrar datos según el rol
let whereClause = {};

if (user.role === 'ADMIN') {
  // Admin ve TODO
  whereClause = {}; // Sin filtro
} else if (user.role === 'PROVIDER') {
  // Provider ve solo sus datos
  const provider = await prisma.provider.findUnique({
    where: { userId: user.id }
  });
  
  if (!provider) {
    return res.status(404).json({ error: 'Provider no encontrado' });
  }
  
  whereClause = {
    providerId: provider.id  // O companyId: provider.companyId, según tu modelo
  };
}
```

---

## 📊 Datos que debe retornar según el rol

### Para ADMIN:
```json
{
  "stats": {
    "totalBookings": 1250,        // TODAS las reservas del sistema
    "totalRevenue": 45000000,     // TODO el revenue
    "totalUsers": 3500,           // TODOS los usuarios
    "activeTours": 180            // TODOS los tours
  },
  "recentBookings": [...],        // Todas las reservas recientes
  "topTours": [...]               // Los tours más populares globales
}
```

### Para PROVIDER:
```json
{
  "stats": {
    "totalBookings": 45,          // Solo reservas de SUS tours
    "totalRevenue": 1500000,      // Solo SU revenue
    "totalUsers": 120,            // Solo clientes que reservaron SUS tours
    "activeTours": 5              // Solo SUS tours activos
  },
  "recentBookings": [...],        // Solo reservas de SUS tours
  "topTours": [...]               // Solo SUS tours más populares
}
```

---

## 🔍 Ejemplo de implementación completa

```javascript
// GET /admin/dashboard
router.get('/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // Del JWT

    // 1. Verificar roles permitidos
    const allowedRoles = ['ADMIN', 'PROVIDER'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder al dashboard' 
      });
    }

    // 2. Obtener provider ID si es provider
    let providerId = null;
    if (user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: user.id }
      });
      
      if (!provider) {
        return res.status(404).json({ 
          error: 'Provider no encontrado. Verifica que tu cuenta esté asociada a una empresa.' 
        });
      }
      
      providerId = provider.id;
    }

    // 3. Construir filtro según rol
    const tourFilter = providerId ? { providerId } : {};
    const bookingFilter = providerId ? { tour: { providerId } } : {};

    // 4. Obtener estadísticas
    const [
      totalBookings,
      totalRevenue,
      activeTours,
      recentBookings,
      topTours
    ] = await Promise.all([
      // Total de reservas (filtrado por provider si aplica)
      prisma.booking.count({
        where: bookingFilter
      }),

      // Revenue total (filtrado por provider si aplica)
      prisma.booking.aggregate({
        where: {
          ...bookingFilter,
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
        _sum: { totalPrice: true }
      }),

      // Tours activos (filtrado por provider si aplica)
      prisma.tour.count({
        where: {
          ...tourFilter,
          status: 'PUBLISHED',
          isActive: true
        }
      }),

      // Reservas recientes (filtrado por provider si aplica)
      prisma.booking.findMany({
        where: bookingFilter,
        include: {
          tour: { select: { id: true, title: true, image: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          guide: { select: { id: true, firstName: true, lastName: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Top tours (filtrado por provider si aplica)
      prisma.tour.findMany({
        where: {
          ...tourFilter,
          status: 'PUBLISHED'
        },
        include: {
          _count: { select: { bookings: true } }
        },
        orderBy: {
          bookings: { _count: 'desc' }
        },
        take: 5
      })
    ]);

    // 5. Retornar datos formateados
    return res.json({
      success: true,
      data: {
        stats: {
          totalBookings,
          totalRevenue: totalRevenue._sum.totalPrice || 0,
          activeTours,
          totalUsers: 0 // Calcular según necesites
        },
        recentBookings: recentBookings.map(booking => ({
          id: booking.id,
          reference: booking.reference,
          tour: booking.tour,
          user: {
            id: booking.user.id,
            name: `${booking.user.firstName} ${booking.user.lastName}`,
            email: booking.user.email
          },
          guide: booking.guide ? {
            id: booking.guide.id,
            name: `${booking.guide.firstName} ${booking.guide.lastName}`,
            avatar: booking.guide.avatar
          } : null,
          date: booking.tourDate,
          status: booking.status,
          participants: booking.participants,
          totalPrice: booking.totalPrice
        })),
        topTours: topTours.map(tour => ({
          id: tour.id,
          title: tour.title,
          image: tour.image,
          bookingsCount: tour._count.bookings,
          rating: tour.rating,
          price: tour.price
        })),
        company: providerId ? {
          id: provider.id,
          name: provider.companyName || provider.name
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return res.status(500).json({ 
      error: 'Error al cargar el dashboard' 
    });
  }
});
```

---

## ✅ Checklist para el Backend

- [ ] Modificar el middleware del endpoint `/admin/dashboard` para aceptar `ADMIN` y `PROVIDER`
- [ ] Agregar lógica para obtener el `providerId` cuando `role === 'PROVIDER'`
- [ ] Filtrar todas las queries con `providerId` cuando aplica
- [ ] Probar con un usuario PROVIDER
- [ ] Probar con un usuario ADMIN
- [ ] Verificar que ADMIN ve TODO
- [ ] Verificar que PROVIDER solo ve SUS datos

---

## 🧪 Testing

### 1. Como PROVIDER:

```bash
# Login como provider
curl -X POST https://api.tourline.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"provider@test.com","password":"..."}'

# Obtener token de la respuesta

# Llamar al dashboard
curl -X GET https://api.tourline.com/admin/dashboard \
  -H "Authorization: Bearer <TOKEN_PROVIDER>"

# ✅ Debe retornar 200 con datos filtrados del provider
# ❌ NO debe retornar 403
```

### 2. Como ADMIN:

```bash
# Login como admin
curl -X POST https://api.tourline.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tourline.com","password":"..."}'

# Llamar al dashboard
curl -X GET https://api.tourline.com/admin/dashboard \
  -H "Authorization: Bearer <TOKEN_ADMIN>"

# ✅ Debe retornar 200 con datos globales (TODO el sistema)
```

---

## 🎯 Resumen TL;DR

**Problema:** `/admin/dashboard` solo acepta `role === 'ADMIN'`

**Solución:** 
1. Aceptar también `role === 'PROVIDER'`
2. Filtrar datos por `providerId` cuando es provider
3. Retornar TODO cuando es admin

**Endpoint:** `GET /admin/dashboard`

**Cambio en middleware:**
```javascript
// ❌ ANTES:
if (user.role !== 'ADMIN') return 403;

// ✅ AHORA:
if (!['ADMIN', 'PROVIDER'].includes(user.role)) return 403;
```
