# 🔧 Troubleshooting - Tests E2E

## Problemas Comunes y Soluciones

### ❌ "Assertion is false: 'Iniciar sesión' is visible"

**Causa:** La app ya tiene una sesión activa (usuario logueado).

**Solución:**
1. **Opción A - Limpiar app manualmente:**
   ```bash
   # Borrar app data (iOS Simulator)
   xcrun simctl uninstall booted host.exp.Exponent
   
   # Borrar app data (Android Emulator)
   adb uninstall host.exp.Exponent
   
   # Volver a abrir la app en Expo Go
   ```

2. **Opción B - Hacer logout en la app:**
   - Abre la app manualmente
   - Ve a "Perfil"
   - Haz scroll hacia abajo
   - Toca "Cerrar sesión"
   - Ejecuta los tests de nuevo

3. **Opción C - Los tests ahora incluyen logout automático:**
   Los tests actualizados intentan hacer logout si detectan sesión activa.

---

### ❌ "Flow file does not exist: flows/flows/auth/..."

**Causa:** Rutas duplicadas en `run-all.yaml`.

**Solución:** Ya corregido. Las rutas ahora son:
```yaml
- runFlow: auth/login.yaml  # ✅ Correcto
# NO: flows/auth/login.yaml  # ❌ Incorrecto
```

---

### ❌ "Element not found" o timeouts

**Causa:** La app está cargando datos o animaciones.

**Solución:**
```yaml
# Agregar más tiempo de espera
- wait: 3000
- waitForAnimationToEnd

# O usar timeout en assertions
- assertVisible:
    text: "Mi Elemento"
    timeout: 10000  # 10 segundos
```

---

### ❌ Tests muy lentos

**Soluciones:**
1. **Cerrar otras apps** en el simulador/emulador
2. **Aumentar recursos** del emulador:
   ```bash
   # Android - Editar AVD en Android Studio
   # iOS - Usar dispositivo más reciente (iPhone 14+)
   ```
3. **Usar build de desarrollo** en vez de Expo Go:
   ```bash
   npx expo run:ios  # o run:android
   # Luego ejecutar tests
   ```

---

### ❌ "Unable to launch app"

**Causa:** La app no está corriendo o el `appId` es incorrecto.

**Solución:**
1. Verifica que la app esté corriendo:
   ```bash
   npm start
   # Presiona 'i' o 'a'
   ```
2. Espera a que cargue completamente (ver el splash screen desaparecer)
3. Para Expo Go, el `appId` debe ser: `host.exp.Exponent`
4. Para build nativo, usa tu bundle ID:
   ```yaml
   appId: com.anonymous.tourline  # iOS
   appId: com.anonymous.tourline  # Android
   ```

---

### ❌ "Network error" o "API timeout"

**Causa:** El backend no responde o está muy lento.

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica las credenciales de prueba en la BD
3. Aumenta timeouts en los tests:
   ```yaml
   - wait: 5000  # Esperar más tiempo
   ```

---

### ❌ Variables de entorno no funcionan

**Ejemplo:** `${TOURIST_EMAIL}` no se reemplaza.

**Solución:**
Las variables deben estar en `.maestro/config/env.yaml`:
```yaml
env:
  TOURIST_EMAIL: "tourist@test.com"
  TOURIST_PASSWORD: "Test123456!"
```

Pero **es más confiable usar valores directos** en los tests:
```yaml
- inputText: "tourist@test.com"  # ✅ Mejor
# vs
- inputText: "${TOURIST_EMAIL}"  # ⚠️ Puede fallar
```

---

### ❌ "Cannot find element by text"

**Causa:** El texto puede tener formato o caracteres especiales.

**Solución:**
1. **Usa testID en lugar de texto:**
   ```typescript
   // En el componente
   <Button testID="login-button">Iniciar sesión</Button>
   ```
   ```yaml
   # En el test
   - tapOn:
       id: "login-button"
   ```

2. **Usa regex para texto flexible:**
   ```yaml
   - assertVisible:
       text: "Iniciar|Login"  # Acepta ambos
   ```

3. **Verifica el texto exacto con debug:**
   ```bash
   maestro test --debug .maestro/flows/auth/login.yaml
   ```

---

### ❌ Keyboard no aparece en iOS

**Solución:**
```bash
# Habilitar teclado software en simulador
# Hardware > Keyboard > Connect Hardware Keyboard (desactivar)
```

O en el test:
```yaml
- tapOn:
    text: "Email"
- wait: 500  # Esperar a que aparezca teclado
- inputText: "test@test.com"
```

---

### ❌ Tests pasan en iOS pero fallan en Android (o viceversa)

**Causa:** Diferencias de plataforma.

**Solución:**
Usa condicionales:
```yaml
- runFlow:
    when:
      platform: iOS
    commands:
      - tapOn: "iOS-specific-element"

- runFlow:
    when:
      platform: Android
    commands:
      - tapOn: "android-specific-element"
```

---

## 🐛 Debugging Tips

### 1. Ver jerarquía de UI
```bash
maestro test --debug .maestro/flows/auth/login.yaml
```

Esto genera screenshots y logs en:
```
~/.maestro/tests/YYYY-MM-DD_HHMMSS/
```

### 2. Modo paso a paso
Agrega `stopApp` para pausar:
```yaml
- tapOn: "Login"
- stopApp  # El test se pausa aquí
- inputText: "..."
```

### 3. Screenshots en cada paso
```yaml
- takeScreenshot: "before-login"
- tapOn: "Login"
- takeScreenshot: "after-login"
```

### 4. Logs personalizados
```yaml
- evalScript: console.log("Test started at " + new Date())
```

---

## 📊 Verificar Estado de la App

Antes de ejecutar tests, verifica manualmente:

1. ✅ App se abre correctamente
2. ✅ Puedes hacer login manualmente
3. ✅ Botones y campos son clickeables
4. ✅ No hay errores en la consola
5. ✅ Backend responde correctamente

---

## 🆘 Si nada funciona...

1. **Reinicia todo:**
   ```bash
   # Matar proceso de Expo
   killall node
   
   # Limpiar cache
   npm start -- --clear
   
   # Reiniciar simulador/emulador
   ```

2. **Verifica versiones:**
   ```bash
   maestro --version
   node --version
   expo --version
   ```

3. **Reinstala Maestro:**
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

4. **Revisa los logs detallados:**
   ```bash
   maestro test --verbose .maestro/flows/auth/login.yaml
   ```

---

## 📞 Recursos de Ayuda

- [Maestro Docs](https://maestro.mobile.dev/)
- [Maestro Discord](https://discord.gg/maestro)
- [GitHub Issues](https://github.com/mobile-dev-inc/maestro/issues)

---

## ✅ Checklist Antes de Reportar Bug

- [ ] La app funciona manualmente
- [ ] El backend está corriendo
- [ ] Los usuarios de test existen en la BD
- [ ] La app está completamente cargada antes del test
- [ ] He probado con `--debug`
- [ ] He limpiado cache y reiniciado
- [ ] He verificado las rutas de los archivos
