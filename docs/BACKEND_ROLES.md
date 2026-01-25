# 🎭 Backend - Especificación de Roles

Guía para el equipo de backend sobre cómo asignar y manejar roles de usuario.

---

## 🚨 IMPORTANTE: Los 4 Roles del Sistema

### 👔 Admin (Administrador de la Plataforma)
**Quién:** TÚ (el dueño/administrador de Tourline)

**Rol:** `ADMIN`

**Qué hace:**
- ✅ Ver TODO el sistema (todas las organizaciones/proveedores)
- ✅ Aprobar/rechazar solicitudes de proveedores
- ✅ Revisar documentos de verificación
- ✅ Ver todas las reservas del sistema
- ✅ Gestionar todos los tours (de todos los proveedores)
- ✅ Ver métricas y estadísticas globales
- ✅ Suspender usuarios problemáticos
- ✅ Configurar la app

**NO puede:**
- ❌ Crear tours para vender (eso es un Provider)
- ❌ Ser guía en tours (eso es un Guide)

---

### 🏢 Provider (Proveedor/Empresa)
**Quién:** Empresas de turismo o guías que crean tours

**Rol:** `PROVIDER`

**Qué hace:**
- ✅ Crear y gestionar **solo sus propios** tours
- ✅ Ver **solo sus propias** reservas
- ✅ Gestionar su equipo de guías (si es empresa)
- ✅ Ver estadísticas de **sus** tours
- ✅ Chat con clientes

**NO puede:**
- ❌ Ver tours de otros proveedores
- ❌ Aprobar otros proveedores
- ❌ Ver reservas globales
- ❌ Acceder al panel de admin

---

### 🧑‍🏫 Guide (Guía Independiente)
**Quién:** Guías turísticos que ofrecen servicios

**Rol:** `GUIDE`

**Qué hace:**
- ✅ Ofrecer servicios como guía
- ✅ Ver tours asignados
- ✅ Chat con clientes
- ✅ Ver sus reservas

---

### 🧳 Tourist (Turista)
**Quién:** Usuarios que buscan y reservan tours

**Rol:** `USER` o `TOURIST`

**Qué hace:**
- ✅ Buscar tours
- ✅ Reservar tours
- ✅ Ver sus reservas
- ✅ Chat con proveedores
- ✅ Dejar reseñas

---

## 📊 Tabla de Roles

| Rol Backend | Rol Frontend | Navegación | Descripción |
|-------------|-------------|------------|-------------|
| `USER` o `TOURIST` | `tourist` | RootNavigator | Usuario que reserva tours |
| `GUIDE` | `guide` | GuideNavigator | Guía independiente |
| `PROVIDER` | `provider` | ProviderNavigator | Empresa/guía que crea tours |
| `ADMIN` | `admin` | AdminNavigator | Admin de la plataforma (ve TODO) |

---

## 🔧 Implementación Backend

### 1. Registro de Usuario Normal (Turista)

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "juan@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "USER",  // ← O "TOURIST"
      "emailVerified": false
    },
    "token": "jwt..."
  }
}
```

---

### 2. Registro de Provider (Empresa/Guía)

**Endpoint:** `POST /auth/register-provider`

**Request:**
```json
{
  "type": "company",  // o "individual"
  "email": "tours@example.com",
  "password": "password123",
  "firstName": "María",
  "lastName": "González",
  "companyName": "Tours Valparaíso",
  "taxId": "76.123.456-7",
  "phone": "+56912345678",
  "address": "Av. Principal 123",
  "city": "Valparaíso",
  "country": "Chile"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "tours@example.com",
      "firstName": "María",
      "lastName": "González",
      "role": "PROVIDER",  // ← IMPORTANTE: Asignar este rol
      "emailVerified": false
    },
    "provider": {
      "id": "uuid",
      "userId": "uuid",
      "type": "company",
      "companyName": "Tours Valparaíso",
      "status": "pending_verification"  // ← Requiere aprobación
    },
    "token": "jwt..."
  }
}
```

---

### 3. Asignación de Admin

**Manual en base de datos (recomendado):**
```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@tourline.com';
```

**Nota:** El rol ADMIN solo se asigna manualmente, no hay registro público para admins.

---

## 🔐 Mapeo de Roles

El frontend mapea automáticamente los roles del backend:

```typescript
// authService.ts - mapBackendRole()
const roleMap = {
  'USER': 'tourist',
  'TOURIST': 'tourist',
  'GUIDE': 'guide',
  'PROVIDER': 'provider',  // ← Importante
  'ADMIN': 'admin'
};
```

---

## ✅ Checklist Backend

### Para que un Provider vea su dashboard:

- [ ] Endpoint `POST /auth/register-provider` implementado
- [ ] Asignar `role: 'PROVIDER'` al crear el usuario
- [ ] Crear registro en tabla `providers` con `status: 'pending_verification'`
- [ ] **Incluir campo `role` en TODAS las respuestas:**
  - [ ] `POST /auth/register-provider`
  - [ ] `POST /auth/login`
  - [ ] `GET /auth/me`
- [ ] El rol debe ser EXACTAMENTE `'PROVIDER'` (mayúsculas)

---

## 🧪 Testing

### 1. Verificar que el rol se asigna correctamente

```bash
# Registrar como provider
POST /auth/register-provider
{
  "email": "test.provider@example.com",
  "password": "Test1234",
  "type": "individual",
  ...
}

# Verificar respuesta
{
  "user": {
    "role": "PROVIDER"  // ← Debe decir PROVIDER, no USER
  }
}
```

### 2. Verificar que login retorna el rol

```bash
# Login
POST /auth/login
{
  "email": "test.provider@example.com",
  "password": "Test1234"
}

# Verificar respuesta
{
  "user": {
    "role": "PROVIDER"  // ← Debe mantener el rol
  }
}
```

### 3. Verificar endpoint /auth/me

```bash
# Get user
GET /auth/me
Headers: { Authorization: "Bearer <token>" }

# Verificar respuesta
{
  "id": "uuid",
  "email": "test.provider@example.com",
  "role": "PROVIDER"  // ← Debe retornar el rol
}
```

---

## 🐛 Debug en Frontend

Si un provider ve la vista de turista en lugar de su dashboard:

### 1. Ver los logs en consola

El frontend ahora muestra logs de debug:

```
🔀 AppNavigator - Navigation Decision: {
  isAuthenticated: true,
  isEmailVerified: true,
  userRole: "tourist",  // ← Si dice "tourist" en vez de "provider", el backend no está asignando el rol
  isAdmin: false,
  isProvider: false,  // ← Debería ser true
  isGuide: false
}
➡️  Showing: RootNavigator (role: tourist - default)
```

### 2. Verificar datos del usuario

Agrega temporalmente en el ProfileScreen:

```typescript
console.log('User data:', user);
console.log('User role:', user?.role);
```

---

## 📋 Ejemplo de Flujo Completo

### Turista (Usuario Normal)

```
1. POST /auth/register
   role: "USER"
   
2. Email verification
   
3. Login → Frontend detecta role: "tourist"
   
4. Ve: RootNavigator (Inicio, Buscar, Mensajes, Favoritos, Perfil)
```

### Provider (Empresa)

```
1. POST /auth/register-provider
   role: "PROVIDER"  // ← CRÍTICO
   
2. Email verification
   
3. Pantalla "Pending Approval"
   
4. Admin aprueba
   
5. Login → Frontend detecta role: "provider"
   
6. Ve: ProviderNavigator (Dashboard, Tours, Guías, Mensajes, Perfil)
```

### Admin (Tú)

```
1. Manual: UPDATE users SET role = 'ADMIN'
   
2. Login → Frontend detecta role: "admin"
   
3. Ve: AdminNavigator (Dashboard con TODAS las organizaciones, Tours globales, Reservas globales, Guías, Config)
```

---

## ⚠️ Errores Comunes

### ❌ Provider ve vista de turista

**Problema:** Backend asignó `role: "USER"` en vez de `role: "PROVIDER"`

**Solución:**
```javascript
// En register-provider endpoint:
const user = await prisma.user.create({
  data: {
    ...userData,
    role: 'PROVIDER'  // ← No olvidar esto
  }
});
```

---

### ❌ Role no se retorna en /auth/me

**Problema:** El endpoint no incluye el campo `role`

**Solución:**
```javascript
// En /auth/me endpoint:
return {
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,  // ← Incluir siempre
  emailVerified: user.emailVerified
};
```

---

### ❌ Role cambia después de login

**Problema:** Login retorna `role: "USER"` aunque el usuario es PROVIDER

**Solución:**
```javascript
// En /auth/login endpoint:
const user = await prisma.user.findUnique({
  where: { email },
  include: {
    provider: true  // Incluir relación si existe
  }
});

return {
  user: {
    ...user,
    role: user.role  // Retornar el rol real, no hardcodeado
  }
};
```

---

## 📞 Resumen para el Backend

**Lo que necesitas hacer:**

1. En `POST /auth/register-provider`:
   ```javascript
   role: 'PROVIDER'  // Asignar este rol
   ```

2. En `POST /auth/login` y `GET /auth/me`:
   ```javascript
   return {
     user: {
       role: user.role  // Incluir siempre
     }
   }
   ```

3. Para crear un admin:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
   ```

4. Verificar con logs del frontend:
   ```
   🔀 AppNavigator - Navigation Decision
   userRole: "provider"  // ← Debe decir "provider"
   isProvider: true      // ← Debe ser true
   ```

---

## 📚 Documentos Relacionados

- `docs/PROVIDER_BACKEND_SPEC.md` - Spec completa de proveedores
- `docs/USER_ROLES.md` - Descripción de roles en frontend
- `docs/EMAIL_VERIFICATION_SPEC.md` - Verificación de email
