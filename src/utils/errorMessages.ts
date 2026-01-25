/**
 * Error message utilities
 * Standardizes error messages from backend and makes them user-friendly
 */

export interface StandardError {
  title: string;
  message: string;
  action?: string;
}

/**
 * Parse and standardize error messages from backend
 */
export function parseError(error: any): StandardError {
  // Default error
  const defaultError: StandardError = {
    title: 'Error',
    message: 'Algo salió mal. Por favor intenta de nuevo.',
  };

  if (!error) return defaultError;

  // Get error message from different possible locations
  const rawMessage = 
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    String(error);

  const lowerMessage = rawMessage.toLowerCase();

  // Email/User errors - Handle Prisma unique constraint errors
  if ((lowerMessage.includes('email') || lowerMessage.includes('`email`')) && 
      (lowerMessage.includes('unique') || 
       lowerMessage.includes('constraint') || 
       lowerMessage.includes('already') ||
       lowerMessage.includes('existe') ||
       lowerMessage.includes('registrado') ||
       lowerMessage.includes('prisma'))) {
    return {
      title: 'Email ya registrado',
      message: 'Este email ya está en uso. ¿Ya tienes una cuenta?',
      action: 'login_or_verify',
    };
  }

  if (lowerMessage.includes('usuario no encontrado') || 
      lowerMessage.includes('user not found')) {
    return {
      title: 'Usuario no encontrado',
      message: 'No existe una cuenta con este email.',
    };
  }

  if (lowerMessage.includes('credenciales') || 
      lowerMessage.includes('contraseña') ||
      lowerMessage.includes('password') ||
      lowerMessage.includes('incorrect')) {
    return {
      title: 'Credenciales incorrectas',
      message: 'Email o contraseña incorrectos. Verifica tus datos.',
    };
  }

  // Verification errors
  if (lowerMessage.includes('código') || 
      lowerMessage.includes('code') ||
      lowerMessage.includes('verification')) {
    if (lowerMessage.includes('inválido') || 
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('incorrecto')) {
      return {
        title: 'Código inválido',
        message: 'El código ingresado no es correcto. Verifica e intenta de nuevo.',
      };
    }
    if (lowerMessage.includes('expirado') || 
        lowerMessage.includes('expired')) {
      return {
        title: 'Código expirado',
        message: 'El código ha expirado. Solicita uno nuevo.',
        action: 'resend',
      };
    }
  }

  // Password reset errors
  if (lowerMessage.includes('token') && 
      (lowerMessage.includes('reset') || lowerMessage.includes('password'))) {
    if (lowerMessage.includes('inválido') || 
        lowerMessage.includes('invalid')) {
      return {
        title: 'Enlace inválido',
        message: 'El enlace de recuperación no es válido. Solicita uno nuevo.',
      };
    }
    if (lowerMessage.includes('expirado') || 
        lowerMessage.includes('expired')) {
      return {
        title: 'Enlace expirado',
        message: 'El enlace de recuperación ha expirado. Solicita uno nuevo.',
      };
    }
  }

  // Provider/Company errors
  if ((lowerMessage.includes('tax') || lowerMessage.includes('rut') || lowerMessage.includes('rfc') || lowerMessage.includes('`tax_id`')) && 
      (lowerMessage.includes('unique') || lowerMessage.includes('constraint') || lowerMessage.includes('duplicado'))) {
    return {
      title: 'RUT/RFC duplicado',
      message: 'Este RUT/RFC ya está registrado en el sistema.',
    };
  }

  // Provider already exists
  if (lowerMessage.includes('provider') && 
      (lowerMessage.includes('unique') || lowerMessage.includes('constraint') || lowerMessage.includes('existe'))) {
    return {
      title: 'Proveedor ya existe',
      message: 'Ya existe un proveedor registrado con estos datos.',
    };
  }

  // Network errors
  if (lowerMessage.includes('network') || 
      lowerMessage.includes('internet') ||
      lowerMessage.includes('timeout') ||
      error?.code === 'ECONNABORTED' ||
      error?.code === 'ERR_NETWORK') {
    return {
      title: 'Error de conexión',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      action: 'retry',
    };
  }

  // Auth errors
  if (error?.response?.status === 401) {
    if (lowerMessage.includes('token') || 
        lowerMessage.includes('autenticación') ||
        lowerMessage.includes('authentication')) {
      return {
        title: 'Sesión expirada',
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        action: 'login',
      };
    }
  }

  // Permission errors
  if (error?.response?.status === 403) {
    return {
      title: 'Acceso denegado',
      message: 'No tienes permisos para realizar esta acción.',
    };
  }

  // Not found errors
  if (error?.response?.status === 404) {
    return {
      title: 'No encontrado',
      message: 'El recurso solicitado no existe o fue eliminado.',
    };
  }

  // Server errors
  if (error?.response?.status >= 500) {
    return {
      title: 'Error del servidor',
      message: 'Estamos teniendo problemas. Por favor intenta más tarde.',
      action: 'retry',
    };
  }

  // Validation errors
  if (lowerMessage.includes('validación') || 
      lowerMessage.includes('validation') ||
      lowerMessage.includes('required') ||
      lowerMessage.includes('requerido')) {
    return {
      title: 'Datos inválidos',
      message: 'Por favor verifica que todos los campos estén correctos.',
    };
  }

  // Rate limit
  if (error?.response?.status === 429 || 
      lowerMessage.includes('rate limit') ||
      lowerMessage.includes('demasiados intentos')) {
    return {
      title: 'Demasiados intentos',
      message: 'Has realizado muchas solicitudes. Por favor espera un momento.',
      action: 'wait',
    };
  }

  // If we have a relatively clean message, use it
  if (rawMessage && rawMessage.length < 100 && !rawMessage.includes('prisma') && !rawMessage.includes('tx.')) {
    return {
      title: 'Error',
      message: rawMessage,
    };
  }

  // Return default for unknown errors
  return defaultError;
}

/**
 * Get a user-friendly error message from any error
 */
export function getErrorMessage(error: any): string {
  const parsed = parseError(error);
  return parsed.message;
}

/**
 * Get error title and message
 */
export function getErrorDetails(error: any): { title: string; message: string } {
  const parsed = parseError(error);
  return {
    title: parsed.title,
    message: parsed.message,
  };
}

/**
 * Check if error suggests a specific action
 */
export function getErrorAction(error: any): string | null {
  const parsed = parseError(error);
  return parsed.action || null;
}

/**
 * Format error for logging (includes technical details)
 */
export function formatErrorForLog(error: any): string {
  const message = error?.response?.data?.error?.message || error?.message || String(error);
  const status = error?.response?.status;
  const code = error?.code;
  
  let log = `Error: ${message}`;
  if (status) log += ` (Status: ${status})`;
  if (code) log += ` (Code: ${code})`;
  
  return log;
}
