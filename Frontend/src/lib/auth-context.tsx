import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, usuariosAPI } from './api-endpoints';
import type { Usuario, Permiso, LoginModel } from './types';

interface AuthContextType {
  usuario: Usuario | null;
  permisos: Permiso[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginModel) => Promise<void>;
  logout: () => Promise<void>;
  tienePermiso: (nombrePermiso: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      setUsuario(null);
      setPermisos([]);
    } catch (error) {
      console.error("Error verifying session:", error);
      setUsuario(null);
      setPermisos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginModel) => {
    console.log("=== INICIO LOGIN ===");
    console.log("Login attempt for:", credentials.Email);
    
    try {
      const response = await authAPI.login(credentials);
      console.log("Login response recibida:", response);
      console.log("Tipo de response:", typeof response);
      console.log("Keys de response:", response ? Object.keys(response) : 'null');
      
      // Caso 1: Respuesta tiene Usuario directamente
      if (response && response.Usuario) {
        console.log("✓ Caso 1: Usuario encontrado en respuesta");
        console.log("Usuario:", response.Usuario);
        console.log("Permisos:", response.Permisos);
        setUsuario(response.Usuario);
        setPermisos(response.Permisos || response.Usuario.Permisos || []);
        console.log("=== LOGIN EXITOSO (Caso 1) ===");
        return;
      }
      
      // Caso 2: Solo viene token, obtener perfil
      if (response && (response.token || response.Token)) {
        console.log("✓ Caso 2: Token encontrado, obteniendo perfil...");
        try {
          const usuarioCompleto = await usuariosAPI.obtenerMiPerfil();
          console.log("Usuario completo obtenido:", usuarioCompleto);
          setUsuario(usuarioCompleto);
          setPermisos(usuarioCompleto.Permisos || []);
          console.log("=== LOGIN EXITOSO (Caso 2) ===");
          return;
        } catch (err) {
          console.warn("⚠ No se pudo obtener perfil, creando usuario básico");
          console.error("Error:", err);
        }
      }
      
      // Caso 3: Crear usuario básico (fallback)
      console.log("✓ Caso 3: Creando usuario básico");
      const usuarioBasico: Usuario = {
        Id: 0,
        NombreUsuario: credentials.Email.split('@')[0],
        Email: credentials.Email,
        Bloqueado: false,
        IntentosFallidos: 0,
        FechaCreacion: new Date().toISOString(),
        Activo: true,
        Permisos: []
      };
      setUsuario(usuarioBasico);
      setPermisos([]);
      console.log("=== LOGIN EXITOSO (Caso 3 - Básico) ===");
      return;
      
    } catch (error: any) {
      console.error("=== LOGIN FAILED ===");
      console.error("Error completo:", error);
      console.error("Error message:", error.message);
      console.error("Error Message:", error.Message);
      setUsuario(null);
      setPermisos([]);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUsuario(null);
      setPermisos([]);
    }
  };

  const tienePermiso = (nombrePermiso: string): boolean => {
    if (!usuario) return false;
    
    // Función recursiva para buscar el permiso en la estructura jerárquica
    const buscarPermiso = (permisosList: Permiso[]): boolean => {
      for (const permiso of permisosList) {
        if (permiso.Nombre === nombrePermiso) return true;
        if (permiso.Hijos && buscarPermiso(permiso.Hijos)) return true;
      }
      return false;
    };

    return buscarPermiso(permisos);
  };

  const value: AuthContextType = {
    usuario,
    permisos,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    logout,
    tienePermiso,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
