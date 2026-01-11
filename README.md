# Tourline Front

Aplicación móvil de tours desarrollada con React Native y Expo.

## 📱 Tecnologías

- **React Native** - Framework para desarrollo móvil multiplataforma
- **Expo** - Plataforma para desarrollo y deployment
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación entre pantallas
- **ESLint + Prettier** - Linting y formateo de código

## 🚀 Requisitos Previos

- Node.js >= 20.x (recomendado)
- npm o yarn
- Expo CLI
- iOS Simulator (Mac) o Android Studio para emulador Android
- [Expo Go](https://expo.dev/client) app en tu dispositivo móvil (opcional)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd Tourline-front

# Instalar dependencias
npm install
```

## 🏃 Ejecución

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en web
npm run web
```

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── Button.tsx
│   └── index.ts
├── screens/          # Pantallas de la aplicación
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── DetailsScreen.tsx
│   └── index.ts
├── navigation/       # Configuración de navegación
│   ├── RootNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── index.ts
├── hooks/            # Custom hooks
├── services/         # Servicios y APIs
├── utils/            # Utilidades y helpers
├── constants/        # Constantes de la aplicación
├── types/            # Tipos TypeScript
│   ├── navigation.ts
│   └── index.ts
└── theme/            # Tema y estilos globales
    ├── colors.ts
    ├── spacing.ts
    ├── typography.ts
    └── index.ts
```

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo Expo |
| `npm run ios` | Ejecuta la app en simulador iOS |
| `npm run android` | Ejecuta la app en emulador Android |
| `npm run web` | Ejecuta la app en el navegador |
| `npm run lint` | Ejecuta ESLint para verificar el código |
| `npm run lint:fix` | Ejecuta ESLint y corrige errores automáticamente |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formato del código |
| `npm run typecheck` | Verifica los tipos de TypeScript |
| `npm test` | Ejecuta los tests con Jest |
| `npm run test:watch` | Ejecuta tests en modo watch |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |

## 🧪 Testing

El proyecto incluye una configuración completa de testing con:

- **Jest** - Framework de testing
- **React Native Testing Library** - Utilidades para testing de componentes
- **jest-expo** - Preset de Jest para Expo

### Estructura de Tests

```
src/__tests__/
├── __mocks__/           # Mocks globales
├── components/          # Tests de componentes
│   ├── Button.test.tsx
│   ├── GuideCard.test.tsx
│   ├── TourCard.test.tsx
│   └── CategoryPill.test.tsx
├── screens/             # Tests de pantallas
│   ├── HomeScreen.test.tsx
│   ├── LoginScreen.test.tsx
│   └── ProfileScreen.test.tsx
├── context/             # Tests de contextos
│   └── AuthContext.test.tsx
└── utils/               # Tests de utilidades y datos
    ├── test-utils.tsx   # Utilidades de testing
    ├── mockData.test.ts
    └── bookingData.test.ts
```

### ⚠️ Nota sobre Expo 54

Actualmente existe una incompatibilidad conocida entre Jest y el nuevo "winter runtime" de Expo 54. La configuración de tests está lista pero requiere una actualización del preset `jest-expo` para funcionar correctamente. Esta issue está siendo rastreada por la comunidad de Expo.

Para verificar la integridad del código mientras se resuelve este problema:
```bash
npm run typecheck  # Verificación de tipos TypeScript
npm run lint       # Verificación de estilo de código
```

## 🎨 Sistema de Diseño

### Colores

Los colores se definen en `src/theme/colors.ts`:

- **Primary**: `#0066FF` - Color principal de la marca
- **Secondary**: `#FF6B35` - Color de acento
- **Background**: `#FAFBFC` - Fondo de la aplicación
- **Text**: `#1A1D21` - Color de texto principal

### Tipografía

La tipografía se define en `src/theme/typography.ts` con estilos para:
- Headings (h1-h4)
- Body text (large, normal, small)
- Labels
- Buttons

### Espaciado

Sistema de espaciado consistente en `src/theme/spacing.ts`:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

## 📱 Navegación

La aplicación utiliza React Navigation con:

- **Stack Navigator**: Para navegación principal entre pantallas
- **Bottom Tab Navigator**: Para la navegación por pestañas (Home, Search, Profile)

### Pantallas

1. **Home** - Pantalla principal con acceso rápido a funcionalidades
2. **Search** - Búsqueda de tours
3. **Profile** - Perfil del usuario
4. **Details** - Detalles de un tour específico

## 🤝 Contribución

1. Crear una rama desde `main`
2. Realizar cambios siguiendo las convenciones del proyecto
3. Ejecutar `npm run lint` y `npm run typecheck` antes de commit
4. Crear un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

