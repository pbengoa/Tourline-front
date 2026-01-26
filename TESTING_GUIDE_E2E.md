# 🎭 Guía Completa de Tests E2E (Sintéticos)

## 📖 Índice
1. [¿Qué son los tests sintéticos?](#qué-son)
2. [Instalación](#instalación)
3. [Estructura del proyecto](#estructura)
4. [Paso a paso para ejecutar](#paso-a-paso)
5. [Crear nuevos tests](#crear-tests)
6. [Mejores prácticas](#mejores-prácticas)
7. [CI/CD](#cicd)

---

## 🎯 ¿Qué son los tests sintéticos?

Los **tests sintéticos** (o E2E - End-to-End) simulan un usuario real interactuando con tu app:
- ✅ Click en botones
- ✅ Llenar formularios
- ✅ Navegar entre pantallas
- ✅ Verificar que todo funcione correctamente

**Ventajas:**
- Detectan bugs antes de que lleguen a producción
- Verifican el flujo completo de la app
- Ahorran tiempo de testing manual
- Dan confianza al hacer cambios

---

## 🚀 Instalación

### Paso 1: Instalar Maestro

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verificar instalación
maestro --version
```

### Paso 2: Verificar que tengas todo

```bash
# Node.js y npm
node --version
npm --version

# Expo CLI
npm list -g expo-cli
```

---

## 📁 Estructura del Proyecto

```
.maestro/
├── QUICKSTART.md              # Guía rápida
├── README.md                  # Documentación completa
├── config/
│   └── env.yaml              # Variables (emails, passwords de test)
├── flows/
│   ├── auth/                 # Tests de autenticación
│   │   ├── login.yaml
│   │   ├── register.yaml
│   │   └── forgot-password.yaml
│   ├── tourist/              # Tests para turistas
│   │   ├── browse-tours.yaml
│   │   ├── view-tour-detail.yaml
│   │   └── book-tour.yaml
│   ├── provider/             # Tests para providers
│   │   └── dashboard.yaml
│   └── run-all.yaml          # Ejecuta todos los tests
```

---

## 🎬 Paso a Paso para Ejecutar Tests

### 📱 Opción 1: Con Expo Go (Recomendado para desarrollo)

#### Terminal 1: Iniciar la app
```bash
cd /Users/pascualbengoa/Tourline-front
npm start
```

#### Terminal 2: Abrir en dispositivo
```bash
# iOS Simulator
i

# Android Emulator  
a

# O escanea el QR con Expo Go en tu teléfono
```

#### Terminal 3: Ejecutar tests
```bash
# Todos los tests
npm run test:e2e

# Solo tests de autenticación
npm run test:e2e:auth

# Solo tests de turistas
npm run test:e2e:tourist

# Un test específico
npm run test:e2e:login
```

### 🏗️ Opción 2: Con build de desarrollo (Más rápido)

```bash
# Crear build de desarrollo
npx expo run:ios
# o
npx expo run:android

# Ejecutar tests
npm run test:e2e
```

---

## ✍️ Crear Nuevos Tests

### Plantilla básica

```yaml
appId: host.exp.Exponent
---
# 📝 Nombre del test

- launchApp
- assertVisible: "Texto que debe aparecer"

# Interactuar con elementos
- tapOn: "Botón"
- tapOn:
    text: "Email"
- inputText: "test@example.com"

# Navegación
- scroll
- back

# Esperas
- waitForAnimationToEnd
- wait: 2000  # milisegundos

# Verificaciones
- assertVisible: "Elemento"
- assertNotVisible: "Elemento"
```

### Ejemplo real: Test de favoritos

Crea `.maestro/flows/tourist/favorite-tour.yaml`:

```yaml
appId: host.exp.Exponent
---
# ❤️ Test: Favorite a Tour

- launchApp
# Login
- tapOn:
    text: "Email"
- inputText: "${TOURIST_EMAIL}"
- tapOn:
    text: "Contraseña"
- inputText: "${TOURIST_PASSWORD}"
- tapOn: "Iniciar sesión"
- waitForAnimationToEnd

# Ir al primer tour
- tapOn: "Ver tour"
- waitForAnimationToEnd

# Marcar como favorito
- tapOn:
    id: "favorite-button"  # Necesitas agregar testID
- waitForAnimationToEnd

# Verificar que se agregó
- assertVisible: "Agregado a favoritos"

# Ir a favoritos
- back
- tapOn: "Perfil"
- tapOn: "Favoritos"
- waitForAnimationToEnd

# Verificar que está en la lista
- assertVisible: "tours"
```

---

## 🎯 Mejores Prácticas

### 1. Agregar `testID` a componentes importantes

```typescript
// ✅ BUENO
<Button testID="login-button" onPress={handleLogin}>
  Iniciar sesión
</Button>

<TextInput 
  testID="email-input"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>

<TouchableOpacity testID="favorite-button" onPress={toggleFavorite}>
  <Text>❤️</Text>
</TouchableOpacity>
```

### 2. Usar variables de entorno

En `.maestro/config/env.yaml`:
```yaml
env:
  TOURIST_EMAIL: "tourist@test.com"
  TOURIST_PASSWORD: "Test123456!"
```

En tests:
```yaml
- inputText: "${TOURIST_EMAIL}"
```

### 3. Tests independientes

Cada test debe:
- ✅ Hacer login si lo necesita
- ✅ Limpiar su estado al final
- ✅ Poder ejecutarse solo
- ❌ NO depender de otros tests

### 4. Esperas inteligentes

```yaml
# ✅ BUENO - Espera a que termine la animación
- waitForAnimationToEnd

# ⚠️ REGULAR - Espera fija
- wait: 3000

# ❌ MALO - No esperar
- tapOn: "Botón"
- assertVisible: "Resultado"  # Puede fallar si es lento
```

---

## 🤖 CI/CD - Automatización

### GitHub Actions

Crea `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      
      - name: Start iOS Simulator
        run: |
          xcrun simctl boot "iPhone 14" || true
          
      - name: Build and Run App
        run: npx expo run:ios
        
      - name: Run E2E Tests
        run: |
          export PATH="$HOME/.maestro/bin:$PATH"
          maestro test .maestro/flows/
        
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: maestro-results
          path: .maestro/
```

---

## 📊 Análisis de Resultados

Maestro muestra:

```
✅ Test: Login Flow
  ✓ Launch app (1.2s)
  ✓ Assert visible "Iniciar sesión" (0.1s)
  ✓ Tap on "Email" (0.3s)
  ✓ Input text (0.5s)
  ✓ Tap on "Contraseña" (0.3s)
  ✓ Input text (0.5s)
  ✓ Tap on "Iniciar sesión" (0.3s)
  ✓ Assert visible "Inicio" (0.8s)
  
✅ PASSED in 4.0s
```

Si algo falla:
```
❌ Test: Login Flow
  ✓ Launch app (1.2s)
  ✓ Assert visible "Iniciar sesión" (0.1s)
  ✗ Tap on "Email" (failed after 10s)
  
❌ FAILED: Element "Email" not found
```

---

## 🐛 Debugging

### Ver paso a paso con delay

```bash
maestro test --debug .maestro/flows/auth/login.yaml
```

### Capturar screenshots

```bash
maestro test --screenshot .maestro/flows/
```

### Ver logs detallados

```bash
maestro test --verbose .maestro/flows/auth/login.yaml
```

---

## 📞 Comandos Útiles

```bash
# Ver todos los tests disponibles
ls -R .maestro/flows/

# Ejecutar tests y generar reporte JUnit
maestro test --format junit --output results.xml .maestro/flows/

# Ejecutar solo tests que fallaron la última vez
maestro test --retry .maestro/flows/

# Ver versión de Maestro
maestro --version

# Actualizar Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
```

---

## 🎓 Próximos Pasos

1. **Ejecuta el primer test** para familiarizarte:
   ```bash
   npm run test:e2e:login
   ```

2. **Agrega `testID` a tus componentes** más importantes

3. **Crea tests para tus flujos críticos**:
   - Compra/Reserva
   - Registro de usuario
   - Recuperación de contraseña

4. **Integra en CI/CD** para ejecutar automáticamente

5. **Ejecuta tests antes de cada release**

---

## 💡 Tips Finales

- 🎯 Empieza con tests simples y ve agregando complejidad
- 📝 Documenta qué hace cada test
- 🔄 Ejecuta tests regularmente, no solo antes de release
- 🐛 Si un test falla, arréglalo inmediatamente
- 📊 Mantén un dashboard de resultados
- 👥 Todo el equipo debe poder ejecutar los tests

---

## 🆘 Ayuda

- [Documentación oficial de Maestro](https://maestro.mobile.dev/)
- [Ejemplos de tests](https://maestro.mobile.dev/examples)
- [Discord de Maestro](https://discord.gg/maestro)

---

**¿Preguntas?** Revisa primero `.maestro/QUICKSTART.md` o `.maestro/README.md`
