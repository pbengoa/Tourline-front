# 🎭 Tests E2E con Maestro

Tests sintéticos end-to-end para Tourline usando Maestro.

---

## 📦 Instalación

### 1. Instalar Maestro

**macOS/Linux:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Windows:**
```powershell
# Usar WSL2 o Docker
```

### 2. Verificar instalación
```bash
maestro --version
```

---

## 🚀 Ejecutar Tests

### Ejecutar todos los tests
```bash
maestro test .maestro/
```

### Ejecutar un test específico
```bash
maestro test .maestro/login-flow.yaml
```

### Ejecutar con grabación de video
```bash
maestro test --format junit .maestro/login-flow.yaml
```

### Ejecutar en iOS Simulator
```bash
# Primero abrir el simulador
open -a Simulator

# Ejecutar test
maestro test .maestro/login-flow.yaml
```

### Ejecutar en Android Emulator
```bash
# Primero abrir el emulador
emulator -avd Pixel_5_API_31

# Ejecutar test
maestro test .maestro/login-flow.yaml
```

---

## 📋 Tests Disponibles

### 1. `login-flow.yaml`
Prueba el login básico de un usuario existente.

```bash
maestro test .maestro/login-flow.yaml
```

**Qué verifica:**
- ✅ Usuario puede navegar a login
- ✅ Usuario puede ingresar credenciales
- ✅ Login exitoso muestra home screen

---

### 2. `register-and-verify.yaml`
Prueba el registro y verificación de email de un turista.

```bash
maestro test .maestro/register-and-verify.yaml
```

**Qué verifica:**
- ✅ Flujo de selección de tipo de cuenta
- ✅ Formulario de registro
- ✅ Navegación a pantalla de verificación
- ✅ Input de código (simulado)

**⚠️ Nota:** Este test requiere código de verificación real del email o mock del backend.

---

### 3. `password-reset.yaml`
Prueba el flujo completo de recuperación de contraseña.

```bash
maestro test .maestro/password-reset.yaml
```

**Qué verifica:**
- ✅ Navegación a "Olvidé mi contraseña"
- ✅ Envío de email
- ✅ Pantalla de código
- ✅ Ingreso de nueva contraseña
- ✅ Validación de requisitos
- ✅ Confirmación exitosa

---

### 4. `booking-flow.yaml`
Prueba el flujo completo de reserva de un tour.

```bash
maestro test .maestro/booking-flow.yaml
```

**Qué verifica:**
- ✅ Login
- ✅ Búsqueda/selección de tour
- ✅ Selección de fecha
- ✅ Confirmación de reserva
- ✅ Navegación a success screen

**⚠️ Nota:** El paso de pago requiere integración con Stripe configurada.

---

### 5. `provider-registration.yaml`
Prueba el registro de un proveedor (guía independiente).

```bash
maestro test .maestro/provider-registration.yaml
```

**Qué verifica:**
- ✅ Selección de tipo "Guía Independiente"
- ✅ Formulario extendido de proveedor
- ✅ Verificación de email
- ✅ Pantalla de "Pending Approval"

---

## 🛠️ Comandos Útiles

### Ver jerarquía de la pantalla actual
```bash
maestro hierarchy
```

### Modo interactivo (explorar la app)
```bash
maestro studio
```

### Tomar screenshot
```bash
maestro screenshot
```

### Ver logs
```bash
maestro test --debug .maestro/login-flow.yaml
```

---

## 🎯 Best Practices

### 1. **Usar testID en lugar de texto cuando sea posible**

En lugar de:
```yaml
- tapOn: "Iniciar sesión"
```

Mejor:
```yaml
- tapOn:
    id: "login-button"
```

Para esto, agrega `testID` a tus componentes:
```typescript
<Button testID="login-button" title="Iniciar sesión" />
```

### 2. **Esperar elementos antes de interactuar**

```yaml
- assertVisible: "Email"
- tapOn: "Email"
- inputText: "test@example.com"
```

### 3. **Usar variables para datos de test**

```yaml
- launchApp
- tapOn: "Email"
- inputText: ${EMAIL}  # Pasar como variable
```

Ejecutar con:
```bash
maestro test --env EMAIL=test@example.com .maestro/login-flow.yaml
```

### 4. **Limpiar estado entre tests**

```yaml
- launchApp:
    clearState: true  # Limpia AsyncStorage y estado
```

---

## 🔧 Debugging

### Si un test falla:

1. **Ver el screenshot del momento del fallo**
```bash
ls ~/.maestro/tests/  # Ver últimos tests
```

2. **Ejecutar en modo interactivo**
```bash
maestro studio
```

3. **Agregar pasos de debug**
```yaml
- tapOn: "Login"
- assertTrue: ${output.isVisible}  # Verificar estado
```

---

## 📊 Integración CI/CD

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          
      - name: Setup iOS Simulator
        run: |
          xcrun simctl boot "iPhone 14"
          
      - name: Install dependencies
        run: npm install
        
      - name: Build app
        run: npx expo prebuild && npx expo run:ios --no-install
        
      - name: Run E2E tests
        run: maestro test .maestro/
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: maestro-results
          path: ~/.maestro/tests/
```

---

## 🚨 Troubleshooting

### "App not found"
```bash
# Verificar que la app está instalada
maestro test --device <device-id> .maestro/login-flow.yaml
```

### "Element not found"
- Verifica el texto exacto (case-sensitive)
- Usa `maestro hierarchy` para ver elementos
- Agrega `assertVisible` antes de interactuar

### Tests lentos
- Reduce `waitForAnimationToEnd`
- Usa `tapOn` con coordenadas en lugar de texto
- Evita scroll innecesarios

---

## 📚 Recursos

- [Maestro Docs](https://maestro.mobile.dev/)
- [Maestro Examples](https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test)
- [Best Practices](https://maestro.mobile.dev/best-practices)

---

## 💡 Próximos Pasos

1. **Agregar testID a todos los botones importantes**
2. **Crear scripts de setup para data de test**
3. **Implementar mock del backend para tests aislados**
4. **Agregar tests de casos edge (errores, validaciones)**
5. **Configurar CI/CD con GitHub Actions**
