# 🚀 Quick Start - Tests E2E

## ⚠️ IMPORTANTE: Usando Expo Go

**Los tests están configurados para Expo Go**. Esto significa:
- ❌ NO uses `launchApp` en los flows (ya está removido)
- ✅ La app DEBE estar corriendo ANTES de ejecutar tests
- ✅ Prepara el estado manualmente (login/logout) antes de cada test

## Paso 1: Instalar Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Paso 2: Iniciar la app

```bash
# Terminal 1: Iniciar Expo
npm start

# Espera a que el QR aparezca
```

## Paso 3: Abrir la app en el dispositivo

- **iOS**: Presiona `i` en el terminal de Expo para abrir en simulador
- **Android**: Presiona `a` en el terminal de Expo para abrir en emulador

**O usa Expo Go:**
- Escanea el QR code con tu teléfono

⏳ **Espera a que la app cargue completamente antes de continuar**

## Paso 4: Preparar el estado (IMPORTANTE)

Antes de ejecutar tests, **prepara manualmente** el estado de la app:

**Para test de LOGIN:**
```
1. Si ya estás logueado, ve a Perfil → Cerrar sesión
2. Deberías ver la pantalla de "¡Bienvenido!"
```

**Para test de LOGOUT:**
```
1. Si no estás logueado, haz login manualmente
2. Deberías ver las tabs: Inicio / Explorar / Perfil
```

## Paso 5: Ejecutar tests

```bash
# Terminal 2: Ejecutar tests (app DEBE estar corriendo)

# Test de login (asegúrate de estar en la pantalla de login primero)
npm run test:e2e:login

# O directamente con Maestro
maestro test .maestro/flows/auth/login.yaml

# O ejecutar por categoría
maestro test .maestro/flows/auth/
```

## 📊 Ver resultados

Los tests mostrarán:
- ✅ Pasos exitosos
- ❌ Pasos fallidos  
- ⏱️ Tiempo de ejecución
- 📸 Screenshots automáticos (si hay fallos)

## 🔧 Troubleshooting

### "Unable to launch app" o "App se cierra"
- ✅ NO uses `launchApp` con Expo Go (ya removido de los flows)
- ✅ Asegúrate de que la app esté ejecutándose ANTES de correr el test
- ✅ Verifica que el `appId` sea correcto: `host.exp.Exponent`

### "Element not found"
- La app puede estar cargando
- Aumenta los tiempos de espera
- Verifica que el texto existe en la pantalla

### Tests lentos
- Usa `--device` para especificar un dispositivo más rápido
- Cierra otras apps en el emulador
- Aumenta los recursos del emulador

## 💡 Tips

1. **Ejecuta primero un test simple** para verificar la configuración:
   ```bash
   maestro test .maestro/flows/auth/login.yaml
   ```

2. **Usa modo debug** si algo falla:
   ```bash
   maestro test --debug .maestro/flows/auth/login.yaml
   ```

3. **Ejecuta en modo continuo** durante desarrollo:
   ```bash
   maestro test --continuous .maestro/flows/
   ```
