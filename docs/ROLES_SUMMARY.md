# 🎯 Resumen de Roles - Sistema Simplificado

Sistema simplificado a **4 roles únicos**.

---

## 📊 Los 4 Roles

### 1️⃣ Tourist (Turista)
- **Backend:** `USER` o `TOURIST`
- **Frontend:** `tourist`
- **Navegación:** RootNavigator
- **Qué ve:** Inicio, Buscar, Mensajes, Favoritos, Perfil
- **Qué hace:** Busca y reserva tours

---

### 2️⃣ Guide (Guía)
- **Backend:** `GUIDE`
- **Frontend:** `guide`
- **Navegación:** GuideNavigator
- **Qué ve:** Explorar, Mis Tours, Buscar, Mensajes, Perfil
- **Qué hace:** Ofrece servicios como guía, ve tours asignados

---

### 3️⃣ Provider (Proveedor/Empresa)
- **Backend:** `PROVIDER`
- **Frontend:** `provider`
- **Navegación:** ProviderNavigator
- **Qué ve:** Dashboard, Tours, Guías, Mensajes, Perfil
- **Qué hace:** Crea y gestiona **sus propios** tours, gestiona su equipo

**IMPORTANTE:** Provider solo ve **sus datos**, no los de otros proveedores.

---

### 4️⃣ Admin (Administrador de la Plataforma)
- **Backend:** `ADMIN`
- **Frontend:** `admin`
- **Navegación:** AdminNavigator
- **Qué ve:** Dashboard, Tours (globales), Reservas (globales), Guías, Configuración
- **Qué hace:** Ve **TODO el sistema**, aprueba proveedores, gestiona la plataforma completa

**IMPORTANTE:** Admin ve **TODO**, de todas las organizaciones y proveedores.

---

## ✅ Cambios Realizados

### Frontend

1. **Tipos actualizados:**
   - `src/types/user.ts`: Eliminado `super_admin`
   - `src/services/authService.ts`: Eliminado `super_admin` del mapeo
   
2. **Funciones actualizadas:**
   - `authService.isAdmin()`: Ahora solo verifica `role === 'admin'`
   - `AuthContext`: Eliminadas referencias a `super_admin`

3. **Logs de debug agregados:**
   - `AppNavigator` ahora muestra en consola qué navegación se usa

4. **Documentación actualizada:**
   - `docs/BACKEND_ROLES.md`: Modelo simplificado de 4 roles
   - `docs/USER_ROLES.md`: Actualizado permisos y descripciones
   - `docs/ROLES_SUMMARY.md`: Este documento (resumen rápido)

---

## 🔧 Para el Backend

### 1. Roles válidos

Solo acepta estos 4 valores:
```typescript
role: 'USER' | 'TOURIST' | 'GUIDE' | 'PROVIDER' | 'ADMIN'
```

⚠️ **NO usar:** `SUPER_ADMIN` (eliminado)

---

### 2. Registro de Provider

Cuando alguien se registra como provider:

```javascript
// POST /auth/register-provider
const user = await prisma.user.create({
  data: {
    email: data.email,
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'PROVIDER',  // ← IMPORTANTE: No 'USER', debe ser 'PROVIDER'
    emailVerified: false
  }
});
```

---

### 3. Respuestas de autenticación

**SIEMPRE incluir el campo `role` en:**
- `POST /auth/register` → `role: 'USER'`
- `POST /auth/register-provider` → `role: 'PROVIDER'`
- `POST /auth/login` → `role: user.role`
- `GET /auth/me` → `role: user.role`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PROVIDER"  // ← Siempre incluir
  }
}
```

---

### 4. Crear Admin

**Manual en base de datos:**
```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@tourline.com';
```

No hay registro público para admins.

---

## 🧪 Testing

### Verificar que un Provider ve su dashboard

1. Registrar como provider:
```bash
POST /auth/register-provider
{
  "email": "test@example.com",
  "type": "company",
  ...
}
```

2. Login y verificar consola del frontend:
```
🔀 AppNavigator - Navigation Decision: {
  userRole: "provider",     // ← Debe decir "provider"
  isProvider: true,         // ← Debe ser true
  isAuthenticated: true,
  isEmailVerified: true
}
➡️  Showing: ProviderNavigator (role: provider)
```

3. Debe ver estos tabs:
   - 🏠 Inicio (Dashboard)
   - 🗺️ Tours
   - 👥 Guías
   - 💬 Mensajes
   - 🏢 Perfil

---

### Verificar que un Admin ve todo

1. Crear admin manualmente en DB:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@tourline.com';
```

2. Login y verificar consola:
```
🔀 AppNavigator - Navigation Decision: {
  userRole: "admin",        // ← Debe decir "admin"
  isAdmin: true,            // ← Debe ser true
  isAuthenticated: true
}
➡️  Showing: AdminNavigator (role: admin)
```

3. Debe ver estos tabs:
   - 📊 Dashboard (con métricas globales)
   - 🗺️ Tours (de todos los proveedores)
   - 📅 Reservas (globales)
   - 👥 Guías (de todas las organizaciones)
   - ⚙️ Configuración

---

## 🐛 Problemas Comunes

### ❌ Provider ve vista de turista

**Causa:** Backend asigna `role: 'USER'` en vez de `role: 'PROVIDER'`

**Solución:** Ver punto 2 arriba ("Registro de Provider")

---

### ❌ Role no aparece en respuesta

**Causa:** Endpoint no incluye el campo `role`

**Solución:** Ver punto 3 arriba ("Respuestas de autenticación")

---

## 📚 Documentos Relacionados

- `docs/BACKEND_ROLES.md` - Especificación completa para backend
- `docs/USER_ROLES.md` - Descripción detallada de cada rol
- `docs/PROVIDER_BACKEND_SPEC.md` - Endpoints de providers

---

## 🎯 Checklist Backend

- [ ] Eliminar referencias a `SUPER_ADMIN`
- [ ] Asegurar que `POST /auth/register-provider` asigna `role: 'PROVIDER'`
- [ ] Incluir campo `role` en todas las respuestas de autenticación
- [ ] Crear usuario admin manualmente en DB
- [ ] Probar cada rol y verificar logs del frontend
