# 📅 Provider Agenda V2 - Modern Timeline View

## 🎯 Overview

Nueva versión de la agenda del provider diseñada con un enfoque moderno tipo **Google Calendar** / **Calendly**, optimizada para visualizar reservas en un timeline horario.

---

## ✨ Características Principales

### 1. **Vista de Calendario Comprimible**

#### 🔹 Modo Expandido
- Calendario mensual completo
- Navegación de meses con flechas
- Puntos indicadores en fechas con reservas
- Contador de reservas por día

#### 🔹 Modo Compacto (Week View)
- **Vista de semana horizontal scrolleable**
- Navegación rápida entre semanas (flechas < >)
- Cards de día con:
  - Nombre del día (Lun, Mar, etc.)
  - Número del día
  - Badge con cantidad de reservas
  - Indicador de "hoy" (punto inferior)
- **Scroll horizontal** para navegar días de la semana
- Toggle entre modos con botón 📅/📆

#### Animación
```typescript
// Transición suave entre modos
Animated.spring(calendarHeight, {
  toValue: calendarMode === 'expanded' ? 350 : 90,
  tension: 50,
  friction: 10,
})
```

---

### 2. **Timeline de Horarios**

#### 🕐 Vista Principal
- **24 horas del día** (00:00 - 23:00)
- Líneas divisorias cada hora
- Scroll vertical ilimitado
- Grid visual para ubicación temporal

#### 📌 Reservas Posicionadas
Las reservas se muestran como **cards flotantes** posicionadas según:
- **Hora de inicio**: Posición vertical automática
- **Duración**: Altura del card (ej: 2 horas = 160px)

```typescript
// Cálculo de posición
const getBookingPosition = (startTime: string, duration: number) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const topPosition = (startMinutes / 60) * 80; // 80px por hora
  const height = (duration / 60) * 80;
  return { top: topPosition, height };
};
```

#### 🎨 Diseño de Cards en Timeline
Cada card muestra:
- **Hora de inicio** (pequeña, arriba)
- **Título del tour** (bold, destacado)
- **Metadata**: Participantes + Precio
- **Guía asignado** (si existe)
- **Color de borde** según estado
- **Background translúcido** del color de estado

#### Estados Visuales
```typescript
'CONFIRMED' → Verde (#4CAF50)
'PENDING' → Naranja (#FFA500)
'COMPLETED' → Verde oscuro
'CANCELLED' → Rojo (Colors.error)
```

---

### 3. **Dashboard de Stats**

Cards horizontales con scroll mostrando:
- **Hoy**: Reservas del día actual
- **Esta semana**: Próximas 7 días
- **Pendientes**: Estado PENDING (naranja)
- **Ingresos**: Total confirmado/completado (en miles)

Características:
- Scroll horizontal
- Sombras sutiles (elevation)
- Colores dinámicos según contexto
- Actualización en tiempo real

---

### 4. **Navegación**

#### Cambio de Fecha
```typescript
// Week View: Flechas laterales
changeWeek('prev') // -7 días
changeWeek('next') // +7 días

// Expanded: Calendar nativo
onMonthChange() // Cambio de mes automático
```

#### Selección de Día
- **Tap en calendar**: Cambio directo
- **Tap en week card**: Cambio directo
- **Animación**: Haptic feedback + transición suave
- **Indicador visual**: Color primario en seleccionado

---

### 5. **Modal de Detalles**

#### Apertura
- Tap en cualquier card del timeline
- Animación: Slide from bottom
- Haptic feedback

#### Contenido
- **Header**: Título + botón cerrar (X)
- **Secciones organizadas**:
  1. Título del tour
  2. Cliente (nombre + teléfono)
  3. Fecha y hora formateadas
  4. Guía asignado
  5. Detalles (participantes, precio, estado)
  6. Solicitudes especiales (si existen)

#### UX
- Scroll vertical para contenido largo
- Separadores sutiles entre secciones
- Badges de estado con colores
- Cierre: Tap en X o gesto de arrastre (iOS nativo)

---

## 🎨 Diseño Visual

### Paleta de Colores
```typescript
Card Background: Colors.card
Border: Colors.border
Primary Action: Colors.primary
Success: #4CAF50
Warning: #FFA500
Error: Colors.error
Text: Colors.text
Secondary Text: Colors.textSecondary
```

### Espaciado
- Cards: `12px border-radius`
- Padding interno: `Spacing.sm` (8px) a `Spacing.lg` (16px)
- Margins entre elementos: `Spacing.md` (12px)
- Timeline slots: `80px height` (1 hora)

### Tipografía
- **Headers**: Typography.h2, h3 (bold)
- **Body**: Typography.body
- **Captions**: Typography.caption (11-12px)
- **Labels**: Typography.labelLarge

---

## 🔄 Estados y Flujos

### Carga Inicial
1. Mostrar loading (spinner + texto)
2. Fetch bookings desde API
3. Calcular stats
4. Marcar calendario
5. Filtrar por día seleccionado
6. Fade-in animation

### Refresh
- **Pull to refresh** en timeline
- Haptic feedback al iniciar
- Mantener posición de scroll
- Actualizar stats en paralelo

### Cambio de Día
1. Usuario tap en fecha
2. Haptic feedback (Light)
3. Actualizar markedDates (deseleccionar anterior)
4. Filtrar bookings por nueva fecha
5. Scroll timeline a top (opcional)

### Toggle Calendar Mode
1. Usuario tap en botón 📅/📆
2. Haptic feedback (Medium)
3. Animated height change (spring)
4. Icono toggle

---

## 📱 Interacciones y Gestures

### Haptic Feedback
```typescript
Light: Cambio de día, tap en booking
Medium: Toggle calendar, refresh
Heavy: Acciones importantes (confirmar, cancelar)
Success: Operación completada
```

### Gestures Soportados
- **Scroll vertical**: Timeline
- **Scroll horizontal**: Week dates, Stats
- **Tap**: Selección de día, apertura de modal
- **Pull to refresh**: Recarga de datos
- **Swipe dismiss**: Cierre de modal (iOS nativo)

---

## 🚀 Rendimiento

### Optimizaciones
- **useMemo**: `timeSlots`, `weekDates`
- **useCallback**: `onRefresh`, `filterBookingsByDate`
- **Animated.Value**: Para animaciones nativas (useNativeDriver)
- **FlatList** podría usarse para timeline si hay >50 reservas

### Lazy Loading
- Stats calculados en background
- Bookings filtrados on-demand
- Calendario renderizado solo en modo expandido

---

## 📊 Estructura de Datos

### BookingWithDetails
```typescript
interface BookingWithDetails extends Booking {
  guideInfo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tourTitle?: string;    // Enriquecido
  userName?: string;     // Enriquecido
  guideName?: string;    // Enriquecido
}
```

### MarkedDates (Calendar)
```typescript
{
  [dateString]: {
    marked: boolean;
    dots: [{ color, selectedDotColor }];
    bookingCount: number;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
  }
}
```

---

## 🎯 Casos de Uso

### 1. Ver agenda del día
```
Usuario abre app → Ve hoy por defecto
Timeline muestra horarios con reservas posicionadas
Stats muestran resumen del día/semana
```

### 2. Navegar a otra fecha
```
Usuario tap en 📆 → Calendario se expande
Usuario tap en fecha → Timeline actualiza
O bien: Usuario swipe en week view → Cambia semana
```

### 3. Ver detalles de reserva
```
Usuario tap en card del timeline → Modal aparece
Usuario ve info completa → Tap en X para cerrar
```

### 4. Refrescar datos
```
Usuario pull down en timeline → Spinner aparece
API fetch → Timeline actualiza → Stats recalculan
```

---

## 🔮 Mejoras Futuras (Opcionales)

### Fase 2
- [ ] **Drag & Drop**: Mover reservas entre horarios
- [ ] **Multi-day view**: Ver 2-3 días simultáneos
- [ ] **Zoom**: Timeline compacto (30min slots) vs normal (1h slots)
- [ ] **Filtros**: Por estado, por guía, por tour
- [ ] **Búsqueda**: Buscar reserva por nombre/referencia

### Fase 3
- [ ] **Vista mensual de heatmap**: Colores según cantidad de reservas
- [ ] **Estadísticas avanzadas**: Gráficos, tendencias
- [ ] **Notificaciones**: Recordatorios de reservas próximas
- [ ] **Export**: PDF/CSV del día/semana/mes

---

## 🛠 Dependencias

### Core
- `react-native-calendars`: Calendario mensual
- `expo-linear-gradient`: Efectos visuales
- `expo-haptics`: Feedback táctil
- `react-native-safe-area-context`: Márgenes seguros

### APIs
- `bookingsService.getMyBookings()`: Fetch de reservas

---

## 📝 Notas de Implementación

### Performance Tips
```typescript
// ✅ Buena práctica
const timeSlots = useMemo(() => generateTimeSlots(), []);

// ❌ Evitar
const timeSlots = generateTimeSlots(); // Re-render every time
```

### Accesibilidad
- Tamaños de tap > 44x44px
- Contraste de colores WCAG AA
- Labels descriptivos para screen readers
- Haptic feedback para usuarios con visión reducida

### Testing
- Probar con 0, 1, 5, 20+ reservas en un día
- Probar transiciones de mes
- Probar overlap de reservas (mismo horario)
- Probar reservas muy cortas (< 1h) y muy largas (> 4h)

---

## 🎉 Resultado

Una **agenda moderna, intuitiva y profesional** que permite a los providers:
- ✅ Ver su día de un vistazo
- ✅ Navegar rápidamente entre fechas
- ✅ Identificar bloques horarios disponibles
- ✅ Gestionar reservas eficientemente
- ✅ Acceder a detalles con un tap

**Inspiración**: Google Calendar, Calendly, Cal.com
**Diseño**: Clean, modern, mobile-first
**UX**: Intuitiva, rápida, delightful
