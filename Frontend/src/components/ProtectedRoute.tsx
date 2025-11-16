import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[]; // Para validar múltiples permisos (OR logic)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
}) => {
  const { isAuthenticated, tienePermiso } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validar permisos
  let tieneAcceso = true;
  
  if (requiredPermission) {
    // Validar un solo permiso
    tieneAcceso = tienePermiso(requiredPermission);
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    // Validar múltiples permisos (OR logic - con que tenga uno es suficiente)
    tieneAcceso = requiredPermissions.some(perm => tienePermiso(perm));
  }

  if (!tieneAcceso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold text-purple-900 mb-4">403</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página
          </p>
          <a
            href="/emociones"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
