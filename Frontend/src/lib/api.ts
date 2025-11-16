// Re-export de api-endpoints para mantener compatibilidad con imports
export * from './api-endpoints';
export { authAPI as default } from './api-endpoints';

// Funciones de conveniencia
export { authAPI } from './api-endpoints';
export { usuariosAPI } from './api-endpoints';
export { productosAPI } from './api-endpoints';
export { emocionesAPI } from './api-endpoints';
export { bitacoraAPI } from './api-endpoints';
export { backupAPI } from './api-endpoints';
export { permisosAPI } from './api-endpoints';

// Para imports individuales
import { authAPI } from './api-endpoints';

export const getCurrentUser = () => {
  // Esta función necesita ser implementada en el backend
  // Por ahora retorna null
  return Promise.resolve(null);
};

export const logoutUser = async () => {
  return authAPI.logout();
};
