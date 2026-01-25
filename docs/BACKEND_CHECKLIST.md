# ✅ Backend Implementation Checklist

Tareas para el equipo de backend con prioridades.

---

## 🔴 PRIORIDAD ALTA - Para funcionalidad básica

### 1. Recuperación de Contraseña 🔑 CRÍTICO

Archivo: `docs/PASSWORD_RESET_SPEC.md`

**Endpoints:**
- [ ] `POST /auth/forgot-password` - Solicitar reset (envía email)
- [ ] `POST /auth/reset-password` - Cambiar contraseña con token

**Base de datos:**
- [ ] Reutilizar tabla `verification_codes` con type: 'password_reset'
- [ ] O crear tabla `password_reset_tokens` (si no usan la otra)

**Email:**
- [ ] Template con enlace seguro (token en URL)
- [ ] Token aleatorio de 32 bytes (o código de 6 dígitos)
- [ ] Expira en 1 hora

**Seguridad:**
- [ ] NO revelar si email existe (retornar siempre success)
- [ ] Rate limiting (1 solicitud/60s por email)
- [ ] Validar contraseña fuerte (8+ chars, mayúsculas, minúsculas, números)
- [ ] Token solo se puede usar una vez

---

### 2. Verificación de Email ✅ CRÍTICO

Archivo: `docs/EMAIL_VERIFICATION_SPEC.md`

**Endpoints:**
- [ ] `POST /auth/verify-email` - Verificar código
- [ ] `POST /auth/resend-verification` - Reenviar código

**Base de datos:**
- [ ] Agregar campo `email_verified` a `users`
- [ ] Crear tabla `verification_codes`

**Modificar respuestas:**
- [ ] Incluir `emailVerified` en `/auth/register`
- [ ] Incluir `emailVerified` en `/auth/login`
- [ ] Incluir `emailVerified` en `/auth/me`

**Email:**
- [ ] Configurar envío de emails (SendGrid/SES)
- [ ] Template de email con código de 6 dígitos

**Seguridad:**
- [ ] Rate limiting (1 reenvío/60s)
- [ ] Códigos expiran en 15 minutos
- [ ] Job de limpieza de usuarios no verificados (7 días)

---

### 3. Sistema de Proveedores ⚠️ IMPORTANTE

Archivo: `docs/PROVIDER_BACKEND_SPEC.md`

**Endpoints Fase 1:**
- [ ] `POST /auth/register-provider` - Registro de proveedor
- [ ] `GET /providers/me` - Obtener mi perfil
- [ ] `PATCH /providers/me` - Actualizar perfil
- [ ] `GET /providers/me/documents` - Listar documentos
- [ ] `POST /providers/me/documents` - Subir documento (multipart)
- [ ] `DELETE /providers/me/documents/:id` - Eliminar documento
- [ ] `GET /providers/me/verification-status` - Estado de verificación
- [ ] `POST /providers/me/request-verification` - Solicitar revisión

**Base de datos:**
- [ ] Crear tabla `providers`
- [ ] Crear tabla `verification_documents`
- [ ] Agregar rol `PROVIDER` a `user_role`

**Storage:**
- [ ] Configurar S3/GCS para documentos
- [ ] Validar formato y tamaño de archivos (max 5MB)

**Emails:**
- [ ] Email de bienvenida a proveedor
- [ ] Email de aprobación
- [ ] Email de rechazo

---

### 4. Mensajes de Error Estandarizados ⚡ RÁPIDO

Archivo: `docs/PROVIDER_BACKEND_SPEC.md` (sección final)

**Formato de error:**
```json
{
  "success": false,
  "error": {
    "message": "Mensaje claro y amigable"
  }
}
```

**Mensajes específicos:**
- [ ] Email duplicado → "El email ya está registrado"
- [ ] RUT/RFC duplicado → "El RUT/RFC ya está registrado"
- [ ] Usuario no encontrado → "Usuario no encontrado"
- [ ] Contraseña incorrecta → "Contraseña incorrecta"
- [ ] Código inválido → "Código de verificación inválido"
- [ ] Código expirado → "El código ha expirado"

**Evitar:**
- ❌ NO enviar errores de Prisma directamente
- ❌ NO exponer stack traces en producción

---

## 🟡 PRIORIDAD MEDIA - Endpoints de Admin

### Panel de Admin para Proveedores

**Endpoints:**
- [ ] `GET /admin/providers` - Listar proveedores
- [ ] `GET /admin/providers/:id` - Ver detalle
- [ ] `PATCH /admin/providers/:id/verify` - Aprobar/rechazar
- [ ] `PATCH /admin/providers/:id/suspend` - Suspender
- [ ] `GET /admin/providers/pending` - Pendientes de revisión
- [ ] `PATCH /admin/documents/:id/review` - Aprobar/rechazar documento

**Notificaciones:**
- [ ] Push notification cuando proveedor es aprobado
- [ ] Email cuando proveedor es aprobado/rechazado

---

## 🟢 PRIORIDAD BAJA - Funcionalidades Avanzadas

### Perfiles de Guías (Fase 2)

**Endpoints:**
- [ ] `GET /providers/me/guides` - Listar guías
- [ ] `POST /providers/me/guides` - Crear guía
- [ ] `PATCH /providers/me/guides/:id` - Actualizar guía
- [ ] `DELETE /providers/me/guides/:id` - Eliminar guía

**Base de datos:**
- [ ] Crear tabla `guide_profiles`

---

### Recordatorios y Jobs

**Cron jobs:**
- [ ] Limpieza de códigos expirados (diario)
- [ ] Limpieza de usuarios no verificados (diario)
- [ ] Email recordatorio día 5 (opcional)
- [ ] Recordatorio 24h antes de tours (fase 2)

---

## 📝 TESTING RECOMENDADO

### Email Verification

- [ ] Registro → genera código → email enviado
- [ ] Código correcto → verifica → `email_verified = true`
- [ ] Código incorrecto → error claro
- [ ] Código expirado (>15 min) → error
- [ ] Reenvío → genera nuevo código, invalida anterior
- [ ] Rate limit → bloquea después de N intentos
- [ ] Login sin verificar → frontend bloquea acceso

### Provider Registration

- [ ] Registro individual → crea provider type: 'individual'
- [ ] Registro empresa → crea provider type: 'company'
- [ ] Email duplicado → error estandarizado
- [ ] RUT/RFC duplicado → error estandarizado
- [ ] Upload documento → S3 → URL guardada
- [ ] Solicitar verificación → status: 'in_review'

---

## ⏱️ ESTIMACIÓN DE TIEMPOS

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| Recuperación de Contraseña | 4-5 horas | 🔴 Crítico |
| Verificación de Email | 2-3 horas | 🔴 Crítico |
| Mensajes de Error | 30 min | 🔴 Crítico |
| Tabla Providers | 1 hora | 🟡 Alta |
| Endpoints Providers (básicos) | 3-4 horas | 🟡 Alta |
| Upload de documentos | 2 horas | 🟡 Alta |
| Panel Admin | 4-6 horas | 🟡 Media |
| Perfiles de Guías | 2-3 horas | 🟢 Baja |
| **TOTAL MVP** | **12-15 horas** | - |

---

## 📞 DUDAS FRECUENTES

**P: ¿Dónde guardar los códigos de verificación?**
R: Base de datos principal (tabla dedicada) o Redis con TTL. DB es más simple para MVP.

**P: ¿Enviar código por email o SMS?**
R: Email para MVP. SMS es más caro y requiere Twilio/similar.

**P: ¿Invalidar códigos anteriores al reenviar?**
R: Opcional. Puedes dejarlo para simplificar (solo verificar que no esté usado y no expirado).

**P: ¿Qué hacer si el email falla al enviarse?**
R: Loggear el error, pero retornar success al usuario. Permitir reenvío.

**P: ¿Los proveedores necesitan verificación manual Y de email?**
R: Sí. Primero email, luego documentos, luego admin aprueba.

---

## 🚀 ORDEN RECOMENDADO

1. **Día 1:** 
   - Recuperación de contraseña (4-5h)
   - Email verification (2-3h)
   - Mensajes de error (30 min)
2. **Día 2:** Tabla providers + registro básico
3. **Día 3:** Upload documentos + endpoints de perfil
4. **Día 4:** Panel admin para aprobar proveedores

---

## 📞 CONTACTO

Para dudas sobre implementación, revisar archivos:
- `docs/PASSWORD_RESET_SPEC.md` - Recuperación de contraseña
- `docs/EMAIL_VERIFICATION_SPEC.md` - Verificación de email
- `docs/PROVIDER_BACKEND_SPEC.md` - Sistema de proveedores
- `docs/BACKEND_SPEC.md` - Otros endpoints

Contacto frontend: [email del equipo]
