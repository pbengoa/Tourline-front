# 🔑 Especificación Backend - Recuperación de Contraseña

## 🎯 Resumen

Sistema completo de recuperación de contraseña con tokens seguros enviados por email.

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### Opción 1: Reutilizar tabla de verificación (RECOMENDADO)

Si ya implementaron `verification_codes` para email, pueden reutilizarla:

```sql
-- Ya existe de EMAIL_VERIFICATION_SPEC.md
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) DEFAULT 'email_verification' 
    CHECK (type IN ('email_verification', 'password_reset')),  -- ← Ya soporta password_reset
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**✅ No se necesitan cambios adicionales si ya tienen esta tabla.**

### Opción 2: Tabla separada (si no usan verification_codes)

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);
```

---

## 🔌 ENDPOINTS REQUERIDOS

### 1. POST /api/auth/forgot-password

Inicia el proceso de recuperación enviando un email con el token.

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
    "message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña"
  }
}
```

**⚠️ IMPORTANTE - Seguridad:**
- **NO revelar** si el email existe o no (retornar siempre 200)
- Esto previene enumeration attacks
- Solo enviar email si el usuario realmente existe

**Errores:**

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
1. Recibir email
2. **Rate limit:** máximo 1 solicitud cada 60 segundos por email
3. Buscar usuario por email
4. Si NO existe → retornar success de todas formas (no revelar)
5. Si existe:
   - Generar token seguro (ver sección abajo)
   - Guardar con expiración de 1 hora
   - Enviar email con enlace
6. Retornar success siempre

---

### 2. POST /api/auth/verify-reset-code (OPCIONAL)

Verifica que el código es válido antes de mostrar la pantalla de nueva contraseña.

**Request:**
```json
{
  "email": "usuario@email.com",
  "code": "482719"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

**⚠️ NOTA:** Este endpoint es opcional. Pueden validar el código directamente en `/reset-password` si prefieren.

---

### 3. POST /api/auth/reset-password

Restablece la contraseña usando el código (o token del email).

**Request (con código - RECOMENDADO):**
```json
{
  "code": "482719",
  "email": "usuario@email.com",
  "newPassword": "NuevaContraseña123"
}
```

**Request alternativa (con token largo):**
```json
{
  "token": "abc123...",
  "email": "usuario@email.com",
  "newPassword": "NuevaContraseña123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña restablecida correctamente"
  }
}
```

**Errores:**

400 - Token inválido:
```json
{
  "success": false,
  "error": {
    "message": "El enlace de recuperación no es válido"
  }
}
```

400 - Token expirado:
```json
{
  "success": false,
  "error": {
    "message": "El enlace de recuperación ha expirado"
  }
}
```

400 - Token ya usado:
```json
{
  "success": false,
  "error": {
    "message": "Este enlace ya fue utilizado"
  }
}
```

400 - Contraseña débil:
```json
{
  "success": false,
  "error": {
    "message": "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas y números"
  }
}
```

**Lógica:**
1. Validar que (`code` O `token`), `email` y `newPassword` estén presentes
2. Buscar código/token válido:
   - Código/token coincide
   - Email coincide
   - No está usado (`used_at IS NULL`)
   - No está expirado (`expires_at > NOW()`)
3. Si no existe o expiró → error apropiado
4. Validar contraseña:
   - Mínimo 8 caracteres
   - Al menos una mayúscula
   - Al menos una minúscula
   - Al menos un número
5. Hash la nueva contraseña (bcrypt/argon2)
6. Actualizar contraseña del usuario
7. Marcar token como usado (`used_at = NOW()`)
8. **Opcional:** Invalidar todos los tokens de sesión activos
9. Enviar email de confirmación (opcional)
10. Retornar success

---

## 🔐 GENERACIÓN DE CÓDIGO

### ⭐ RECOMENDADO: Código de 6 dígitos (Todo en la app)

```javascript
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Ejemplo: "482719"
```

**Ventajas:**
- ✅ Usuario permanece en la app
- ✅ No requiere deep linking
- ✅ Más simple de implementar
- ✅ Familiar (similar a verificación de email)

### Opción alternativa: Token largo (con deep link)

```javascript
const crypto = require('crypto');

function generateResetToken(): string {
  // Genera token aleatorio de 32 bytes (64 caracteres hex)
  return crypto.randomBytes(32).toString('hex');
}

// Ejemplo: "7f9b6c8a5d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7"
```

**Solo si:**
- Tienen deep linking configurado
- Quieren evitar que el usuario escriba algo

---

## 📧 EMAIL DE RECUPERACIÓN

**Asunto:** `Recupera tu contraseña de Tourline`

### ⭐ RECOMENDADO: Con código de 6 dígitos

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
    .warning { 
      background: #FFF4E6; 
      padding: 15px; 
      border-radius: 8px;
      border-left: 4px solid #FF9800;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Recupera tu contraseña 🔑</h2>
    
    <p>Hola <strong>[NOMBRE]</strong>,</p>
    
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    
    <p>Tu código de recuperación es:</p>
    
    <div class="code-box">
      <div class="code">[CÓDIGO]</div>
    </div>
    
    <p>Ingresa este código en la app para crear tu nueva contraseña.</p>
    
    <div class="warning">
      <strong>⚠️ Importante:</strong>
      <ul style="margin: 5px 0; padding-left: 20px;">
        <li>Este código expira en <strong>15 minutos</strong></li>
        <li>Solo puede usarse una vez</li>
      </ul>
    </div>
    
    <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
    
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
Recupera tu contraseña

Hola [NOMBRE],

Recibimos una solicitud para restablecer tu contraseña.

Tu código de recuperación es: [CÓDIGO]

Ingresa este código en la app Tourline para crear tu nueva contraseña.

⚠️ Este código expira en 15 minutos y solo puede usarse una vez.

Si no solicitaste esto, ignora este correo.

- Equipo Tourline
```

---

## 🔒 SEGURIDAD Y VALIDACIONES

### Rate Limiting

**Por IP:**
- Máximo 5 solicitudes de reset por hora

**Por Email:**
- Máximo 1 solicitud cada 60 segundos
- Máximo 3 solicitudes por día

### Validación de Código/Token

- Código debe ser aleatorio de 6 dígitos
- Código expira en **15 minutos** (igual que verificación de email)
- Código solo puede usarse **una vez**
- Comparar email Y código (no solo código)

### Validación de Contraseña

```javascript
function isPasswordStrong(password: string): boolean {
  // Mínimo 8 caracteres
  if (password.length < 8) return false;
  
  // Al menos una mayúscula
  if (!/[A-Z]/.test(password)) return false;
  
  // Al menos una minúscula
  if (!/[a-z]/.test(password)) return false;
  
  // Al menos un número
  if (!/\d/.test(password)) return false;
  
  return true;
}
```

### Prevención de Enumeration

**NO hacer esto:**
```javascript
// ❌ MAL - Revela si el email existe
if (!user) {
  return { error: 'Usuario no encontrado' };
}
```

**Hacer esto:**
```javascript
// ✅ BIEN - No revela información
if (!user) {
  // Silenciosamente no hacer nada, pero retornar success
  return { message: 'Si el email existe, recibirás instrucciones' };
}
```

### Limpieza

**Job diario:**
```sql
-- Limpiar tokens expirados (más de 24 horas)
DELETE FROM verification_codes 
WHERE type = 'password_reset' 
  AND expires_at < NOW() - INTERVAL '24 hours';

-- O si usan tabla separada:
DELETE FROM password_reset_tokens 
WHERE expires_at < NOW() - INTERVAL '24 hours';
```

---

## ⚙️ CONFIGURACIÓN

### Expiración del código

Recomendado: **15 minutos** (igual que verificación de email)

```javascript
const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
```

### Formato del código

6 dígitos numéricos: `482719`

```javascript
Math.floor(100000 + Math.random() * 900000).toString();
```

### Rate limiting

- 1 solicitud cada 60 segundos por email
- Máximo 3 solicitudes por día

---

## 📱 FLUJO EN LA APP (Frontend)

### Paso 1: Solicitar reset
```
LoginScreen → "Olvidé mi contraseña"
  ↓
ForgotPasswordScreen → Ingresa email
  ↓
POST /auth/forgot-password
  ↓
Email enviado con código
```

### Paso 2: Ingresar código (en la app)
```
ResetPasswordCodeScreen → Ingresa código de 6 dígitos
  ↓
POST /auth/verify-reset-code (opcional)
  ↓
Código válido → Muestra campos de nueva contraseña
```

### Paso 3: Crear nueva contraseña (en la misma pantalla)
```
Usuario ingresa nueva contraseña
  ↓
Frontend valida requisitos
  ↓
POST /auth/reset-password con { code, email, newPassword }
  ↓
Success → Navega a Login
```

### Paso 4: Iniciar sesión
```
Usuario hace login con nueva contraseña
  → Accede a la app normalmente
```

**✅ Ventaja: Todo ocurre dentro de la app, sin salir ni usar deep links**

---

## 🔄 CASOS ESPECIALES

### Usuario no está registrado
```javascript
// Retornar success de todas formas
return {
  success: true,
  message: 'Si el email existe, recibirás instrucciones'
};

// NO enviar email (silenciosamente no hacer nada)
```

### Código expirado
```javascript
return {
  success: false,
  error: {
    message: 'El código ha expirado. Solicita uno nuevo.'
  }
};
```

### Código ya usado
```javascript
return {
  success: false,
  error: {
    message: 'Este código ya fue utilizado. Solicita uno nuevo si lo necesitas.'
  }
};
```

### Nueva contraseña igual a la anterior
```javascript
// Opcional: prevenir que sea igual
if (await bcrypt.compare(newPassword, user.password)) {
  return {
    success: false,
    error: {
      message: 'La nueva contraseña debe ser diferente a la anterior'
    }
  };
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Tabla `verification_codes` con type 'password_reset' (o tabla separada)
- [ ] Endpoint `POST /auth/forgot-password` - Envía email con código
- [ ] Endpoint `POST /auth/verify-reset-code` - Verifica código (opcional)
- [ ] Endpoint `POST /auth/reset-password` - Cambia contraseña
- [ ] Generación de código de 6 dígitos aleatorio
- [ ] Rate limiting (1 solicitud/60s, 3/día)
- [ ] Email HTML con código visible
- [ ] Expiración de 15 minutos
- [ ] Validación de contraseña fuerte
- [ ] Hash de contraseña (bcrypt/argon2)
- [ ] Marcar código como usado después de reset
- [ ] NO revelar si el email existe
- [ ] Job de limpieza de códigos expirados

---

## ⏱️ ESTIMACIÓN

| Tarea | Tiempo |
|-------|--------|
| Endpoint forgot-password | 1 hora |
| Endpoint reset-password | 1.5 horas |
| Email template | 30 min |
| Rate limiting | 30 min |
| Testing | 1 hora |
| **TOTAL** | **4-5 horas** |

---

## 📞 CONTACTO

Para dudas sobre implementación, revisar:
- `docs/EMAIL_VERIFICATION_SPEC.md` (comparte estructura similar)
- `docs/BACKEND_CHECKLIST.md` (overview completo)

Contacto frontend: [email del equipo]
