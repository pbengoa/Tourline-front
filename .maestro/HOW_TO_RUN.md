# 🚀 Cómo ejecutar los tests E2E

## ⚠️ IMPORTANTE: Usando Expo Go

Estos tests están configurados para usar **Expo Go** (`host.exp.Exponent`).

Si más adelante haces un **development build** (sin Expo Go), cambia el `appId` en los archivos `.yaml` a `com.anonymous.tourline`.

---

## ⚠️ IMPORTANTE: Orden correcto

Los tests E2E con Maestro necesitan que **la app ya esté instalada y corriendo**.

---

## 📱 Paso 1: Iniciar tu app

### Para iOS (Simulador):

```bash
# Terminal 1: Iniciar Expo
npm start

# Presiona 'i' para abrir iOS Simulator
# O en otra terminal:
npm run ios
```

**Espera a que la app se cargue completamente** antes de ejecutar los tests.

---

### Para Android (Emulador):

```bash
# Terminal 1: Asegúrate que el emulador está corriendo
emulator -avd Pixel_5_API_31

# Terminal 2: Iniciar la app
npm start
# Presiona 'a' para Android
# O:
npm run android
```

---

## 🧪 Paso 2: Ejecutar los tests

**En una nueva terminal** (mientras la app sigue corriendo):

### Ejecutar un test específico:

```bash
npm run test:e2e:login          # Test de login
npm run test:e2e:register       # Test de registro
npm run test:e2e:reset          # Test de reset password
npm run test:e2e:booking        # Test de booking
npm run test:e2e:provider       # Test de provider
```

### Ejecutar todos los tests:

```bash
npm run test:e2e
```

---

## ✅ Ejemplo completo (iOS)

```bash
# Terminal 1: Inicia la app
npm start
# Presiona 'i' cuando cargue

# Espera a ver la pantalla de login...

# Terminal 2: Ejecuta el test
npm run test:e2e:login
```

---

## 🐛 Solución de problemas

### "Unable to launch app"

**Problema:** La app no está instalada o no está corriendo.

**Solución:**
1. Asegúrate que la app está corriendo en el simulador/emulador
2. Verifica que puedes ver la pantalla de login
3. Luego ejecuta el test

---

### "Element not found"

**Problema:** El test no encuentra un elemento (botón, texto, etc).

**Solución:**
1. Verifica que la app está en la pantalla correcta
2. Usa `maestro hierarchy` para ver los elementos disponibles
3. Ajusta el test si el texto cambió

```bash
# Ver elementos en pantalla actual
maestro hierarchy
```

---

### Ver qué dispositivos están disponibles

```bash
# iOS
xcrun simctl list devices

# Android
adb devices
```

---

## 📊 Ejemplo de salida exitosa

```bash
$ npm run test:e2e:login

Running test: .maestro/login-flow.yaml
✓ launchApp
✓ tapOn: "Iniciar sesión"
✓ tapOn: "Correo electrónico"
✓ inputText: "test@example.com"
✓ tapOn: "Contraseña"
✓ inputText: "Test1234"
✓ tapOn: "Iniciar sesión"
✓ assertVisible: "Explorar Tours"

✅ Test passed in 8.2s
```

---

## 🎯 Tips

1. **Siempre inicia la app primero**, luego ejecuta los tests
2. **Usa Expo Go** si estás en desarrollo (más rápido)
3. **Un test a la vez** es más fácil de debuggear
4. **Modo Studio** para explorar: `maestro studio`

---

## 🔄 Flujo recomendado

```
1. npm start (Terminal 1)
   ↓
2. Presiona 'i' o 'a'
   ↓
3. Espera que la app cargue
   ↓
4. npm run test:e2e:login (Terminal 2)
   ↓
5. ✅ Test pasa
```

---

## 📞 ¿Problemas?

Revisa:
- `.maestro/README.md` - Documentación completa de Maestro
- `docs/TESTING_GUIDE.md` - Guía de testing general
