# 🎭 Tests E2E con Maestro

## 📁 Estructura de Tests

```
.maestro/
├── flows/                    # Flujos de tests
│   ├── auth/                # Tests de autenticación
│   │   ├── login.yaml
│   │   ├── register.yaml
│   │   ├── forgot-password.yaml
│   │   └── email-verification.yaml
│   ├── tourist/             # Tests para rol tourist
│   │   ├── browse-tours.yaml
│   │   ├── search-tours.yaml
│   │   ├── view-tour-detail.yaml
│   │   ├── favorite-tour.yaml
│   │   └── book-tour.yaml
│   ├── provider/            # Tests para rol provider
│   │   ├── dashboard.yaml
│   │   ├── create-tour.yaml
│   │   ├── manage-bookings.yaml
│   │   └── view-stats.yaml
│   ├── guide/               # Tests para rol guide
│   │   ├── profile.yaml
│   │   └── manage-availability.yaml
│   └── admin/               # Tests para rol admin
│       ├── manage-users.yaml
│       ├── manage-providers.yaml
│       └── system-overview.yaml
├── config/
│   └── env.yaml             # Variables de entorno
└── helpers/
    └── common.yaml          # Funciones reutilizables
```

## 🚀 Comandos Principales

### Ejecutar todos los tests
```bash
maestro test .maestro/flows/
```

### Ejecutar un flujo específico
```bash
maestro test .maestro/flows/auth/login.yaml
```

### Ejecutar tests por rol
```bash
maestro test .maestro/flows/tourist/
maestro test .maestro/flows/provider/
maestro test .maestro/flows/guide/
maestro test .maestro/flows/admin/
```

### Ejecutar en modo continuo (CI/CD)
```bash
maestro test --format junit --output results.xml .maestro/flows/
```

## 📱 Preparación antes de ejecutar tests

### 1. Iniciar la app en desarrollo
```bash
npm start
```

### 2. Abrir Expo Go en el dispositivo/emulador
- iOS: Abrir app en simulador
- Android: Abrir app en emulador

### 3. Esperar a que la app cargue completamente

### 4. Ejecutar los tests
```bash
maestro test .maestro/flows/
```

## 🎯 Mejores Prácticas

1. **Usar testID en componentes importantes**
   ```typescript
   <Button testID="login-button" />
   <TextInput testID="email-input" />
   ```

2. **Datos de prueba consistentes**
   - Usar las mismas credenciales de test
   - Limpiar datos después de cada test

3. **Esperas inteligentes**
   ```yaml
   - assertVisible: "Welcome"
   - waitForAnimationToEnd
   ```

4. **Tests independientes**
   - Cada test debe poder ejecutarse solo
   - No depender del estado de otros tests

## 🐛 Debugging

### Ver logs detallados
```bash
maestro test --debug .maestro/flows/auth/login.yaml
```

### Pausar ejecución
```yaml
- stopApp
- inputText: "Presiona Enter para continuar..."
- startApp
```

### Capturar screenshots en cada paso
```bash
maestro test --screenshot .maestro/flows/
```

## 📊 Reportes

Maestro genera reportes automáticos en:
- `.maestro/` (carpeta temporal)
- Formato JUnit XML para CI/CD

## 🔄 Integración CI/CD

### GitHub Actions ejemplo
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Run E2E tests
        run: maestro test .maestro/flows/
```
