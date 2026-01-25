# 📧 Especificación Backend - Verificación de Email

## 🎯 Resumen

Sistema de verificación de email obligatorio para todos los usuarios antes de poder usar la aplicación.

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### 1. Agregar campo a `users`

```sql
-- Campo de verificación
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Campo para timestamp (opcional pero recomendado)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
```

---

### 2. Tabla de códigos de verificación

```sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) DEFAULT 'email_verification' 
    CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_verification_codes_user ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_code ON verification_codes(code, email);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at);
```

---

## 🔌 ENDPOINTS REQUERIDOS

### 1. POST /api/auth/verify-email

Verifica el email con un código de 6 dígitos.

**Request:**
```json
{
  "email": "usuario@email.com",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Email verificado correctamente",
    "user": {
      "id": "uuid",
      "email": "usuario@email.com",
      "emailVerified": true,
      "emailVerifiedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Errores:**

400 - Código inválido:
```json
{
  "success": false,
  "error": {
    "message": "Código de verificación inválido"
  }
}
```

400 - Código expirado:
```json
{
  "success": false,
  "error": {
    "message": "El código ha expirado"
  }
}
```

404 - Usuario no encontrado:
```json
{
  "success": false,
  "error": {
    "message": "Usuario no encontrado"
  }
}
```

**Lógica:**
1. Buscar código válido (email + code + no usado + no expirado)
2. Si existe:
   - Marcar `email_verified = true`
   - Set `email_verified_at = NOW()`
   - Marcar código como usado (`used_at = NOW()`)
   - Retornar usuario actualizado
3. Si no existe o expiró → error apropiado

---

### 2. POST /api/auth/resend-verification

Reenvía el código de verificación.

**Request:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Código de verificación enviado"
  }
}
```

**Errores:**

404 - Usuario no encontrado:
```json
{
  "success": false,
  "error": {
    "message": "Usuario no encontrado"
  }
}
```

400 - Ya verificado:
```json
{
  "success": false,
  "error": {
    "message": "Este email ya está verificado"
  }
}
```

429 - Rate limit:
```json
{
  "success": false,
  "error": {
    "message": "Demasiados intentos. Espera 60 segundos."
  }
}
```

**Lógica:**
1. Verificar que el usuario existe
2. Verificar que NO está ya verificado
3. **Rate limit:** máximo 1 reenvío cada 60 segundos por email
4. Invalidar códigos anteriores (opcional)
5. Generar nuevo código de 6 dígitos
6. Guardar con expiración de 15 minutos
7. Enviar email

---

## 📝 LÓGICA DE GENERACIÓN DE CÓDIGO

```javascript
// Generar código aleatorio de 6 dígitos
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Al registrar usuario:
async function createUser(data) {
  // 1. Crear usuario con email_verified = false
  const user = await db.user.create({
    data: {
      ...data,
      email_verified: false
    }
  });
  
  // 2. Generar código
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  
  // 3. Guardar código
  await db.verificationCode.create({
    data: {
      userId: user.id,
      email: user.email,
      code,
      type: 'email_verification',
      expiresAt
    }
  });
  
  // 4. Enviar email
  await sendVerificationEmail(user.email, code);
  
  return user;
}
```

---

## 📧 EMAIL DE VERIFICACIÓN

**Asunto:** `Verifica tu cuenta en Tourline`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .code-box { 
      background: #f5f5f5; 
      padding: 30px; 
      text-align: center; 
      border-radius: 8px;
      margin: 20px 0;
    }
    .code { 
      font-size: 36px; 
      font-weight: bold; 
      letter-spacing: 8px;
      color: #2D5A45;
    }
    .footer { color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>¡Bienvenido a Tourline! 🎒</h2>
    
    <p>Hola <strong>[NOMBRE]</strong>,</p>
    
    <p>Tu código de verificación es:</p>
    
    <div class="code-box">
      <div class="code">[CÓDIGO]</div>
    </div>
    
    <p>Este código expira en <strong>15 minutos</strong>.</p>
    
    <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
    
    <div class="footer">
      <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
      <p>© 2024 Tourline - Tu próxima aventura te espera</p>
    </div>
  </div>
</body>
</html>
```

**Texto plano (fallback):**
```
¡Bienvenido a Tourline!

Hola [NOMBRE],

Tu código de verificación es: [CÓDIGO]

Este código expira en 15 minutos.

Si no solicitaste este código, puedes ignorar este mensaje.

- Equipo Tourline
```

---

## 🔒 SEGURIDAD Y VALIDACIONES

### Rate Limiting

**Por IP:**
- Máximo 5 solicitudes de registro por hora
- Máximo 10 reenvíos de código por hora

**Por Email:**
- Máximo 1 reenvío cada 60 segundos
- Máximo 5 reenvíos por día

### Validación de Código

- Código debe tener exactamente 6 dígitos
- Código expira en 15 minutos
- Código solo puede usarse una vez
- Solo el código más reciente es válido (opcional: invalidar anteriores)

### Limpieza

**Job diario:** Limpiar códigos expirados y usuarios no verificados

```sql
-- Limpiar códigos expirados (más de 24 horas)
DELETE FROM verification_codes 
WHERE expires_at < NOW() - INTERVAL '24 hours';

-- Limpiar usuarios no verificados (más de 7 días)
DELETE FROM users 
WHERE email_verified = false 
  AND created_at < NOW() - INTERVAL '7 days';
```

---

## 🔄 MODIFICACIONES A ENDPOINTS EXISTENTES

### POST /api/auth/register

**DEBE INCLUIR** `emailVerified` en la respuesta:

```json
{
  "success": true,
  "data": {
    "token": "jwt...",
    "user": {
      "id": "uuid",
      "email": "usuario@email.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "USER",
      "emailVerified": false,  // ← REQUERIDO
      "createdAt": "2024-01-15T..."
    }
  }
}
```

### POST /api/auth/login

**DEBE INCLUIR** `emailVerified`:

```json
{
  "success": true,
  "data": {
    "token": "jwt...",
    "user": {
      "id": "uuid",
      "emailVerified": false,  // ← REQUERIDO
      ...
    }
  }
}
```

### GET /api/auth/me

**DEBE INCLUIR** `emailVerified`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@email.com",
    "emailVerified": true,  // ← REQUERIDO
    "emailVerifiedAt": "2024-01-15T10:30:00Z",
    ...
  }
}
```

---

## 📊 COMPORTAMIENTO ESPERADO

### Al registrarse:

```
1. Usuario envía datos → POST /auth/register
2. Backend crea usuario con email_verified = false
3. Backend genera código y lo guarda
4. Backend envía email con código
5. Backend retorna user con emailVerified: false
6. Frontend muestra pantalla de verificación
```

### Al iniciar sesión sin verificar:

```
1. Usuario hace login → POST /auth/login
2. Backend retorna user con emailVerified: false
3. Frontend BLOQUEA acceso a la app
4. Frontend muestra pantalla: "Verifica tu email"
5. Usuario puede: reenviar código o cerrar sesión
```

### Al verificar:

```
1. Usuario ingresa código → POST /auth/verify-email
2. Backend valida código
3. Backend actualiza email_verified = true
4. Frontend refresca datos del usuario
5. Frontend permite acceso a la app
```

---

## ⚠️ IMPORTANTE

1. **Todos los usuarios** deben tener `emailVerified: false` por defecto
2. **No permitir login** si el backend no devuelve el campo `emailVerified`
3. El campo debe estar en **TODAS** las respuestas que incluyan datos de usuario
4. Los códigos deben expirar en **15 minutos**
5. Implementar **rate limiting** para evitar spam

---

## 📞 CONTACTO

Si tienen dudas sobre esta especificación, contactar al equipo de frontend.
