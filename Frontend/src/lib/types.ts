// ===================================
// INTERFACES PARA EL BACKEND MOODFLIX
// ===================================

// ========== AUTENTICACIÓN ==========
export interface LoginModel {
  Email: string;
  Password: string;
}

export interface RegistroModel {
  NombreUsuario: string;
  Email: string;
  Password: string;
}

export interface LoginResponse {
  Usuario?: Usuario;
  Permisos?: Permiso[];
  token?: string;
  Token?: string;
}

// ========== USUARIO ==========
export interface Usuario {
  Id: number;
  NombreUsuario: string;
  Email: string;
  PasswordHash?: string;
  Bloqueado: boolean;
  IntentosFallidos: number;
  IntentosIncorrectos?: number; // Alias para compatibilidad
  FechaCreacion?: string; // Opcional porque no existe en la BD
  FechaUltimaModificacion?: string;
  Activo?: boolean; // Opcional porque no existe en la BD
  DVH?: string;
  SessionToken?: string;
  Direcciones?: any[];
  Pedidos?: any[];
  Permisos?: Permiso[];
}

// ========== PERMISOS ==========
export interface Permiso {
  Id: number;
  Nombre: string;
  Tipo: 'Patente' | 'Familia';
  Descripcion?: string;
  Hijos?: Permiso[];
}

export interface AsignarPermisosRequest {
  PermisosIds: number[];
}

// Tipos para crear y actualizar permisos
export interface CreatePermisoRequest {
  Nombre: string;
  Tipo: 'Patente' | 'Familia';
  Descripcion?: string;
  PadreId?: number;
}

export interface UpdatePermisoRequest {
  Nombre?: string;
  Descripcion?: string;
}

// ========== PRODUCTOS ==========
export interface Producto {
  Id: number;
  Nombre: string; // En la BD se llama Nombre, no Titulo
  Titulo?: string; // Alias para compatibilidad
  Descripcion: string;
  Precio: number;
  Stock: number;
  Tipo: 'Libro' | 'Pelicula';
  UrlImagen?: string;
  Activo?: boolean;
  FechaCreacion?: string;
  DVH?: string;
  Emociones?: Emocion[]; // Emociones asociadas al producto
}

export interface Pelicula extends Producto {
  Director: string;
  Productora: string;
  AnioLanzamiento: number;
}

export interface PeliculaCreateModel {
  Nombre: string;
  Descripcion: string;
  Precio: number;
  Stock: number;
  Director: string;
  Productora: string;
  AnioLanzamiento: number;
  UrlImagen?: string;
  EmocionesIds?: number[];
}

export interface PeliculaUpdateModel extends PeliculaCreateModel {
  Id: number;
}

// Alias para mantener compatibilidad con api-endpoints
export type CreatePeliculaRequest = PeliculaCreateModel;
export type UpdatePeliculaRequest = PeliculaUpdateModel;

export interface Libro extends Producto {
  Autor: string;
  Editorial: string;
  ISBN: string;
  AnioPublicacion?: number;
  NumeroPaginas?: number;
  UrlPDF?: string;
}

export interface LibroCreateModel {
  Titulo: string;
  Descripcion: string;
  Precio: number;
  Stock: number;
  Autor: string;
  Editorial: string;
  ISBN: string;
  NumeroPaginas: number;
  AnioPublicacion: number;
  UrlImagen?: string;
  UrlPDF?: string;
  EmocionesIds?: number[];
}

export interface LibroUpdateModel extends LibroCreateModel {
  Id: number;
}

// Alias para mantener compatibilidad con api-endpoints
export type CreateLibroRequest = LibroCreateModel;
export type UpdateLibroRequest = LibroUpdateModel;

// ========== EMOCIÓN ==========
export interface Emocion {
  Id: number;
  Nombre: string;
  Descripcion?: string;
  UrlImagen?: string;
  Color?: string;
  Activo: boolean;
  DVH?: string;
}

export interface EmocionCreateModel {
  Nombre: string;
  Descripcion?: string;
  UrlImagen?: string;
  Color?: string;
}

export interface EmocionUpdateModel extends EmocionCreateModel {
  Id: number;
}

// Alias para mantener compatibilidad con api-endpoints
export type CreateEmocionRequest = EmocionCreateModel;
export type UpdateEmocionRequest = EmocionUpdateModel;

// ========== BITÁCORA ==========
export interface BitacoraEntrada {
  Id: number;
  Fecha: string; // DateTime del backend
  Usuario?: Usuario;
  Modulo: string; // TipoModulo enum
  Operacion: string; // TipoOperacion enum
  Criticidad: number;
  Mensaje: string;
  DVH?: string;
}

export interface BitacoraFiltros {
  usuarioId?: number;
  criticidad?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Alias para mantener compatibilidad
export type BitacoraFiltro = BitacoraFiltros;
export type BitacoraEvento = BitacoraEntrada;

// ========== BACKUP ==========
export interface BackupResponse {
  Success: boolean;
  Message: string;
  Filename?: string;
  FilePath?: string;
}

export interface RestaurarBackupRequest {
  archivo: File;
}

// Tipos adicionales para backup
export interface Backup {
  Id: number;
  Nombre: string;
  Fecha: string;
  Tamanio: number;
  Ruta: string;
}

export interface BackupRequest {
  Descripcion?: string;
}

export interface RestoreRequest {
  BackupId: number;
}

// ========== CARRITO Y PEDIDOS ==========
export interface CarritoItem {
  ProductoId: number;
  Producto: Producto;
  Cantidad: number;
  Subtotal: number;
}

export interface Carrito {
  Items: CarritoItem[];
  Total: number;
}

export interface Pedido {
  Id: number;
  UsuarioId: number;
  Usuario?: Usuario;
  FechaPedido: string;
  Total: number;
  Estado: 'Pendiente' | 'Procesando' | 'Completado' | 'Cancelado' | 'Creado' | 'Pagado' | 'EnPreparacion' | 'Enviado';
  MetodoPago?: 'TarjetaDebito' | 'TarjetaCredito';
  Items?: PedidoItem[];
  Detalles?: PedidoItem[]; // Alias para compatibilidad con backend
  DireccionEnvioId?: number;
  DVH?: string;
}

export interface PedidoItem {
  Id: number;
  PedidoId: number;
  ProductoId: number;
  Producto?: Producto;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
}

export interface CrearPedidoRequest {
  Items: Array<{
    ProductoId: number;
    Cantidad: number;
  }>;
  MetodoPago: 'TarjetaDebito' | 'TarjetaCredito';
  DatosPago: DatosPago;
}

export interface DatosPago {
  NumeroTarjeta: string;
  FechaVencimiento: string;
  NombreTitular: string;
  CVV: string;
  Cuotas?: number;
}

// Alias para pagos
export type PagoRequest = CrearPedidoRequest;

export interface PagoResponse {
  Success: boolean;
  Message: string;
  PedidoId?: number;
  NumeroTransaccion?: string;
}

// ========== RESPUESTAS GENÉRICAS ==========
export interface ApiResponse<T = any> {
  Success: boolean;
  Message?: string;
  Data?: T;
  Errors?: string[];
}

export interface ApiError {
  Message: string;
  StatusCode?: number;
  ExceptionMessage?: string;
  ExceptionType?: string;
  StackTrace?: string;
  Errors?: string[];
}

// Tipos para dígitos verificadores
export interface DVCheckResponse {
  Success: boolean;
  Message: string;
  Inconsistencias?: Array<{
    Tabla: string;
    RegistroId: number;
    DVHEsperado: string;
    DVHActual: string;
  }>;
}

export interface DVRepairResponse {
  Success: boolean;
  Message: string;
  RegistrosReparados: number;
}

// ========== IDIOMAS ==========
export interface Idioma {
  Id: number;
  Codigo: string;
  Nombre: string;
  Bandera: string;
  Preestablecido: boolean;
}

export interface TraduccionesResponse {
  Success: boolean;
  Data: {
    IdiomaId: number;
    CodigoIdioma: string;
    Traducciones: Record<string, any>;
  };
}

export interface IdiomasResponse {
  Success: boolean;
  Data: Idioma[];
}

// ========== SERVICIO XML ==========
export interface XmlExportResponse {
  xmlData: string;
  success: boolean;
  message?: string;
}

export interface XmlImportRequest {
  xmlData: string;
}

export interface XmlImportResponse {
  success: boolean;
  message: string;
  productosImportados?: number;
}
