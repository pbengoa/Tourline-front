# 🔧 TODOS los Endpoints que Necesitan Permitir PROVIDER

## ⚠️ Problema Global

**TODOS** los endpoints bajo `/admin/*` están validando `role === 'ADMIN'` únicamente.

**Necesitan permitir también `role === 'PROVIDER'`**, pero filtrando datos según el rol.

---

## 📋 Lista Completa de Endpoints a Modificar

### 1. Dashboard ⭐ CRÍTICO
```
GET /admin/dashboard
```
**Estado:** ❌ Bloqueado para providers  
**Prioridad:** 🔥 URGENTE  
**Ver:** `docs/BACKEND_DASHBOARD_FIX.md`

---

### 2. Tours (Gestión de Tours)

```
GET    /admin/tours              ← Listar tours
GET    /admin/tours/:id          ← Ver un tour
POST   /admin/tours              ← Crear tour
PUT    /admin/tours/:id          ← Actualizar tour
DELETE /admin/tours/:id          ← Eliminar tour
POST   /admin/tours/:id/publish  ← Publicar tour
POST   /admin/tours/:id/unpublish ← Despublicar tour
```

**Lógica requerida:**
- **ADMIN:** Ve y gestiona TODOS los tours
- **PROVIDER:** Ve y gestiona solo SUS tours

---

### 3. Guías (Gestión de Guías)

```
GET    /admin/guides              ← Listar guías
GET    /admin/guides/:id          ← Ver un guía
POST   /admin/guides              ← Crear guía
PUT    /admin/guides/:id          ← Actualizar guía
DELETE /admin/guides/:id          ← Eliminar guía
POST   /admin/guides/:id/verify   ← Verificar guía
POST   /admin/guides/:id/activate   ← Activar guía
POST   /admin/guides/:id/deactivate ← Desactivar guía
POST   /admin/guides/invite       ← Invitar guía
```

**Lógica requerida:**
- **ADMIN:** Ve y gestiona TODOS los guías del sistema
- **PROVIDER:** Ve y gestiona solo guías de SU empresa

---

### 4. Reservas (Bookings)

```
GET    /admin/bookings             ← Listar reservas
GET    /admin/bookings/:id         ← Ver una reserva
GET    /admin/bookings/stats       ← Estadísticas de reservas
PATCH  /admin/bookings/:id/confirm ← Confirmar reserva
PATCH  /admin/bookings/:id/cancel  ← Cancelar reserva
PATCH  /admin/bookings/:id/complete ← Completar reserva
```

**Lógica requerida:**
- **ADMIN:** Ve y gestiona TODAS las reservas
- **PROVIDER:** Ve y gestiona solo reservas de SUS tours

---

### 5. Empresa/Organización

```
GET /admin/company     ← Ver datos de la empresa
PUT /admin/company     ← Actualizar datos de la empresa
```

**Lógica requerida:**
- **ADMIN:** Ve TODAS las empresas (o la plataforma global)
- **PROVIDER:** Ve solo SU empresa

---

## 🔧 Implementación General

### Middleware Común para TODOS los Endpoints

```javascript
// middleware/checkAdminOrProvider.js
const checkAdminOrProvider = async (req, res, next) => {
  try {
    const user = req.user; // Del JWT

    // 1. Verificar roles permitidos
    if (!['ADMIN', 'PROVIDER'].includes(user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso' 
      });
    }

    // 2. Si es PROVIDER, obtener y guardar el providerId
    if (user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: user.id }
      });

      if (!provider) {
        return res.status(404).json({ 
          error: 'Provider no encontrado' 
        });
      }

      // Guardar en req para usar en la ruta
      req.providerId = provider.id;
      req.companyId = provider.companyId; // Si tienes este campo
    }

    // 3. Si es ADMIN, no necesita filtro
    req.isAdmin = user.role === 'ADMIN';

    next();
  } catch (error) {
    console.error('Error in checkAdminOrProvider:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = { checkAdminOrProvider };
```

---

### Ejemplo de Uso en Rutas

#### GET /admin/tours

```javascript
router.get('/admin/tours', checkAdminOrProvider, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    // Construir filtro base
    let where = {};

    // Filtrar por status si se proporciona
    if (status) {
      where.status = status;
    }

    // Filtrar por búsqueda si se proporciona
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 🎯 FILTRO POR ROL
    if (!req.isAdmin) {
      // Si NO es admin, filtrar por providerId
      where.providerId = req.providerId;
    }
    // Si es admin, no filtramos (ve todo)

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          guides: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          company: { select: { id: true, name: true, logoUrl: true } },
          _count: { select: { bookings: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tour.count({ where })
    ]);

    return res.json({
      success: true,
      data: tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return res.status(500).json({ error: 'Error al obtener tours' });
  }
});
```

#### POST /admin/tours (Crear Tour)

```javascript
router.post('/admin/tours', checkAdminOrProvider, async (req, res) => {
  try {
    const data = req.body;

    // 🎯 Si es PROVIDER, asignar automáticamente su providerId
    if (!req.isAdmin) {
      data.providerId = req.providerId;
    } else {
      // Si es ADMIN, debe especificar a qué provider pertenece
      if (!data.providerId) {
        return res.status(400).json({ 
          error: 'El campo providerId es requerido' 
        });
      }
    }

    const tour = await prisma.tour.create({
      data: {
        ...data,
        status: 'DRAFT' // Siempre empieza como borrador
      },
      include: {
        guides: true,
        company: true
      }
    });

    return res.json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    return res.status(500).json({ error: 'Error al crear tour' });
  }
});
```

#### GET /admin/tours/:id (Ver Un Tour)

```javascript
router.get('/admin/tours/:id', checkAdminOrProvider, async (req, res) => {
  try {
    const { id } = req.params;

    // Construir filtro
    let where = { id };

    // 🎯 Si NO es admin, verificar que el tour pertenezca al provider
    if (!req.isAdmin) {
      where.providerId = req.providerId;
    }

    const tour = await prisma.tour.findFirst({
      where,
      include: {
        guides: true,
        company: true,
        _count: { select: { bookings: true } }
      }
    });

    if (!tour) {
      return res.status(404).json({ 
        error: 'Tour no encontrado o no tienes permisos para verlo' 
      });
    }

    return res.json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return res.status(500).json({ error: 'Error al obtener tour' });
  }
});
```

#### DELETE /admin/tours/:id (Eliminar Tour)

```javascript
router.delete('/admin/tours/:id', checkAdminOrProvider, async (req, res) => {
  try {
    const { id } = req.params;

    // 🎯 Verificar que el tour pertenezca al provider (si no es admin)
    if (!req.isAdmin) {
      const tour = await prisma.tour.findFirst({
        where: { 
          id,
          providerId: req.providerId 
        }
      });

      if (!tour) {
        return res.status(404).json({ 
          error: 'Tour no encontrado o no tienes permisos para eliminarlo' 
        });
      }
    }

    await prisma.tour.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Tour eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return res.status(500).json({ error: 'Error al eliminar tour' });
  }
});
```

---

## ✅ Checklist de Implementación

### Paso 1: Crear Middleware
- [ ] Crear `middleware/checkAdminOrProvider.js`
- [ ] Probar middleware con usuario ADMIN
- [ ] Probar middleware con usuario PROVIDER
- [ ] Probar middleware con usuario TOURIST (debe denegar)

### Paso 2: Actualizar Endpoints
- [ ] `/admin/dashboard` ⭐ URGENTE
- [ ] `/admin/tours` (todos los métodos)
- [ ] `/admin/guides` (todos los métodos)
- [ ] `/admin/bookings` (todos los métodos)
- [ ] `/admin/company` (GET y PUT)

### Paso 3: Testing
- [ ] Login como PROVIDER
- [ ] Verificar que puede acceder al dashboard
- [ ] Verificar que solo ve SUS tours
- [ ] Verificar que solo ve SUS guías
- [ ] Verificar que solo ve SUS reservas
- [ ] Intentar acceder a tour de otro provider (debe denegar)
- [ ] Login como ADMIN
- [ ] Verificar que ve TODO el sistema
- [ ] Verificar que puede editar cualquier tour
- [ ] Login como TOURIST
- [ ] Verificar que NO puede acceder a ningún endpoint /admin/*

---

## 🎯 Resumen Ejecutivo

### Problema:
Todos los endpoints `/admin/*` solo permiten `role === 'ADMIN'`

### Solución:
1. Crear middleware que acepte `ADMIN` y `PROVIDER`
2. Obtener `providerId` cuando es provider
3. Filtrar todas las queries con `providerId` cuando NO es admin
4. ADMIN sigue viendo TODO

### Endpoints Críticos:
1. ⭐ `/admin/dashboard` (URGENTE)
2. `/admin/tours` (todos)
3. `/admin/guides` (todos)
4. `/admin/bookings` (todos)
5. `/admin/company`

### Testing:
```bash
# Como PROVIDER
curl -H "Authorization: Bearer <TOKEN_PROVIDER>" https://api.tourline.com/admin/dashboard
# ✅ Debe funcionar (200) con datos filtrados

# Como ADMIN
curl -H "Authorization: Bearer <TOKEN_ADMIN>" https://api.tourline.com/admin/dashboard
# ✅ Debe funcionar (200) con datos globales
```
