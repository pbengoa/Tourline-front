# ⚡ Setup E2E Tests - Paso a Paso RÁPIDO

## 🎯 Objetivo
Ejecutar tests sintéticos que prueben TODA la app automáticamente.

---

## 📋 Paso a Paso (10 minutos)

### 1️⃣ Instalar Maestro (solo una vez)

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

✅ Verificar:
```bash
maestro --version
```

---

### 2️⃣ Preparar usuarios de prueba en el backend

Crear estos usuarios en tu base de datos:

```sql
-- Tourist
INSERT INTO users (email, password, role) VALUES 
('tourist@test.com', 'hashedPassword', 'TOURIST');

-- Provider  
INSERT INTO users (email, password, role) VALUES 
('provider@test.com', 'hashedPassword', 'PROVIDER');

-- Guide
INSERT INTO users (email, password, role) VALUES 
('guide@test.com', 'hashedPassword', 'GUIDE');

-- Admin
INSERT INTO users (email, password, role) VALUES 
('admin@test.com', 'hashedPassword', 'ADMIN');
```

Password para todos: `Test123456!`

---

### 3️⃣ Iniciar la app

**Terminal 1:**
```bash
cd /Users/pascualbengoa/Tourline-front
npm start
```

Espera a que aparezca el QR code.

---

### 4️⃣ Abrir la app en el dispositivo

**Opción A - iOS Simulator:**
```bash
# En el terminal de Expo, presiona:
i
```

**Opción B - Android Emulator:**
```bash
# En el terminal de Expo, presiona:
a
```

**Opción C - Tu teléfono:**
- Descarga "Expo Go" de la App Store/Play Store
- Escanea el QR code

⚠️ **IMPORTANTE:** Espera a que la app cargue completamente antes de continuar.

---

### 5️⃣ Ejecutar los tests

**Terminal 2:**

```bash
# Ejecutar TODOS los tests
npm run test:e2e

# O ejecutar por categoría:
npm run test:e2e:auth       # Solo autenticación
npm run test:e2e:tourist    # Solo flujos de turista
npm run test:e2e:provider   # Solo flujos de provider

# O un test específico:
npm run test:e2e:login      # Solo login
```

---

## 📊 ¿Qué van a probar los tests?

### ✅ Autenticación
- Login con usuario/contraseña
- Registro de nuevo usuario
- Recuperación de contraseña

### ✅ Turista
- Navegar por tours
- Ver detalle de un tour
- Buscar tours
- Reservar un tour

### ✅ Provider
- Ver dashboard
- Ver estadísticas
- Acceder a gestión de tours

---

## 🎬 Mientras corren los tests...

Verás la app moverse sola:
- ✅ Escribir en formularios
- ✅ Click en botones
- ✅ Navegar entre pantallas
- ✅ Verificar que todo aparezca correctamente

---

## 📈 Resultados

Al final verás algo como:

```
✅ Login Flow - PASSED (4.2s)
✅ Browse Tours - PASSED (6.8s)
✅ View Tour Detail - PASSED (3.1s)
❌ Book Tour - FAILED (2.3s)
   └─ Element "Confirmar reserva" not found

Total: 3/4 tests passed
Time: 16.4s
```

---

## 🐛 Si algo falla...

### Error: "Unable to launch app"
**Solución:**
1. Verifica que la app esté corriendo en Expo Go
2. Espera a que cargue completamente
3. Vuelve a ejecutar el test

### Error: "Element not found"
**Solución:**
1. La app puede estar cargando datos
2. Ejecuta con `--debug` para ver qué pasa:
   ```bash
   npm run test:e2e:debug .maestro/flows/auth/login.yaml
   ```

### Tests muy lentos
**Solución:**
- Cierra otras apps en el simulador/emulador
- Usa un dispositivo más potente
- Usa build de desarrollo en vez de Expo Go

---

## 📝 Agregar testID a componentes

Para que los tests sean más confiables, agrega `testID` a botones y campos importantes:

```typescript
// ✅ Ejemplo
<Button testID="login-button" onPress={handleLogin}>
  Iniciar sesión
</Button>

<TextInput 
  testID="email-input"
  placeholder="Email"
/>

<TouchableOpacity testID="favorite-button">
  <Text>❤️</Text>
</TouchableOpacity>
```

Luego en el test puedes hacer:
```yaml
- tapOn:
    id: "login-button"
- tapOn:
    id: "email-input"
- inputText: "test@example.com"
```

---

## 🎓 Próximos pasos

1. ✅ **Ejecuta tu primer test** (el de login)
2. ✅ **Revisa los resultados**
3. ✅ **Agrega `testID` a tus componentes críticos**
4. ✅ **Crea nuevos tests** siguiendo los ejemplos
5. ✅ **Ejecuta tests antes de cada release**

---

## 📚 Documentación completa

- 📖 **Guía rápida:** `.maestro/QUICKSTART.md`
- 📖 **Documentación completa:** `.maestro/README.md`
- 📖 **Guía E2E detallada:** `TESTING_GUIDE_E2E.md`

---

## ⚡ Comandos Rápidos

```bash
# Ver ayuda
maestro --help

# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con debug
npm run test:e2e:debug .maestro/flows/auth/login.yaml

# Ver estructura de tests
tree .maestro/flows/
```

---

**🎉 ¡Listo!** Ya tienes tests E2E configurados y listos para usar.

**Pregunta frecuente:** ¿Cuándo ejecutar los tests?
- ✅ Antes de hacer push a main/develop
- ✅ Antes de cada release
- ✅ Después de cambios grandes
- ✅ En CI/CD automáticamente
