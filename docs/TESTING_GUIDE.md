# 🧪 Guía de Testing para Tourline

Estrategia completa de testing para la aplicación Tourline.

---

## 📊 Pirámide de Testing

```
        /\
       /  \      E2E Tests (10%)
      /____\     - Maestro
     /      \    
    /        \   Integration Tests (30%)
   /          \  - React Native Testing Library
  /____________\ 
 /              \ Unit Tests (60%)
/______________\ - Jest
```

---

## 1️⃣ Unit Tests (Jest)

### Qué testear:
- ✅ Funciones puras (utils, helpers)
- ✅ Servicios (API calls con mocks)
- ✅ Hooks personalizados
- ✅ Validaciones y formateo

### Ejemplo: Test de validación

**Archivo:** `src/utils/validators.test.ts`
```typescript
import { validateEmail, validatePassword } from './validators';

describe('validateEmail', () => {
  it('acepta emails válidos', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
  });

  it('rechaza emails inválidos', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('valida contraseñas fuertes', () => {
    const result = validatePassword('Test1234');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detecta contraseñas débiles', () => {
    const result = validatePassword('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Debe tener al menos 8 caracteres');
  });
});
```

### Ejecutar unit tests:
```bash
npm test
npm test -- --coverage  # Con coverage
```

---

## 2️⃣ Integration Tests (React Native Testing Library)

### Qué testear:
- ✅ Componentes con interacción
- ✅ Formularios completos
- ✅ Navegación entre pantallas
- ✅ Context providers

### Ejemplo: Test de LoginScreen

**Archivo:** `src/screens/auth/LoginScreen.test.tsx`
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';
import { authService } from '../../services';

jest.mock('../../services/authService');

describe('LoginScreen', () => {
  it('muestra error con credenciales inválidas', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('tu@email.com');
    const passwordInput = getByPlaceholderText('Tu contraseña');
    const loginButton = getByText('Iniciar sesión');

    fireEvent.changeText(emailInput, 'invalid');
    fireEvent.changeText(passwordInput, 'short');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Ingresa un correo válido')).toBeTruthy();
    });
  });

  it('llama authService.login con credenciales correctas', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      success: true,
      data: { token: 'abc123', user: { id: '1' } }
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('tu@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Tu contraseña'), 'Test1234');
    fireEvent.press(getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'Test1234');
    });
  });
});
```

### Ejecutar integration tests:
```bash
npm test -- LoginScreen
```

---

## 3️⃣ E2E Tests (Maestro)

### Qué testear:
- ✅ Flujos críticos completos
- ✅ Happy paths
- ✅ Integraciones con backend real
- ✅ Casos de uso de usuario final

### Tests implementados:
Ver `.maestro/README.md` para detalles completos.

```bash
maestro test .maestro/login-flow.yaml
maestro test .maestro/booking-flow.yaml
```

---

## 🎯 Estrategia por Feature

### Feature: Autenticación

**Unit Tests:**
- ✅ Validación de email
- ✅ Validación de contraseña
- ✅ Hash y comparación

**Integration Tests:**
- ✅ LoginScreen con inputs y validación
- ✅ RegisterScreen con formulario completo
- ✅ AuthContext con manejo de estado

**E2E Tests:**
- ✅ Login flow completo
- ✅ Register + email verification
- ✅ Password reset flow

---

### Feature: Booking

**Unit Tests:**
- ✅ Cálculo de precio
- ✅ Formateo de fechas
- ✅ Validación de disponibilidad

**Integration Tests:**
- ✅ BookingScreen con selección de fecha
- ✅ Manejo de errores de disponibilidad

**E2E Tests:**
- ✅ Flujo completo de reserva
- ✅ Pago exitoso
- ✅ Confirmación y navegación

---

## 🛠️ Setup de Testing

### Instalar dependencias:

```bash
# Jest y React Native Testing Library (ya incluidos)
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# Maestro (para E2E)
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Configuración Jest:

**`jest.config.js`** (ya existe)
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__mocks__/**',
  ],
};
```

---

## 📋 Checklist de Testing

### Antes de cada PR:

- [ ] Todos los unit tests pasan
- [ ] Coverage mínimo de 70%
- [ ] Integration tests de la feature pasan
- [ ] Al menos 1 E2E test del happy path pasa

### Antes de release:

- [ ] Todos los tests pasan
- [ ] E2E tests de flujos críticos pasan
- [ ] Tests en iOS y Android
- [ ] Tests con backend de staging

---

## 🎬 Crear un Nuevo Test E2E

### 1. Identificar el flujo
```
Ejemplo: "Usuario busca tour por ciudad"
```

### 2. Crear el archivo YAML
```bash
touch .maestro/search-by-city.yaml
```

### 3. Escribir el test
```yaml
appId: com.yourcompany.tourline
---
- launchApp
- tapOn: "Buscar"
- tapOn: "¿A dónde quieres ir?"
- inputText: "Valparaíso"
- tapOn:
    text: "Valparaíso"
    index: 0  # Primer resultado
- assertVisible: "Tours en Valparaíso"
- assertVisible: 
    text: "Viña del Mar"  # Un tour conocido
```

### 4. Ejecutar y refinar
```bash
maestro test .maestro/search-by-city.yaml
```

### 5. Agregar a CI/CD
```yaml
# .github/workflows/e2e-tests.yml
- name: Run search tests
  run: maestro test .maestro/search-*.yaml
```

---

## 🐛 Debugging Tests

### Unit/Integration Tests:

```bash
# Ejecutar un test específico
npm test -- LoginScreen

# Modo watch
npm test -- --watch

# Con debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests:

```bash
# Modo debug
maestro test --debug .maestro/login-flow.yaml

# Ver jerarquía de elementos
maestro hierarchy

# Modo interactivo
maestro studio
```

---

## 📊 Coverage Report

### Generar reporte:
```bash
npm test -- --coverage --coverageReporters=html
```

### Ver reporte:
```bash
open coverage/index.html
```

### Metas de coverage:
- **Unit tests:** 80%+
- **Integration tests:** 60%+
- **Overall:** 70%+

---

## 🚀 CI/CD Integration

### GitHub Actions:

**`.github/workflows/tests.yml`**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
        
      - name: Run E2E tests
        run: maestro test .maestro/
```

---

## 📚 Recursos

- [Jest Docs](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Maestro Docs](https://maestro.mobile.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/write-tests)

---

## 💡 Tips

1. **Test el comportamiento, no la implementación**
2. **Usa testID para elementos críticos**
3. **Mock servicios externos (API, AsyncStorage)**
4. **Mantén tests simples y legibles**
5. **Un test = un concepto**
6. **Nombres descriptivos de tests**
7. **Evita timeouts largos**
8. **Limpia estado entre tests**
