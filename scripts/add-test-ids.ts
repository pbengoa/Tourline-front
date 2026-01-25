/**
 * Script para agregar testIDs automáticamente a componentes
 * 
 * Uso: ts-node scripts/add-test-ids.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const TEST_IDS = {
  // Auth screens
  'src/screens/auth/LoginScreen.tsx': {
    'title="Iniciar sesión"': 'testID="login-button" title="Iniciar sesión"',
    'title="Únete ahora"': 'testID="signup-link" title="Únete ahora"',
    'placeholder="tu@email.com"': 'testID="email-input" placeholder="tu@email.com"',
    'placeholder="Tu contraseña"': 'testID="password-input" placeholder="Tu contraseña"',
  },
  
  'src/screens/auth/RegisterScreen.tsx': {
    'title="Crear cuenta"': 'testID="register-button" title="Crear cuenta"',
    'placeholder="Juan"': 'testID="firstname-input" placeholder="Juan"',
    'placeholder="Pérez"': 'testID="lastname-input" placeholder="Pérez"',
  },
  
  'src/screens/auth/ForgotPasswordScreen.tsx': {
    'title="Enviar instrucciones"': 'testID="send-reset-button" title="Enviar instrucciones"',
    'title="Reenviar correo"': 'testID="resend-button" title="Reenviar correo"',
  },
  
  'src/screens/auth/EmailVerificationScreen.tsx': {
    'title="Verificar código"': 'testID="verify-code-button" title="Verificar código"',
  },
  
  'src/screens/auth/ResetPasswordCodeScreen.tsx': {
    'title="Verificar código"': 'testID="verify-reset-code-button" title="Verificar código"',
    'title="Restablecer contraseña"': 'testID="reset-password-button" title="Restablecer contraseña"',
  },
  
  // Main screens
  'src/screens/HomeScreen.tsx': {
    '<View style={styles.header}>': '<View testID="home-header" style={styles.header}>',
  },
  
  'src/screens/SearchScreen.tsx': {
    'placeholder="¿A dónde quieres ir?"': 'testID="search-input" placeholder="¿A dónde quieres ir?"',
  },
  
  // Components
  'src/components/Button.tsx': {
    '<TouchableOpacity': '<TouchableOpacity testID={testID}',
  },
  
  'src/components/TourCard.tsx': {
    '<TouchableOpacity': '<TouchableOpacity testID={`tour-card-${tour.id}`}',
  },
};

function addTestIds() {
  console.log('🔧 Agregando testIDs a componentes...\n');
  
  let filesModified = 0;
  
  Object.entries(TEST_IDS).forEach(([filePath, replacements]) => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf-8');
    let modified = false;
    
    Object.entries(replacements).forEach(([search, replace]) => {
      if (content.includes(search) && !content.includes(replace)) {
        content = content.replace(search, replace);
        modified = true;
        console.log(`  ✅ ${filePath}: ${search.slice(0, 30)}...`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      filesModified++;
    }
  });
  
  console.log(`\n✅ ${filesModified} archivos modificados`);
  console.log('💡 Recuerda agregar testID como prop en los componentes que lo necesiten\n');
}

addTestIds();
