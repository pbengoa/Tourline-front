# 📅 Provider Agenda - Feature Documentation

## Overview

La **Provider Agenda** es una pantalla increíblemente diseñada que permite a los providers (empresas y guías) gestionar todas sus reservas de manera visual e intuitiva a través de un calendario interactivo.

## ✨ Características Principales

### 1. **Calendario Mensual Interactivo**
- Vista de calendario completo con navegación mes a mes
- Marcadores visuales en fechas con reservas
- Selección de fecha con feedback visual instantáneo
- Indicadores de cantidad de reservas por día

### 2. **Dashboard de Estadísticas**
En la parte superior, tres cards con información clave:
- **Hoy**: Número de reservas programadas para hoy
- **Esta Semana**: Total de reservas en los próximos 7 días
- **Pendientes**: Reservas que requieren confirmación

### 3. **Listado Detallado de Reservas**
Cada tarjeta de reserva muestra:
- **Hora de inicio** con indicador visual de estado
- **Título del tour** con información de participantes y precio
- **Guía asignado** con avatar y nombre
- **Estado de la reserva** (Confirmado, Pendiente, Cancelado, Completado)
- **Información del cliente** (nombre y teléfono)

### 4. **Diseño Premium**
- Gradientes elegantes en el header
- Sombras suaves y modernas
- Animaciones fluidas (fade-in al cargar)
- Cards con bordes laterales de color según estado
- Paleta de colores coherente con el branding

### 5. **Experiencia de Usuario**
- Pull-to-refresh para actualizar datos
- Loading states elegantes
- Empty states informativos y amigables
- Navegación intuitiva
- Responsive design

## 🎨 Elementos de Diseño

### Colores por Estado de Reserva

```typescript
CONFIRMED  → Verde (success)
PENDING    → Amarillo (warning)
CANCELLED  → Rojo (error)
COMPLETED  → Azul primario (primary)
```

### Iconografía
- 📅 Agenda/Calendario
- 👥 Participantes
- 💵 Precio
- 👤 Cliente/Guía
- ⏰ Hora

## 🔧 Estructura Técnica

### Componentes

**Archivo**: `src/screens/provider/ProviderAgendaScreen.tsx`

**Dependencias**:
- `react-native-calendars` - Calendario interactivo
- `expo-linear-gradient` - Gradientes en header
- `bookingsService` - API de reservas

### Estados Principales

```typescript
- selectedDate: string          // Fecha seleccionada en el calendario
- bookings: BookingWithDetails[]  // Reservas del día seleccionado
- markedDates: object            // Marcadores del calendario
- loading: boolean               // Estado de carga
- refreshing: boolean            // Estado de refresh
- stats: object                  // Estadísticas (hoy, semana, pendientes)
```

### Flujo de Datos

1. **Al cargar**: 
   - Fetch de todas las bookings del provider
   - Cálculo de estadísticas
   - Marcado de fechas con reservas en el calendario

2. **Al seleccionar fecha**:
   - Filtrado de bookings por fecha
   - Actualización de UI con animación
   - Re-marcado de fecha seleccionada

3. **Al refrescar**:
   - Pull-to-refresh recarga todos los datos
   - Mantiene la fecha seleccionada

## 📱 Integración con Navegación

### ProviderNavigator Updates

```typescript
// Primera tab del provider (pantalla principal)
<Tab.Screen
  name="ProviderAgenda"
  component={ProviderAgendaScreen}
  options={{
    tabBarLabel: 'Agenda',
    tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
  }}
/>
```

### Tipos de Navegación

Nuevo tipo agregado en `src/types/navigation.ts`:

```typescript
export type ProviderTabParamList = {
  ProviderAgenda: undefined;
  AdminTours: undefined;
  AdminGuides: undefined;
  ChatList: undefined;
  Profile: undefined;
};
```

## 🚀 Funcionalidades Futuras

### Propuestas de Mejora

1. **Filtros Avanzados**
   - Por guía asignado
   - Por estado de reserva
   - Por tour específico

2. **Vista Semanal**
   - Alternativa a la vista mensual
   - Timeline view con horas

3. **Acciones Rápidas**
   - Confirmar/Rechazar desde la card
   - Reasignar guía
   - Enviar mensaje al cliente

4. **Notificaciones Push**
   - Recordatorios de tours próximos
   - Nuevas reservas pendientes

5. **Exportación**
   - PDF de agenda del día/semana
   - Reporte de reservas

6. **Sincronización con Calendarios Externos**
   - Google Calendar
   - Apple Calendar

## 📊 Métricas de UX

### Tiempos de Interacción
- Carga inicial: ~1-2s
- Cambio de fecha: Instantáneo
- Refresh: ~1s

### Animaciones
- Fade-in al cargar: 600ms
- Transiciones de fecha: Smooth

## 🔐 Permisos y Roles

Esta pantalla está disponible **SOLO** para usuarios con rol `provider` o `admin`.

El `ProviderNavigator` se activa automáticamente cuando:
```typescript
user.role === 'provider' || user.role === 'admin'
```

## 📝 Notas para Desarrollo

### Testing
- Probar con diferentes cantidades de reservas por día
- Verificar comportamiento con 0 reservas
- Testear pull-to-refresh
- Validar estados de error de API

### Performance
- Las reservas se cargan una vez y se filtran en el cliente
- Considerar paginación si hay >100 reservas
- Lazy loading para meses futuros

### Accesibilidad
- Todos los touchables tienen `accessible={true}`
- Labels descriptivos para screen readers
- Contraste de colores WCAG AA

## 🐛 Troubleshooting

### La agenda no muestra reservas
1. Verificar que el usuario tenga rol `provider`
2. Confirmar que `bookingsService.getMyBookings()` retorna datos
3. Revisar que las fechas tengan formato ISO correcto

### El calendario no marca fechas
1. Verificar estructura del objeto `markedDates`
2. Confirmar que las fechas de booking sean strings en formato `YYYY-MM-DD`

### Stats no se actualizan
1. Verificar cálculo de fechas (timezone)
2. Confirmar que los bookings tengan campo `status`

## 📚 Referencias

- [react-native-calendars](https://github.com/wix/react-native-calendars)
- [Design System - Colors](../src/theme/colors.ts)
- [Bookings Service](../src/services/bookingsService.ts)

---

**Última actualización**: 25 de Enero, 2026  
**Versión**: 1.0.0  
**Autor**: AI Assistant
