# 👥 Roles de Usuario en Tourline

Documentación completa de los roles de usuario y sus permisos/vistas.

---

## 🎭 Roles Disponibles

| Rol | Valor | Descripción |
|-----|-------|-------------|
| **Turista** | `tourist` | Usuario normal que busca y reserva tours |
| **Guía** | `guide` | Guía independiente que ofrece sus servicios |
| **Proveedor** | `provider` | Empresa o guía que gestiona tours y otros guías |
| **Admin** | `admin` | Administrador de la plataforma con acceso completo a TODO |

---

## 📱 Navegación por Rol

### 1. Turista (`tourist`) - RootNavigator

**Tabs principales:**
- 🏠 **Inicio** - Explorar tours disponibles
- 🔍 **Buscar** - Buscar por ciudad, categoría, etc.
- 💬 **Mensajes** - Chat con guías/empresas
- ⭐ **Favoritos** - Tours guardados
- 👤 **Perfil** - Configuración personal

**Permisos:**
- ✅ Buscar y explorar tours
- ✅ Reservar tours
- ✅ Ver historial de reservas
- ✅ Guardar favoritos
- ✅ Chat con proveedores/guías
- ❌ Crear tours
- ❌ Gestionar guías

---

### 2. Guía (`guide`) - GuideNavigator

**Tabs principales:**
- 🧭 **Explorar** - Tours disponibles para unirse
- 💼 **Mis Tours** - Tours donde participa como guía
- 🔍 **Buscar** - Oportunidades de trabajo
- 💬 **Mensajes** - Chat con turistas y empresas
- 👤 **Perfil** - Perfil público como guía

**Permisos:**
- ✅ Ver tours disponibles
- ✅ Aplicar a tours como guía
- ✅ Ver mis tours asignados
- ✅ Chat con turistas y empresas
- ✅ Gestionar perfil profesional
- ✅ Ver calendario de disponibilidad
- ❌ Crear tours (solo empresas/providers)
- ❌ Gestionar otros guías

**Flujo de registro:**
1. Selecciona "Guía Independiente"
2. Llena formulario extendido (RUT, teléfono, ciudad)
3. Verifica email
4. Sube documentos de verificación
5. Espera aprobación (24-48h)
6. Perfil activado

---

### 3. Proveedor (`provider`) - ProviderNavigator

**Tipos de proveedor:**
- **Individual:** Guía que crea sus propios tours
- **Empresa:** Compañía que gestiona múltiples guías y tours

**Tabs principales:**
- 🏠 **Inicio** - Dashboard con estadísticas
- 🗺️ **Tours** - Gestión de tours (crear, editar, eliminar)
- 👥 **Guías** - Gestión de equipo (solo empresas)
- 💬 **Mensajes** - Chat con clientes
- 🏢 **Perfil** - Información de empresa/perfil profesional

**Permisos:**
- ✅ Crear y gestionar tours
- ✅ Ver estadísticas y reportes
- ✅ Gestionar reservas
- ✅ Chat con clientes
- ✅ Subir/gestionar documentos
- ✅ Ver estado de verificación
- ✅ (Empresas) Gestionar guías del equipo
- ❌ Acceso a panel de admin global

**Flujo de registro:**
1. Selecciona "Guía Independiente" o "Empresa de Tours"
2. Llena formulario completo (nombre empresa, RUT, dirección)
3. Verifica email
4. Pantalla "Pending Approval" (requiere verificación manual)
5. Sube documentos requeridos
6. Admin revisa y aprueba
7. Cuenta activada

---

### 4. Admin (`admin`) - AdminNavigator

**Tabs principales:**
- 📊 **Dashboard** - Métricas generales de TODA la plataforma
- 🗺️ **Tours** - Todos los tours del sistema (de todos los proveedores)
- 📅 **Reservas** - Todas las reservas (de todos los usuarios)
- 👥 **Guías** - Gestión de guías (de todas las organizaciones)
- ⚙️ **Configuración** - Settings del sistema

**Permisos:**
- ✅ Ver TODO el sistema (todas las organizaciones/proveedores)
- ✅ Aprobar/rechazar proveedores
- ✅ Revisar documentos de verificación
- ✅ Gestionar todos los tours (de todos los proveedores)
- ✅ Ver todas las reservas (globales)
- ✅ Gestionar usuarios
- ✅ Suspender/activar cuentas
- ✅ Configuración completa de la app

**Nota:** El Admin ve TODO, no está limitado a una organización específica.

---

## 🔐 Verificación por Rol

### Turista
- ✅ Verificación de email (obligatorio)
- ❌ No requiere documentos

### Guía
- ✅ Verificación de email (obligatorio)
- ✅ Documentos de identidad
- ✅ Certificaciones (opcional)
- ✅ Foto de perfil profesional
- ⏳ Revisión manual (24-48h)

### Proveedor
- ✅ Verificación de email (obligatorio)
- ✅ Documentos de empresa/RUT
- ✅ Licencia de operación
- ✅ Seguro de responsabilidad civil
- ✅ Certificados de guías (empresas)
- ⏳ Revisión manual exhaustiva (2-5 días)

---

## 🎯 Flujo de Autenticación

```
Login/Register
    ↓
Email verificado?
    ↓ No
EmailVerificationRequiredScreen (bloqueante)
    ↓ Sí
¿Qué rol tiene?
    ├─ Admin → AdminNavigator
    ├─ Provider → ProviderNavigator
    ├─ Guide → GuideNavigator
    └─ Tourist → RootNavigator (MainTabNavigator)
```

---

## 🔄 Cambio de Rol

### ¿Puede un usuario cambiar de rol?

**Sí, pero con limitaciones:**

1. **Tourist → Guide/Provider:**
   - Usuario inicia nuevo flujo de registro como proveedor
   - Requiere verificación completa
   - Mantiene cuenta de turista (puede alternar)

2. **Guide → Provider:**
   - Puede crear empresa y convertirse en provider
   - Requiere nueva verificación
   - Mantiene perfil de guía

3. **No permitido:**
   - ❌ Provider → Tourist (degradar)
   - ❌ Admin → Tourist (seguridad)

---

## 🧩 Implementación en Código

### AuthContext expone:

```typescript
const {
  user,                    // Usuario completo
  isAuthenticated,         // ¿Está logueado?
  isEmailVerified,        // ¿Email verificado?
  isAdmin,                // ¿Es admin?
  isGuide,                // ¿Es guide?
  isProvider,             // ¿Es provider?
  isTourist,              // ¿Es tourist?
  userRole,               // Rol actual: UserRole
} = useAuth();
```

### AppNavigator decide navegación:

```typescript
if (isAdmin) return <AdminNavigator />;
if (isProvider) return <ProviderNavigator />;
if (isGuide) return <GuideNavigator />;
return <RootNavigator />; // Tourist por defecto
```

---

## 📊 Comparación de Features

| Feature | Turista | Guía | Proveedor | Admin |
|---------|---------|------|-----------|-------|
| Buscar tours | ✅ | ✅ | ✅ | ✅ |
| Reservar tours | ✅ | ❌ | ❌ | ✅ |
| Crear tours | ❌ | ❌ | ✅ | ✅ |
| Gestionar guías | ❌ | ❌ | ✅ (empresa) | ✅ |
| Ver estadísticas | ❌ | ✅ (propias) | ✅ | ✅ |
| Chat | ✅ | ✅ | ✅ | ✅ |
| Favoritos | ✅ | ❌ | ❌ | ❌ |
| Dashboard | ❌ | ❌ | ✅ | ✅ |
| Aprobar usuarios | ❌ | ❌ | ❌ | ✅ |
| Config sistema | ❌ | ❌ | ❌ | ✅ |

---

## 🎨 UI/UX por Rol

### Colores principales:

- **Turista:** Verde principal (`#2D5A45`)
- **Guía:** Verde con acento azul
- **Proveedor:** Verde con acento amarillo/dorado
- **Admin:** Verde con acento rojo

### Iconos:

- Turista: 🎒 Mochila/Aventura
- Guía: 🧭 Brújula/Profesional
- Proveedor: 🏢 Empresa/Negocios
- Admin: ⚙️ Configuración/Control

---

## 📞 FAQs

**¿Puedo tener múltiples roles?**
No directamente. Cada cuenta tiene un rol principal. Pero un usuario puede crear múltiples cuentas con roles diferentes.

**¿Los guías pueden reservar tours como turistas?**
No con la misma cuenta. Necesitarían una cuenta de turista separada.

**¿Qué pasa si mi solicitud de proveedor es rechazada?**
Recibes un email con la razón y puedes corregir los documentos y volver a aplicar.

**¿Cuánto tarda la verificación?**
- Guía independiente: 24-48 horas
- Empresa: 2-5 días laborales

---

## 🔧 Testing

Para probar cada rol:

```bash
# Crear usuario de prueba
# Rol: tourist
email: test.tourist@example.com

# Rol: guide
email: test.guide@example.com

# Rol: provider
email: test.provider@example.com

# Rol: admin
email: test.admin@example.com
```

---

## 📚 Ver También

- `docs/PROVIDER_BACKEND_SPEC.md` - Spec completa de proveedores
- `docs/EMAIL_VERIFICATION_SPEC.md` - Verificación de email
- `src/context/AuthContext.tsx` - Implementación de roles
