// ============================================
// CLIENTE API PARA ENDPOINTS DE MOODFLIX
// Backend: ASP.NET Web API 2
// ============================================

import type {
  LoginModel,
  LoginResponse,
  RegistroModel,
  Usuario,
  Producto,
  Pelicula,
  Libro,
  CreatePeliculaRequest,
  UpdatePeliculaRequest,
  CreateLibroRequest,
  UpdateLibroRequest,
  Emocion,
  Carrito,
  Pedido,
  PagoRequest,
  PagoResponse,
  BitacoraEvento,
  BitacoraFiltro,
  Backup,
  BackupRequest,
  RestoreRequest,
  BackupResponse,
  DVCheckResponse,
  DVRepairResponse,
  Permiso,
  CreatePermisoRequest,
  UpdatePermisoRequest,
  AsignarPermisosRequest,
  ApiResponse,
  ApiError,
  CreateEmocionRequest,
  UpdateEmocionRequest,
  Idioma,
  IdiomasResponse,
  TraduccionesResponse,
} from "./types";

// Usar ruta relativa para aprovechar el proxy de Vite en desarrollo
const API_URL = import.meta.env.VITE_API_URL || "";

// ============================================
// TOKEN STORAGE
// ============================================
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem("authToken");
  }
  return authToken;
}

// ============================================
// HELPER FUNCTION
// ============================================

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Copiar headers existentes
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  }

  // Agregar token JWT si existe
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      // credentials: 'include', // Comentado temporalmente por conflicto con CORS wildcard
    });

    // Si la respuesta está vacía (204 No Content o respuesta vacía), retornar objeto vacío
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    let data;
    if (contentLength === "0" || !contentType?.includes("application/json")) {
      data = response.ok ? {} : { Message: "Error en la solicitud" };
    } else {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    }

    if (!response.ok) {
      const error: ApiError = {
        Message: data.Message || "Error en la solicitud",
        StatusCode: response.status,
        Errors: data.Errors,
      };
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
  // POST /api/auth/login
  login: async (credentials: LoginModel): Promise<LoginResponse> => {
    console.log("Llamando a /api/auth/login con:", credentials);
    try {
      const response = await apiCall<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      console.log("Respuesta de /api/auth/login:", response);
      console.log("Tipo de respuesta:", typeof response);
      console.log("Keys de respuesta:", Object.keys(response));

      // Guardar el token si viene en la respuesta
      if (response.Token || response.token) {
        const token = response.Token || response.token;
        setAuthToken(token!);
        console.log("Token guardado:", token?.substring(0, 20) + "...");
      }

      return response;
    } catch (error) {
      console.error("Error en authAPI.login:", error);
      throw error;
    }
  },

  // POST /api/auth/logout
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await apiCall<ApiResponse>("/api/auth/logout", {
        method: "POST",
      });
      setAuthToken(null);
      return response;
    } catch (error) {
      // Si el endpoint no existe, solo limpiamos el token localmente
      console.warn(
        "Endpoint de logout no disponible, limpiando token localmente"
      );
      setAuthToken(null);
      return { Success: true, Message: "Sesión cerrada" };
    }
  },

  // GET /api/auth/current
  getCurrentUser: async (): Promise<Usuario | null> => {
    try {
      const response = await apiCall<ApiResponse<Usuario>>(
        "/api/auth/current",
        {
          method: "GET",
        }
      );
      return response.Data || null;
    } catch {
      return null;
    }
  },
};

// ============================================
// USUARIOS ENDPOINTS
// ============================================

export const usuariosAPI = {
  // POST /api/usuarios (Registro)
  registrar: async (usuario: RegistroModel): Promise<ApiResponse<Usuario>> => {
    return apiCall<ApiResponse<Usuario>>("/api/usuarios", {
      method: "POST",
      body: JSON.stringify(usuario),
    });
  },

  // GET /api/usuarios
  listar: async (): Promise<Usuario[]> => {
    return apiCall<Usuario[]>("/api/usuarios", {
      method: "GET",
    });
  },

  // GET /api/usuarios/{id}
  obtenerPorId: async (id: number): Promise<Usuario> => {
    return apiCall<Usuario>(`/api/usuarios/${id}`, {
      method: "GET",
    });
  },

  obtenerMiPerfil: async (): Promise<Usuario> => {
    return apiCall<Usuario>("/api/usuarios/mi-perfil", {
      method: "GET",
    });
  },

  actualizar: async (
    id: number,
    usuario: Partial<Usuario>
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(usuario),
    });
  },

  asignarPermisos: async (
    id: number,
    permisos: Permiso[]
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/usuarios/${id}/permisos`, {
      method: "PUT",
      body: JSON.stringify(permisos),
    });
  },

  eliminar: async (id: number): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/usuarios/${id}`, {
      method: "DELETE",
    });
  },

  endpointProhibido: async (): Promise<ApiResponse> => {
    return apiCall<ApiResponse>("/api/usuarios/prohibido", {
      method: "GET",
    });
  },
};

// ============================================
// PERMISOS ENDPOINTS
// ============================================

export const permisosAPI = {
  listar: async (): Promise<Permiso[]> => {
    return apiCall<Permiso[]>("/api/permisos", {
      method: "GET",
    });
  },

  obtenerPorId: async (id: number): Promise<Permiso> => {
    return apiCall<Permiso>(`/api/permisos/${id}`, {
      method: "GET",
    });
  },

  crear: async (
    permiso: CreatePermisoRequest
  ): Promise<ApiResponse<Permiso>> => {
    return apiCall<ApiResponse<Permiso>>("/api/permisos", {
      method: "POST",
      body: JSON.stringify(permiso),
    });
  },

  actualizar: async (
    id: number,
    permiso: UpdatePermisoRequest
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/permisos/${id}`, {
      method: "PUT",
      body: JSON.stringify(permiso),
    });
  },

  eliminar: async (id: number): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/permisos/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// EMOCIONES ENDPOINTS
// ============================================

export const emocionesAPI = {
  // GET /api/emociones
  listar: async (): Promise<Emocion[]> => {
    return apiCall<Emocion[]>("/api/emociones", {
      method: "GET",
    });
  },

  // GET /api/emociones/{id}
  obtenerPorId: async (id: number): Promise<Emocion> => {
    return apiCall<Emocion>(`/api/emociones/${id}`, {
      method: "GET",
    });
  },

  crear: async (
    emocion: CreateEmocionRequest
  ): Promise<ApiResponse<Emocion>> => {
    return apiCall<ApiResponse<Emocion>>("/api/emociones", {
      method: "POST",
      body: JSON.stringify(emocion),
    });
  },

  actualizar: async (
    id: number,
    emocion: UpdateEmocionRequest
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/emociones/${id}`, {
      method: "PUT",
      body: JSON.stringify(emocion),
    });
  },

  eliminar: async (id: number): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/emociones/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// PRODUCTOS ENDPOINTS
// ============================================

export const productosAPI = {
  // GET /api/productos - Obtiene lista de todos los productos
  listar: async (params?: {
    emocionId?: number;
    tipo?: "Pelicula" | "Libro";
  }): Promise<Producto[]> => {
    const queryParams = new URLSearchParams();
    if (params?.emocionId)
      queryParams.append("emocionId", params.emocionId.toString());
    if (params?.tipo) queryParams.append("tipo", params.tipo);

    const query = queryParams.toString();
    return apiCall<Producto[]>(`/api/productos${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  },

  // GET /api/productos/{id} - Obtiene un producto específico por ID
  obtenerPorId: async (id: number): Promise<Producto> => {
    return apiCall<Producto>(`/api/productos/${id}`, {
      method: "GET",
    });
  },

  // DELETE /api/productos/{id} - Elimina un producto
  eliminar: async (id: number): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/productos/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// PELÍCULAS ENDPOINTS
// ============================================

export const peliculasAPI = {
  // GET /api/peliculas
  listar: async (emocionId?: number): Promise<Pelicula[]> => {
    const query = emocionId ? `?emocionId=${emocionId}` : "";
    return apiCall<Pelicula[]>(`/api/peliculas${query}`, {
      method: "GET",
    });
  },

  // GET /api/peliculas/{id}
  obtenerPorId: async (id: number): Promise<Pelicula> => {
    return apiCall<Pelicula>(`/api/peliculas/${id}`, {
      method: "GET",
    });
  },

  // POST /api/peliculas - Crea un nuevo producto de tipo Película
  crear: async (
    pelicula: CreatePeliculaRequest
  ): Promise<ApiResponse<Pelicula>> => {
    return apiCall<ApiResponse<Pelicula>>("/api/peliculas", {
      method: "POST",
      body: JSON.stringify(pelicula),
    });
  },

  // PUT /api/peliculas/{id} - Actualiza un producto de tipo Película
  actualizar: async (
    id: number,
    pelicula: UpdatePeliculaRequest
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/peliculas/${id}`, {
      method: "PUT",
      body: JSON.stringify(pelicula),
    });
  },

  // DELETE /api/peliculas/{id}
  eliminar: async (id: number): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/peliculas/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// LIBROS ENDPOINTS
// ============================================

export const librosAPI = {
  // GET /api/libros
  listar: async (emocionId?: number): Promise<Libro[]> => {
    const query = emocionId ? `?emocionId=${emocionId}` : "";
    return apiCall<Libro[]>(`/api/libros${query}`, {
      method: "GET",
    });
  },

  // GET /api/libros/{id}
  obtenerPorId: async (id: number): Promise<Libro> => {
    return apiCall<Libro>(`/api/libros/${id}`, {
      method: "GET",
    });
  },

  // POST /api/libros - Crea un nuevo producto de tipo Libro
  crear: async (libro: CreateLibroRequest): Promise<ApiResponse<Libro>> => {
    return apiCall<ApiResponse<Libro>>("/api/libros", {
      method: "POST",
      body: JSON.stringify(libro),
    });
  },

  // PUT /api/libros/{id} - Actualiza un producto de tipo Libro
  actualizar: async (
    id: number,
    libro: UpdateLibroRequest
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/libros/${id}`, {
      method: "PUT",
      body: JSON.stringify(libro),
    });
  },

  // DELETE /api/libros/{id}
  eliminar: async (id: number): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/libros/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// CARRITO ENDPOINTS (ESTIMADOS - ajustar según tu backend)
// ============================================

export const carritoAPI = {
  // GET /api/carrito
  obtener: async (): Promise<Carrito> => {
    return apiCall<Carrito>("/api/carrito", {
      method: "GET",
    });
  },

  // POST /api/carrito/agregar
  agregar: async (
    productoId: number,
    cantidad: number = 1
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>("/api/carrito/agregar", {
      method: "POST",
      body: JSON.stringify({ ProductoId: productoId, Cantidad: cantidad }),
    });
  },

  // DELETE /api/carrito/{itemId}
  eliminar: async (itemId: number): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/carrito/${itemId}`, {
      method: "DELETE",
    });
  },

  // PUT /api/carrito/{itemId}
  actualizarCantidad: async (
    itemId: number,
    cantidad: number
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/carrito/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ Cantidad: cantidad }),
    });
  },
};

// ============================================
// PEDIDOS Y PAGOS ENDPOINTS (ESTIMADOS)
// ============================================

export const pedidosAPI = {
  // POST /api/pedidos - Crear pedido
  crear: async (pedidoData: {
    DireccionEnvioId: number;
    Items: Array<{
      ProductoId: number;
      Cantidad: number;
      PrecioUnitario: number;
    }>;
  }): Promise<ApiResponse> => {
    return apiCall<ApiResponse>("/api/pedidos", {
      method: "POST",
      body: JSON.stringify(pedidoData),
    });
  },

  // GET /api/pedidos - Listar mis pedidos
  listar: async (): Promise<Pedido[]> => {
    return apiCall<Pedido[]>("/api/pedidos", {
      method: "GET",
    });
  },

  // GET /api/pedidos/todos - Listar TODOS los pedidos (solo Admin)
  listarTodos: async (): Promise<Pedido[]> => {
    return apiCall<Pedido[]>("/api/pedidos/todos", {
      method: "GET",
    });
  },

  // GET /api/pedidos/{id}
  obtenerPorId: async (id: number): Promise<Pedido> => {
    return apiCall<Pedido>(`/api/pedidos/${id}`, {
      method: "GET",
    });
  },

  // PUT /api/pedidos/{id}/estado - Actualizar estado del pedido
  actualizarEstado: async (
    id: number,
    nuevoEstado: string
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>(`/api/pedidos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ NuevoEstado: nuevoEstado }),
    });
  },
};

// ============================================
// BITÁCORA ENDPOINTS (WEBMASTER)
// ============================================

export const bitacoraAPI = {
  // GET /api/Bitacora?usuarioId={usuarioId}&criticidad={criticidad}&fechaDesde={fechaDesde}&fechaHasta={fechaHasta}
  listar: async (filtro?: BitacoraFiltro): Promise<BitacoraEvento[]> => {
    const params = new URLSearchParams();
    if (filtro?.usuarioId)
      params.append("usuarioId", filtro.usuarioId.toString());
    if (filtro?.criticidad)
      params.append("criticidad", filtro.criticidad.toString());
    if (filtro?.fechaDesde) params.append("fechaDesde", filtro.fechaDesde);
    if (filtro?.fechaHasta) params.append("fechaHasta", filtro.fechaHasta);

    const query = params.toString();
    console.log(
      "Llamando a bitácora con URL:",
      `/api/Bitacora${query ? `?${query}` : ""}`
    );

    // Intentar primero con /api/Bitacora
    try {
      return await apiCall<BitacoraEvento[]>(
        `/api/Bitacora${query ? `?${query}` : ""}`,
        {
          method: "GET",
        }
      );
    } catch (error: any) {
      console.error(
        "Error con /api/Bitacora, intentando /api/bitacora:",
        error
      );
      // Si falla, intentar con minúscula
      return apiCall<BitacoraEvento[]>(
        `/api/bitacora${query ? `?${query}` : ""}`,
        {
          method: "GET",
        }
      );
    }
  },
};

// ============================================
// BACKUP ENDPOINTS (WEBMASTER)
// ============================================

export const backupAPI = {
  generar: async (): Promise<Blob> => {
    const headers: Record<string, string> = {};

    // Agregar token JWT si existe
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Generando backup...");

    // Intentar primero con /api/Backup/generar
    try {
      const response = await fetch(`${API_URL}/api/Backup/generar`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(
          `Error al generar el backup: ${response.status} ${response.statusText}`
        );
      }

      return response.blob();
    } catch (error) {
      console.error("Error generando backup:", error);
      throw error;
    }
  },

  restaurarDesdeArchivo: async (archivo: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("archivo", archivo);

    const headers: Record<string, string> = {};

    // Agregar token JWT si existe
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Restaurando backup desde archivo:", archivo.name);

    // Intentar primero con /api/Backup/restaurar
    try {
      const response = await fetch(`${API_URL}/api/Backup/restaurar`, {
        method: "POST",
        body: formData,
        headers,
        // No agregamos Content-Type para que el browser lo setee automáticamente con el boundary
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error del servidor:", data);
        const error: ApiError = {
          Message: data.Message || "Error al restaurar el backup",
          StatusCode: response.status,
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error restaurando backup:", error);
      throw error;
    }
  },

  // GET /api/backup
  listar: async (): Promise<Backup[]> => {
    return apiCall<Backup[]>("/api/Backup", {
      method: "GET",
    });
  },
};

// ============================================
// DÍGITOS VERIFICADORES ENDPOINTS (WEBMASTER)
// ============================================

export const dvAPI = {
  // GET /api/dv/verificar
  verificar: async (): Promise<DVCheckResponse> => {
    return apiCall<DVCheckResponse>("/api/dv/verificar", {
      method: "GET",
    });
  },

  // POST /api/dv/recalcular
  recalcular: async (): Promise<DVRepairResponse> => {
    return apiCall<DVRepairResponse>("/api/dv/recalcular", {
      method: "POST",
    });
  },
};

// ============================================
// SERVICIO XML ENDPOINTS (WEBMASTER)
// ============================================

export const xmlAPI = {
  // Exportar catálogo de productos a XML
  exportar: async (): Promise<string> => {
    const headers: Record<string, string> = {};

    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(
        `${API_URL}/XmlService.asmx/ExportarProductosComoXml`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error al exportar XML: ${response.status}`);
      }

      const xmlText = await response.text();

      // El webservice ASMX devuelve XML envuelto en una respuesta SOAP
      // Extraer el contenido del XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const stringElement = xmlDoc.getElementsByTagName("string")[0];

      if (stringElement && stringElement.textContent) {
        return stringElement.textContent;
      }

      return xmlText;
    } catch (error) {
      console.error("Error exportando XML:", error);
      throw error;
    }
  },

  // Importar catálogo de productos desde XML
  importar: async (xmlData: string): Promise<string> => {
    const headers: Record<string, string> = {};

    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // Codificar el XML para enviarlo como form data
      const formData = new URLSearchParams();
      formData.append("xmlData", xmlData);

      const response = await fetch(
        `${API_URL}/XmlService.asmx/ImportarProductosDesdeXml`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al importar XML: ${response.status}`);
      }

      const xmlText = await response.text();

      // Extraer el mensaje de respuesta del XML SOAP
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const stringElement = xmlDoc.getElementsByTagName("string")[0];

      if (stringElement && stringElement.textContent) {
        return stringElement.textContent;
      }

      return xmlText;
    } catch (error) {
      console.error("Error importando XML:", error);
      throw error;
    }
  },

  // Verificar que el servicio está funcionando
  ping: async (): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/XmlService.asmx/Ping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`Error en ping: ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const stringElement = xmlDoc.getElementsByTagName("string")[0];

      if (stringElement && stringElement.textContent) {
        return stringElement.textContent;
      }

      return xmlText;
    } catch (error) {
      console.error("Error en ping:", error);
      throw error;
    }
  },
};

// ============================================
// IDIOMAS ENDPOINTS
// ============================================

export const idiomasAPI = {
  // GET /api/idiomas - Obtener lista de idiomas activos
  obtenerIdiomas: async (): Promise<IdiomasResponse> => {
    return apiCall<IdiomasResponse>("/api/idiomas", {
      method: "GET",
    });
  },

  // GET /api/idiomas/traducciones/{idiomaId} - Obtener traducciones por ID de idioma
  obtenerTraduccionesPorId: async (
    idiomaId: number
  ): Promise<TraduccionesResponse> => {
    return apiCall<TraduccionesResponse>(
      `/api/idiomas/traducciones/${idiomaId}`,
      {
        method: "GET",
      }
    );
  },

  // GET /api/idiomas/traducciones/codigo/{codigoIdioma} - Obtener traducciones por código de idioma
  obtenerTraduccionesPorCodigo: async (
    codigoIdioma: string
  ): Promise<TraduccionesResponse> => {
    return apiCall<TraduccionesResponse>(
      `/api/idiomas/traducciones/codigo/${codigoIdioma}`,
      {
        method: "GET",
      }
    );
  },

  // POST /api/idiomas/limpiar-cache - Limpiar cache de traducciones (solo admin)
  limpiarCache: async (): Promise<ApiResponse> => {
    return apiCall<ApiResponse>("/api/idiomas/limpiar-cache", {
      method: "POST",
    });
  },
};

// Exportar todo como un objeto centralizado
export const api = {
  auth: authAPI,
  usuarios: usuariosAPI,
  emociones: emocionesAPI,
  productos: productosAPI,
  peliculas: peliculasAPI,
  libros: librosAPI,
  carrito: carritoAPI,
  pedidos: pedidosAPI,
  permisos: permisosAPI,
  bitacora: bitacoraAPI,
  backup: backupAPI,
  dv: dvAPI,
  xml: xmlAPI,
  idiomas: idiomasAPI,
};

export default api;

// ============================================
// INTEGRIDAD (DVH/DVV) API
// ============================================

export const integridadAPI = {
  // POST /api/integridad/recalcular - Recalcular todos los dígitos verificadores
  recalcular: async (): Promise<ApiResponse<any>> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}/api/integridad/recalcular`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        Message: "Error al recalcular dígitos verificadores",
      }));
      throw new Error(errorData.Message || "Error en la solicitud");
    }

    return await response.json();
  },

  // GET /api/integridad/verificar - Verificar integridad (endpoint futuro)
  verificar: async (): Promise<ApiResponse<any>> => {
    const headers: Record<string, string> = {};

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}/api/integridad/verificar`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        Message: "Error al verificar integridad",
      }));
      throw new Error(errorData.Message || "Error en la solicitud");
    }

    return await response.json();
  },
};
