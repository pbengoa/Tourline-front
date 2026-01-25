# 🔧 Fix: Teclado en Android - Input de Chat

## 🐛 Problema

En Android, cuando el usuario escribe un mensaje en el chat, el input se queda detrás del teclado y no puede ver lo que está escribiendo.

---

## ✅ Solución Implementada

### 1. KeyboardAvoidingView - Behavior Corregido

**Archivo:** `src/screens/chat/ChatScreen.tsx`

**ANTES ❌:**
```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}  // Android = undefined (no hace nada)
  keyboardVerticalOffset={0}
>
```

**AHORA ✅:**
```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // Android = 'height'
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
>
```

**Cambios:**
- **iOS:** `behavior="padding"` con `offset=90` (para compensar el header)
- **Android:** `behavior="height"` (cambia la altura del contenedor cuando aparece el teclado)

---

### 2. Configuración de Android - softwareKeyboardLayoutMode

**Archivo:** `app.json`

**Agregado:**
```json
{
  "android": {
    "softwareKeyboardLayoutMode": "pan",  // ← NUEVO
    ...
  }
}
```

**Qué hace:**
- `"pan"`: Desplaza la pantalla hacia arriba cuando aparece el teclado
- Alternativa: `"resize"` (cambia el tamaño de la pantalla, menos común para chats)

---

## 📱 Comportamiento Esperado

### Antes del Fix ❌:
```
┌─────────────────┐
│     Header      │
├─────────────────┤
│                 │
│   Messages      │
│                 │
├─────────────────┤ ← Input (oculto detrás del teclado)
│                 │
│    Keyboard     │
│                 │
└─────────────────┘
```

### Después del Fix ✅:
```
┌─────────────────┐
│     Header      │
├─────────────────┤
│   Messages      │ ← Se desplaza hacia arriba
├─────────────────┤
│ Input Visible ✓ │ ← Ahora visible
├─────────────────┤
│    Keyboard     │
└─────────────────┘
```

---

## 🧪 Testing

### Para probar:

1. **Abre la app en Android** (simulador o físico)
2. **Ve a la pantalla de chat**
3. **Toca el input de texto**
4. **El teclado debe aparecer**
5. **El input debe subir y ser visible** ✅

### Lo que NO debe pasar:
- ❌ Input detrás del teclado
- ❌ No poder ver lo que escribes
- ❌ Pantalla congelada
- ❌ Input cortado

---

## ⚙️ Opciones de KeyboardAvoidingView

### `behavior` Options:

| Valor | Descripción | Cuándo usar |
|-------|-------------|-------------|
| `"padding"` | Agrega padding al contenedor | iOS (recomendado) |
| `"height"` | Cambia la altura del contenedor | Android (recomendado) |
| `"position"` | Cambia la posición del contenedor | Casos específicos |
| `undefined` | No hace nada | ❌ No usar |

### `keyboardVerticalOffset`:
- **iOS:** Necesita offset para compensar header/tab bar
- **Android:** Usualmente `0` (maneja automáticamente)

---

## 🔧 Alternativas (no implementadas)

### Opción A: react-native-keyboard-aware-scroll-view
```bash
npm install react-native-keyboard-aware-scroll-view
```
Más robusto pero agrega dependencia extra.

### Opción B: android:windowSoftInputMode en AndroidManifest.xml
```xml
<activity android:windowSoftInputMode="adjustResize">
```
Solo disponible en proyectos nativos, no en Expo managed workflow.

---

## 📝 Notas Importantes

1. **Expo Managed Workflow:** No podemos editar `AndroidManifest.xml` directamente, por eso usamos `app.json`

2. **`softwareKeyboardLayoutMode`:** Es la manera de Expo de configurar `windowSoftInputMode`

3. **Testing en Dispositivo Real:** Siempre prueba en un dispositivo Android real, el comportamiento puede variar del simulador

4. **Safe Area:** El input automáticamente respeta el safe area gracias a `useSafeAreaInsets()`

---

## 🐛 Troubleshooting

### Problema: Input sigue oculto
**Solución:** Verifica que `behavior="height"` en Android

### Problema: Pantalla se desplaza demasiado
**Solución:** Ajusta `keyboardVerticalOffset`

### Problema: No funciona en dispositivo físico
**Solución:** 
1. Reconstruye la app: `npx expo start --clear`
2. Verifica que `app.json` tenga `softwareKeyboardLayoutMode`

---

## ✅ Cambios Aplicados

- [x] `ChatScreen.tsx` - behavior="height" para Android
- [x] `app.json` - softwareKeyboardLayoutMode="pan"
- [x] keyboardVerticalOffset ajustado para iOS

---

## 📚 Referencias

- [React Native KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview)
- [Expo App.json Config](https://docs.expo.dev/versions/latest/config/app/#softwarekeyboardlayoutmode)
- [Android windowSoftInputMode](https://developer.android.com/guide/topics/manifest/activity-element#wsoft)
