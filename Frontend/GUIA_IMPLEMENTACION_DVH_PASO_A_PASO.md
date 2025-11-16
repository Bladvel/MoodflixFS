# 🔒 GUÍA DE IMPLEMENTACIÓN PASO A PASO: Sistema de Dígitos Verificadores (DVH/DVV)

## 📋 ÍNDICE

1. [Introducción y Conceptos](#introducción-y-conceptos)
2. [PARTE 1: BACKEND (C#)](#parte-1-backend-c)
3. [PARTE 2: FRONTEND (React)](#parte-2-frontend-react)
4. [Testing y Validación](#testing-y-validación)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 INTRODUCCIÓN Y CONCEPTOS

### ¿Qué vamos a implementar?

Un sistema de integridad de datos que detecta:
- **Modificaciones no autorizadas** en registros (DVH corrupto)
- **Eliminación de registros** completos (DVV corrupto)
- **Corrupción de datos** en tablas críticas

### Componentes del Sistema

**DVH (Dígito Verificador Horizontal):**
- Hash SHA256 de todos los campos de una fila
- Se almacena en cada registro
- Detecta modificación de datos

**DVV (Dígito Verificador Vertical):**
- Hash SHA256 de todos los DVH de una tabla
- Se almacena en tabla separada
- Detecta eliminación de registros

### Tablas Críticas (con DVH)
- ✅ Usuario
- ✅ Producto
- ✅ Pedido
- ✅ Emocion
- ✅ Permiso

### Tabla NO Crítica (sin DVH)
- ❌ Bitacora (solo logs)

---


# PARTE 1: BACKEND (C#)

## 📦 FASE 1: PREPARACIÓN DE BASE DE DATOS

### PASO 1.1: Agregar columna DVH a tablas críticas

**Archivo:** Ejecutar en SQL Server Management Studio

```sql
-- ============================================
-- SCRIPT 1: Agregar columnas DVH
-- ============================================

-- Usuario
ALTER TABLE Usuario ADD DVH NVARCHAR(64) NULL;

-- Producto  
ALTER TABLE Producto ADD DVH NVARCHAR(64) NULL;

-- Pedido
ALTER TABLE Pedido ADD DVH NVARCHAR(64) NULL;

-- Emocion
ALTER TABLE Emocion ADD DVH NVARCHAR(64) NULL;

-- Permiso
ALTER TABLE Permiso ADD DVH NVARCHAR(64) NULL;

-- Verificar que se agregaron correctamente
SELECT 'Usuario' AS Tabla, COUNT(*) AS Registros FROM Usuario;
SELECT 'Producto' AS Tabla, COUNT(*) AS Registros FROM Producto;
SELECT 'Pedido' AS Tabla, COUNT(*) AS Registros FROM Pedido;
SELECT 'Emocion' AS Tabla, COUNT(*) AS Registros FROM Emocion;
SELECT 'Permiso' AS Tabla, COUNT(*) AS Registros FROM Permiso;
```

**✅ Verificación:**
- Ejecuta el script
- Verifica que cada tabla tenga la columna DVH
- Todos los valores DVH deben ser NULL inicialmente

---

### PASO 1.2: Crear tabla de Dígitos Verificadores Verticales

```sql
-- ============================================
-- SCRIPT 2: Crear tabla DVV
-- ============================================

CREATE TABLE DigitosVerificadoresVerticales (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    NombreTabla NVARCHAR(50) NOT NULL UNIQUE,
    DVV NVARCHAR(64) NOT NULL,
    FechaActualizacion DATETIME NOT NULL DEFAULT GETDATE()
);

-- Insertar registros iniciales (vacíos)
INSERT INTO DigitosVerificadoresVerticales (NombreTabla, DVV) VALUES 
('Usuario', ''),
('Producto', ''),
('Pedido', ''),
('Emocion', ''),
('Permiso', '');

-- Verificar
SELECT * FROM DigitosVerificadoresVerticales;
```

**✅ Verificación:**
- La tabla debe tener 5 registros
- Todos con DVV vacío ('')
- FechaActualizacion debe ser la fecha actual

---


## 🏗️ FASE 2: CREAR CLASES DE ENTIDAD (BE)

### PASO 2.1: Crear clase InconsistenciaIntegridad

**Archivo:** `BE/InconsistenciaIntegridad.cs`

```csharp
using System;

namespace BE
{
    /// <summary>
    /// Representa una inconsistencia detectada en la integridad de datos
    /// </summary>
    public class InconsistenciaIntegridad
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Nombre de la tabla donde se detectó la inconsistencia
        /// </summary>
        public string NombreTabla { get; set; }
        
        /// <summary>
        /// ID del registro afectado (null si es DVV corrupto)
        /// </summary>
        public int? RegistroId { get; set; }
        
        /// <summary>
        /// Tipo de inconsistencia: DVH_CORRUPTO, REGISTRO_ELIMINADO, DVV_CORRUPTO
        /// </summary>
        public string TipoInconsistencia { get; set; }
        
        /// <summary>
        /// Descripción detallada del error
        /// </summary>
        public string DescripcionError { get; set; }
        
        /// <summary>
        /// Fecha y hora en que se detectó la inconsistencia
        /// </summary>
        public DateTime FechaDeteccion { get; set; }
        
        /// <summary>
        /// Indica si la inconsistencia fue reparada
        /// </summary>
        public bool Reparado { get; set; }
    }
}
```

**✅ Verificación:**
- Compila sin errores
- Todas las propiedades tienen comentarios XML

---

### PASO 2.2: Crear clase DVV

**Archivo:** `BE/DVV.cs`

```csharp
using System;

namespace BE
{
    /// <summary>
    /// Representa un Dígito Verificador Vertical de una tabla
    /// </summary>
    public class DVV
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Nombre de la tabla (Usuario, Producto, etc.)
        /// </summary>
        public string NombreTabla { get; set; }
        
        /// <summary>
        /// Hash SHA256 calculado de todos los DVH de la tabla
        /// </summary>
        public string DigitosVerificadores { get; set; }
        
        /// <summary>
        /// Última fecha de actualización del DVV
        /// </summary>
        public DateTime FechaActualizacion { get; set; }
    }
}
```

**✅ Verificación:**
- Compila sin errores
- Propiedades coinciden con la tabla de BD

---


## 🔧 FASE 3: CREAR UTILIDADES DE HASH

### PASO 3.1: Crear carpeta Helpers en BE

**Acción:** Crear carpeta `BE/Helpers/` si no existe

---

### PASO 3.2: Crear clase HashHelper

**Archivo:** `BE/Helpers/HashHelper.cs`

```csharp
using System;
using System.Security.Cryptography;
using System.Text;
using System.Linq;

namespace BE.Helpers
{
    /// <summary>
    /// Utilidades para calcular hashes SHA256 para DVH y DVV
    /// </summary>
    public static class HashHelper
    {
        /// <summary>
        /// Calcula el hash SHA256 de un string
        /// </summary>
        /// <param name="input">Texto a hashear</param>
        /// <returns>Hash en Base64</returns>
        public static string CalcularSHA256(string input)
        {
            if (string.IsNullOrEmpty(input)) 
                return string.Empty;
            
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(input));
                return Convert.ToBase64String(bytes);
            }
        }
        
        /// <summary>
        /// Calcula el DVH (Dígito Verificador Horizontal) de un registro
        /// Concatena todos los campos con | y calcula el hash
        /// </summary>
        /// <param name="campos">Campos del registro a hashear</param>
        /// <returns>DVH en Base64</returns>
        public static string CalcularDVH(params object[] campos)
        {
            // Filtrar nulls y concatenar con |
            var concatenacion = string.Join("|", 
                campos.Where(c => c != null)
                      .Select(c => c.ToString()));
            
            return CalcularSHA256(concatenacion);
        }
        
        /// <summary>
        /// Calcula el DVV (Dígito Verificador Vertical) de una tabla
        /// Concatena todos los DVH ordenados y calcula el hash
        /// </summary>
        /// <param name="dvhArray">Array de DVH de todos los registros</param>
        /// <returns>DVV en Base64</returns>
        public static string CalcularDVV(string[] dvhArray)
        {
            // Ordenar DVH alfabéticamente y concatenar
            var concatenacion = string.Join("", dvhArray.OrderBy(d => d));
            return CalcularSHA256(concatenacion);
        }
    }
}
```

**✅ Verificación:**
- Compila sin errores
- Prueba manual:
```csharp
// En un test o Main temporal
var dvh = HashHelper.CalcularDVH(1, "test", "email@test.com");
Console.WriteLine(dvh); // Debe imprimir un hash Base64
```

---


## 💾 FASE 4: CREAR CAPA DE ACCESO A DATOS (DAL)

### PASO 4.1: Crear clase DVVDAL

**Archivo:** `DAL/DVVDAL.cs`

```csharp
using BE;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace DAL
{
    /// <summary>
    /// Data Access Layer para Dígitos Verificadores Verticales
    /// </summary>
    public class DVVDAL : Mapper<DVV>
    {
        public override int Create(DVV entity)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    INSERT INTO DigitosVerificadoresVerticales 
                    (NombreTabla, DVV, FechaActualizacion) 
                    VALUES (@NombreTabla, @DVV, @FechaActualizacion);
                    SELECT CAST(SCOPE_IDENTITY() AS INT);", con);
                
                cmd.Parameters.AddWithValue("@NombreTabla", entity.NombreTabla);
                cmd.Parameters.AddWithValue("@DVV", entity.DigitosVerificadores);
                cmd.Parameters.AddWithValue("@FechaActualizacion", entity.FechaActualizacion);
                
                con.Open();
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }
        
        /// <summary>
        /// Actualiza el DVV de una tabla específica
        /// </summary>
        public void ActualizarDVV(string nombreTabla, string nuevoDVV)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    UPDATE DigitosVerificadoresVerticales 
                    SET DVV = @DVV, FechaActualizacion = @Fecha 
                    WHERE NombreTabla = @NombreTabla", con);
                
                cmd.Parameters.AddWithValue("@DVV", nuevoDVV);
                cmd.Parameters.AddWithValue("@Fecha", DateTime.Now);
                cmd.Parameters.AddWithValue("@NombreTabla", nombreTabla);
                
                con.Open();
                cmd.ExecuteNonQuery();
            }
        }
        
        /// <summary>
        /// Obtiene el DVV de una tabla específica
        /// </summary>
        public DVV ObtenerPorTabla(string nombreTabla)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    SELECT Id, NombreTabla, DVV, FechaActualizacion 
                    FROM DigitosVerificadoresVerticales 
                    WHERE NombreTabla = @NombreTabla", con);
                
                cmd.Parameters.AddWithValue("@NombreTabla", nombreTabla);
                
                con.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new DVV
                        {
                            Id = reader.GetInt32(0),
                            NombreTabla = reader.GetString(1),
                            DigitosVerificadores = reader.GetString(2),
                            FechaActualizacion = reader.GetDateTime(3)
                        };
                    }
                }
            }
            return null;
        }
        
        // Métodos abstractos requeridos por Mapper<T>
        public override List<DVV> GetAll() 
        { 
            throw new NotImplementedException("No se requiere para DVV"); 
        }
        
        public override DVV GetById(int id) 
        { 
            throw new NotImplementedException("Usar ObtenerPorTabla en su lugar"); 
        }
        
        public override void Update(DVV entity) 
        { 
            throw new NotImplementedException("Usar ActualizarDVV en su lugar"); 
        }
        
        public override void Delete(int id) 
        { 
            throw new NotImplementedException("No se permite eliminar DVV"); 
        }
        
        protected override DVV Transform(DataRow row) 
        { 
            throw new NotImplementedException("No se requiere para DVV"); 
        }
    }
}
```

**✅ Verificación:**
- Compila sin errores
- Hereda correctamente de Mapper<DVV>
- Connection string configurado en Web.config/App.config

---


## 🧠 FASE 5: CREAR LÓGICA DE NEGOCIO (BLL)

### PASO 5.1: Crear clase IntegridadBLL (Parte 1 - Estructura)

**Archivo:** `BLL/IntegridadBLL.cs`

```csharp
using BE;
using BE.Helpers;
using DAL;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;

namespace BLL
{
    /// <summary>
    /// Business Logic Layer para gestión de integridad de datos
    /// Implementa patrón Singleton
    /// </summary>
    public class IntegridadBLL
    {
        private static readonly object padlock = new object();
        private static IntegridadBLL instance = null;
        
        private readonly DVVDAL _dvvDAL = new DVVDAL();
        private readonly string _connectionString = 
            System.Configuration.ConfigurationManager
                .ConnectionStrings["DefaultConnection"].ConnectionString;
        
        /// <summary>
        /// Instancia única de IntegridadBLL (Singleton)
        /// </summary>
        public static IntegridadBLL Instance
        {
            get
            {
                lock (padlock)
                {
                    if (instance == null)
                        instance = new IntegridadBLL();
                    return instance;
                }
            }
        }
        
        private IntegridadBLL() { }
        
        /// <summary>
        /// Verifica la integridad de todas las tablas críticas
        /// </summary>
        /// <returns>Lista de inconsistencias encontradas</returns>
        public List<InconsistenciaIntegridad> VerificarIntegridad()
        {
            var inconsistencias = new List<InconsistenciaIntegridad>();
            
            // Verificar cada tabla crítica
            inconsistencias.AddRange(VerificarTablaUsuario());
            inconsistencias.AddRange(VerificarTablaProducto());
            inconsistencias.AddRange(VerificarTablaPedido());
            inconsistencias.AddRange(VerificarTablaEmocion());
            inconsistencias.AddRange(VerificarTablaPermiso());
            
            return inconsistencias;
        }
        
        /// <summary>
        /// Recalcula todos los dígitos verificadores (DVH y DVV)
        /// </summary>
        public void RecalcularTodosLosDV()
        {
            RecalcularDVTablaUsuario();
            RecalcularDVTablaProducto();
            RecalcularDVTablaPedido();
            RecalcularDVTablaEmocion();
            RecalcularDVTablaPermiso();
        }
        
        // Los métodos específicos se implementan en los siguientes pasos...
    }
}
```

**✅ Verificación:**
- Compila sin errores
- Patrón Singleton implementado correctamente
- Connection string accesible

---


### PASO 5.2: Implementar VerificarTablaUsuario

**Agregar al archivo:** `BLL/IntegridadBLL.cs`

```csharp
/// <summary>
/// Verifica la integridad de la tabla Usuario
/// </summary>
private List<InconsistenciaIntegridad> VerificarTablaUsuario()
{
    var inconsistencias = new List<InconsistenciaIntegridad>();
    
    using (var con = new SqlConnection(_connectionString))
    {
        var cmd = new SqlCommand(@"
            SELECT Id, NombreUsuario, Email, PasswordHash, 
                   IntentosFallidos, Bloqueado, DVH 
            FROM Usuario", con);
        
        con.Open();
        
        var dvhCalculados = new List<string>();
        
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var id = reader.GetInt32(0);
                var dvhAlmacenado = reader.IsDBNull(6) ? "" : reader.GetString(6);
                
                // Calcular DVH actual basado en los campos
                var dvhCalculado = HashHelper.CalcularDVH(
                    reader.GetInt32(0),      // Id
                    reader.GetString(1),     // NombreUsuario
                    reader.GetString(2),     // Email
                    reader.GetString(3),     // PasswordHash
                    reader.GetInt32(4),      // IntentosFallidos
                    reader.GetBoolean(5)     // Bloqueado
                );
                
                dvhCalculados.Add(dvhCalculado);
                
                // Verificar si el DVH coincide
                if (dvhAlmacenado != dvhCalculado)
                {
                    inconsistencias.Add(new InconsistenciaIntegridad
                    {
                        NombreTabla = "Usuario",
                        RegistroId = id,
                        TipoInconsistencia = "DVH_CORRUPTO",
                        DescripcionError = $"DVH corrupto en Usuario ID {id}",
                        FechaDeteccion = DateTime.Now,
                        Reparado = false
                    });
                }
            }
        }
        
        // Verificar DVV (Dígito Verificador Vertical)
        var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
        var dvvAlmacenado = _dvvDAL.ObtenerPorTabla("Usuario");
        
        if (dvvAlmacenado == null || dvvAlmacenado.DigitosVerificadores != dvvCalculado)
        {
            inconsistencias.Add(new InconsistenciaIntegridad
            {
                NombreTabla = "Usuario",
                RegistroId = null,
                TipoInconsistencia = "DVV_CORRUPTO",
                DescripcionError = "DVV corrupto en tabla Usuario. Posible eliminación de registros.",
                FechaDeteccion = DateTime.Now,
                Reparado = false
            });
        }
    }
    
    return inconsistencias;
}
```

**✅ Verificación:**
- Compila sin errores
- Verifica tanto DVH como DVV
- Maneja correctamente valores NULL

---


### PASO 5.3: Implementar VerificarTablaProducto

**Agregar al archivo:** `BLL/IntegridadBLL.cs`

```csharp
/// <summary>
/// Verifica la integridad de la tabla Producto
/// </summary>
private List<InconsistenciaIntegridad> VerificarTablaProducto()
{
    var inconsistencias = new List<InconsistenciaIntegridad>();
    
    using (var con = new SqlConnection(_connectionString))
    {
        var cmd = new SqlCommand(@"
            SELECT Id, Nombre, Descripcion, Precio, Stock, 
                   ImagenUrl, TipoProductoId, EmocionId, DVH 
            FROM Producto", con);
        
        con.Open();
        
        var dvhCalculados = new List<string>();
        
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var id = reader.GetInt32(0);
                var dvhAlmacenado = reader.IsDBNull(8) ? "" : reader.GetString(8);
                
                // Calcular DVH actual
                var dvhCalculado = HashHelper.CalcularDVH(
                    reader.GetInt32(0),                                    // Id
                    reader.GetString(1),                                   // Nombre
                    reader.IsDBNull(2) ? "" : reader.GetString(2),        // Descripcion
                    reader.GetDecimal(3),                                  // Precio
                    reader.GetInt32(4),                                    // Stock
                    reader.IsDBNull(5) ? "" : reader.GetString(5),        // ImagenUrl
                    reader.GetInt32(6),                                    // TipoProductoId
                    reader.GetInt32(7)                                     // EmocionId
                );
                
                dvhCalculados.Add(dvhCalculado);
                
                if (dvhAlmacenado != dvhCalculado)
                {
                    inconsistencias.Add(new InconsistenciaIntegridad
                    {
                        NombreTabla = "Producto",
                        RegistroId = id,
                        TipoInconsistencia = "DVH_CORRUPTO",
                        DescripcionError = $"DVH corrupto en Producto ID {id}",
                        FechaDeteccion = DateTime.Now,
                        Reparado = false
                    });
                }
            }
        }
        
        // Verificar DVV
        var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
        var dvvAlmacenado = _dvvDAL.ObtenerPorTabla("Producto");
        
        if (dvvAlmacenado == null || dvvAlmacenado.DigitosVerificadores != dvvCalculado)
        {
            inconsistencias.Add(new InconsistenciaIntegridad
            {
                NombreTabla = "Producto",
                RegistroId = null,
                TipoInconsistencia = "DVV_CORRUPTO",
                DescripcionError = "DVV corrupto en tabla Producto",
                FechaDeteccion = DateTime.Now,
                Reparado = false
            });
        }
    }
    
    return inconsistencias;
}
```

**✅ Verificación:**
- Maneja campos nullable correctamente
- Incluye todos los campos de Producto

---


### PASO 5.4: Implementar métodos para Pedido, Emocion y Permiso

**Agregar al archivo:** `BLL/IntegridadBLL.cs`

```csharp
/// <summary>
/// Verifica la integridad de la tabla Pedido
/// </summary>
private List<InconsistenciaIntegridad> VerificarTablaPedido()
{
    var inconsistencias = new List<InconsistenciaIntegridad>();
    
    using (var con = new SqlConnection(_connectionString))
    {
        var cmd = new SqlCommand(@"
            SELECT Id, UsuarioId, FechaPedido, Total, Estado, DVH 
            FROM Pedido", con);
        
        con.Open();
        var dvhCalculados = new List<string>();
        
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var id = reader.GetInt32(0);
                var dvhAlmacenado = reader.IsDBNull(5) ? "" : reader.GetString(5);
                
                var dvhCalculado = HashHelper.CalcularDVH(
                    reader.GetInt32(0),      // Id
                    reader.GetInt32(1),      // UsuarioId
                    reader.GetDateTime(2),   // FechaPedido
                    reader.GetDecimal(3),    // Total
                    reader.GetString(4)      // Estado
                );
                
                dvhCalculados.Add(dvhCalculado);
                
                if (dvhAlmacenado != dvhCalculado)
                {
                    inconsistencias.Add(new InconsistenciaIntegridad
                    {
                        NombreTabla = "Pedido",
                        RegistroId = id,
                        TipoInconsistencia = "DVH_CORRUPTO",
                        DescripcionError = $"DVH corrupto en Pedido ID {id}",
                        FechaDeteccion = DateTime.Now,
                        Reparado = false
                    });
                }
            }
        }
        
        var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
        var dvvAlmacenado = _dvvDAL.ObtenerPorTabla("Pedido");
        
        if (dvvAlmacenado == null || dvvAlmacenado.DigitosVerificadores != dvvCalculado)
        {
            inconsistencias.Add(new InconsistenciaIntegridad
            {
                NombreTabla = "Pedido",
                RegistroId = null,
                TipoInconsistencia = "DVV_CORRUPTO",
                DescripcionError = "DVV corrupto en tabla Pedido",
                FechaDeteccion = DateTime.Now,
                Reparado = false
            });
        }
    }
    
    return inconsistencias;
}

/// <summary>
/// Verifica la integridad de la tabla Emocion
/// </summary>
private List<InconsistenciaIntegridad> VerificarTablaEmocion()
{
    var inconsistencias = new List<InconsistenciaIntegridad>();
    
    using (var con = new SqlConnection(_connectionString))
    {
        var cmd = new SqlCommand(@"
            SELECT Id, Nombre, Descripcion, DVH 
            FROM Emocion", con);
        
        con.Open();
        var dvhCalculados = new List<string>();
        
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var id = reader.GetInt32(0);
                var dvhAlmacenado = reader.IsDBNull(3) ? "" : reader.GetString(3);
                
                var dvhCalculado = HashHelper.CalcularDVH(
                    reader.GetInt32(0),                                    // Id
                    reader.GetString(1),                                   // Nombre
                    reader.IsDBNull(2) ? "" : reader.GetString(2)         // Descripcion
                );
                
                dvhCalculados.Add(dvhCalculado);
                
                if (dvhAlmacenado != dvhCalculado)
                {
                    inconsistencias.Add(new InconsistenciaIntegridad
                    {
                        NombreTabla = "Emocion",
                        RegistroId = id,
                        TipoInconsistencia = "DVH_CORRUPTO",
                        DescripcionError = $"DVH corrupto en Emocion ID {id}",
                        FechaDeteccion = DateTime.Now,
                        Reparado = false
                    });
                }
            }
        }
        
        var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
        var dvvAlmacenado = _dvvDAL.ObtenerPorTabla("Emocion");
        
        if (dvvAlmacenado == null || dvvAlmacenado.DigitosVerificadores != dvvCalculado)
        {
            inconsistencias.Add(new InconsistenciaIntegridad
            {
                NombreTabla = "Emocion",
                RegistroId = null,
                TipoInconsistencia = "DVV_CORRUPTO",
                DescripcionError = "DVV corrupto en tabla Emocion",
                FechaDeteccion = DateTime.Now,
                Reparado = false
            });
        }
    }
    
    return inconsistencias;
}

/// <summary>
/// Verifica la integridad de la tabla Permiso
/// </summary>
private List<InconsistenciaIntegridad> VerificarTablaPermiso()
{
    var inconsistencias = new List<InconsistenciaIntegridad>();
    
    using (var con = new SqlConnection(_connectionString))
    {
        var cmd = new SqlCommand(@"
            SELECT Id, Nombre, Descripcion, DVH 
            FROM Permiso", con);
        
        con.Open();
        var dvhCalculados = new List<string>();
        
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var id = reader.GetInt32(0);
                var dvhAlmacenado = reader.IsDBNull(3) ? "" : reader.GetString(3);
                
                var dvhCalculado = HashHelper.CalcularDVH(
                    reader.GetInt32(0),                                    // Id
                    reader.GetString(1),                                   // Nombre
                    reader.IsDBNull(2) ? "" : reader.GetString(2)         // Descripcion
                );
                
                dvhCalculados.Add(dvhCalculado);
                
                if (dvhAlmacenado != dvhCalculado)
                {
                    inconsistencias.Add(new InconsistenciaIntegridad
                    {
                        NombreTabla = "Permiso",
                        RegistroId = id,
                        TipoInconsistencia = "DVH_CORRUPTO",
                        DescripcionError = $"DVH corrupto en Permiso ID {id}",
                        FechaDeteccion = DateTime.Now,
                        Reparado = false
                    });
                }
            }
        }
        
        var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
        var dvvAlmacenado = _dvvDAL.ObtenerPorTabla("Permiso");
        
        if (dvvAlmacenado == null || dvvAlmacenado.DigitosVerificadores != dvvCalculado)
        {
            inconsistencias.Add(new InconsistenciaIntegridad
            {
                NombreTabla = "Permiso",
                RegistroId = null,
                TipoInconsistencia = "DVV_CORRUPTO",
                DescripcionError = "DVV corrupto en tabla Permiso",
                FechaDeteccion = DateTime.Now,
                Reparado = false
            });
        }
    }
    
    return inconsistencias;
}
```

**✅ Verificación:**
- Todos los métodos siguen el mismo patrón
- Verifican DVH y DVV correctamente

---


### PASO 5.5: Implementar RecalcularDVTablaUsuario

**Agregar al archivo:** `BLL/IntegridadBLL.cs`

```csharp
/// <summary>
/// Recalcula todos los DVH y DVV de la tabla Usuario
/// </summary>
private void RecalcularDVTablaUsuario()
{
    using (var con = new SqlConnection(_connectionString))
    {
        con.Open();
        var transaction = con.BeginTransaction();
        
        try
        {
            var dvhCalculados = new List<string>();
            
            // Obtener todos los registros
            var selectCmd = new SqlCommand(@"
                SELECT Id, NombreUsuario, Email, PasswordHash, 
                       IntentosFallidos, Bloqueado 
                FROM Usuario", con, transaction);
            
            var updates = new List<(int Id, string DVH)>();
            
            using (var reader = selectCmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var id = reader.GetInt32(0);
                    
                    var dvhCalculado = HashHelper.CalcularDVH(
                        reader.GetInt32(0),      // Id
                        reader.GetString(1),     // NombreUsuario
                        reader.GetString(2),     // Email
                        reader.GetString(3),     // PasswordHash
                        reader.GetInt32(4),      // IntentosFallidos
                        reader.GetBoolean(5)     // Bloqueado
                    );
                    
                    updates.Add((id, dvhCalculado));
                    dvhCalculados.Add(dvhCalculado);
                }
            }
            
            // Actualizar DVH de cada registro
            foreach (var update in updates)
            {
                var updateCmd = new SqlCommand(@"
                    UPDATE Usuario 
                    SET DVH = @DVH 
                    WHERE Id = @Id", con, transaction);
                
                updateCmd.Parameters.AddWithValue("@DVH", update.DVH);
                updateCmd.Parameters.AddWithValue("@Id", update.Id);
                updateCmd.ExecuteNonQuery();
            }
            
            // Calcular y actualizar DVV
            var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
            _dvvDAL.ActualizarDVV("Usuario", dvvCalculado);
            
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}
```

**✅ Verificación:**
- Usa transacciones para atomicidad
- Actualiza DVH y DVV correctamente
- Rollback en caso de error

---


### PASO 5.6: Implementar métodos de recálculo para otras tablas

**Agregar al archivo:** `BLL/IntegridadBLL.cs`

```csharp
/// <summary>
/// Recalcula todos los DVH y DVV de la tabla Producto
/// </summary>
private void RecalcularDVTablaProducto()
{
    using (var con = new SqlConnection(_connectionString))
    {
        con.Open();
        var transaction = con.BeginTransaction();
        
        try
        {
            var dvhCalculados = new List<string>();
            var selectCmd = new SqlCommand(@"
                SELECT Id, Nombre, Descripcion, Precio, Stock, 
                       ImagenUrl, TipoProductoId, EmocionId 
                FROM Producto", con, transaction);
            
            var updates = new List<(int Id, string DVH)>();
            
            using (var reader = selectCmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var id = reader.GetInt32(0);
                    var dvhCalculado = HashHelper.CalcularDVH(
                        reader.GetInt32(0),
                        reader.GetString(1),
                        reader.IsDBNull(2) ? "" : reader.GetString(2),
                        reader.GetDecimal(3),
                        reader.GetInt32(4),
                        reader.IsDBNull(5) ? "" : reader.GetString(5),
                        reader.GetInt32(6),
                        reader.GetInt32(7)
                    );
                    
                    updates.Add((id, dvhCalculado));
                    dvhCalculados.Add(dvhCalculado);
                }
            }
            
            foreach (var update in updates)
            {
                var updateCmd = new SqlCommand(
                    "UPDATE Producto SET DVH = @DVH WHERE Id = @Id", 
                    con, transaction);
                updateCmd.Parameters.AddWithValue("@DVH", update.DVH);
                updateCmd.Parameters.AddWithValue("@Id", update.Id);
                updateCmd.ExecuteNonQuery();
            }
            
            var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
            _dvvDAL.ActualizarDVV("Producto", dvvCalculado);
            
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

/// <summary>
/// Recalcula todos los DVH y DVV de la tabla Pedido
/// </summary>
private void RecalcularDVTablaPedido()
{
    using (var con = new SqlConnection(_connectionString))
    {
        con.Open();
        var transaction = con.BeginTransaction();
        
        try
        {
            var dvhCalculados = new List<string>();
            var selectCmd = new SqlCommand(@"
                SELECT Id, UsuarioId, FechaPedido, Total, Estado 
                FROM Pedido", con, transaction);
            
            var updates = new List<(int Id, string DVH)>();
            
            using (var reader = selectCmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var id = reader.GetInt32(0);
                    var dvhCalculado = HashHelper.CalcularDVH(
                        reader.GetInt32(0),
                        reader.GetInt32(1),
                        reader.GetDateTime(2),
                        reader.GetDecimal(3),
                        reader.GetString(4)
                    );
                    
                    updates.Add((id, dvhCalculado));
                    dvhCalculados.Add(dvhCalculado);
                }
            }
            
            foreach (var update in updates)
            {
                var updateCmd = new SqlCommand(
                    "UPDATE Pedido SET DVH = @DVH WHERE Id = @Id", 
                    con, transaction);
                updateCmd.Parameters.AddWithValue("@DVH", update.DVH);
                updateCmd.Parameters.AddWithValue("@Id", update.Id);
                updateCmd.ExecuteNonQuery();
            }
            
            var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
            _dvvDAL.ActualizarDVV("Pedido", dvvCalculado);
            
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

/// <summary>
/// Recalcula todos los DVH y DVV de la tabla Emocion
/// </summary>
private void RecalcularDVTablaEmocion()
{
    using (var con = new SqlConnection(_connectionString))
    {
        con.Open();
        var transaction = con.BeginTransaction();
        
        try
        {
            var dvhCalculados = new List<string>();
            var selectCmd = new SqlCommand(@"
                SELECT Id, Nombre, Descripcion 
                FROM Emocion", con, transaction);
            
            var updates = new List<(int Id, string DVH)>();
            
            using (var reader = selectCmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var id = reader.GetInt32(0);
                    var dvhCalculado = HashHelper.CalcularDVH(
                        reader.GetInt32(0),
                        reader.GetString(1),
                        reader.IsDBNull(2) ? "" : reader.GetString(2)
                    );
                    
                    updates.Add((id, dvhCalculado));
                    dvhCalculados.Add(dvhCalculado);
                }
            }
            
            foreach (var update in updates)
            {
                var updateCmd = new SqlCommand(
                    "UPDATE Emocion SET DVH = @DVH WHERE Id = @Id", 
                    con, transaction);
                updateCmd.Parameters.AddWithValue("@DVH", update.DVH);
                updateCmd.Parameters.AddWithValue("@Id", update.Id);
                updateCmd.ExecuteNonQuery();
            }
            
            var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
            _dvvDAL.ActualizarDVV("Emocion", dvvCalculado);
            
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

/// <summary>
/// Recalcula todos los DVH y DVV de la tabla Permiso
/// </summary>
private void RecalcularDVTablaPermiso()
{
    using (var con = new SqlConnection(_connectionString))
    {
        con.Open();
        var transaction = con.BeginTransaction();
        
        try
        {
            var dvhCalculados = new List<string>();
            var selectCmd = new SqlCommand(@"
                SELECT Id, Nombre, Descripcion 
                FROM Permiso", con, transaction);
            
            var updates = new List<(int Id, string DVH)>();
            
            using (var reader = selectCmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var id = reader.GetInt32(0);
                    var dvhCalculado = HashHelper.CalcularDVH(
                        reader.GetInt32(0),
                        reader.GetString(1),
                        reader.IsDBNull(2) ? "" : reader.GetString(2)
                    );
                    
                    updates.Add((id, dvhCalculado));
                    dvhCalculados.Add(dvhCalculado);
                }
            }
            
            foreach (var update in updates)
            {
                var updateCmd = new SqlCommand(
                    "UPDATE Permiso SET DVH = @DVH WHERE Id = @Id", 
                    con, transaction);
                updateCmd.Parameters.AddWithValue("@DVH", update.DVH);
                updateCmd.Parameters.AddWithValue("@Id", update.Id);
                updateCmd.ExecuteNonQuery();
            }
            
            var dvvCalculado = HashHelper.CalcularDVV(dvhCalculados.ToArray());
            _dvvDAL.ActualizarDVV("Permiso", dvvCalculado);
            
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}
```

**✅ Verificación:**
- Todos los métodos usan transacciones
- Patrón consistente en todas las tablas
- Manejo de errores con rollback

---


## 🌐 FASE 6: CREAR CONTROLLERS (API)

### PASO 6.1: Modificar AuthController para verificar integridad en Login

**Archivo:** `Backend/Controllers/AuthController.cs`

**Buscar el método Login y modificarlo:**

```csharp
[HttpPost]
[Route("login")]
public IHttpActionResult Login([FromBody] LoginRequest request)
{
    try
    {
        // ============================================
        // VERIFICAR INTEGRIDAD ANTES DEL LOGIN
        // ============================================
        var inconsistencias = IntegridadBLL.Instance.VerificarIntegridad();
        
        if (inconsistencias.Any())
        {
            // Si hay inconsistencias, solo permitir login a Webmaster
            var usuario = _usuarioBLL.ObtenerPorEmail(request.Email);
            
            if (usuario == null)
            {
                return BadRequest(new { 
                    Message = "Credenciales inválidas",
                    StatusCode = 401
                });
            }
            
            // Verificar si es Webmaster
            var permisos = _permisosBLL.ObtenerPermisosPorUsuario(usuario.Id);
            bool esWebmaster = permisos.Any(p => 
                p.Nombre == "WEBMASTER" || p.Nombre == "VER_BITACORA");
            
            if (!esWebmaster)
            {
                // Usuario normal - BLOQUEAR ACCESO
                return Content(HttpStatusCode.Locked, new {
                    Message = "INTEGRIDAD_COMPROMETIDA",
                    StatusCode = 423, // Locked
                    Data = new {
                        TotalInconsistencias = inconsistencias.Count,
                        TablasAfectadas = inconsistencias
                            .Select(i => i.NombreTabla)
                            .Distinct()
                            .ToArray(),
                        RequiereWebmaster = true
                    }
                });
            }
        }
        
        // ============================================
        // CONTINUAR CON LOGIN NORMAL
        // ============================================
        var loginResult = _usuarioBLL.Login(request.Email, request.Password);
        
        if (loginResult.Success)
        {
            var token = GenerateJwtToken(loginResult.Usuario);
            
            return Ok(new {
                Token = token,
                Usuario = new {
                    Id = loginResult.Usuario.Id,
                    NombreUsuario = loginResult.Usuario.NombreUsuario,
                    Email = loginResult.Usuario.Email
                },
                // Advertir al Webmaster si hay inconsistencias
                IntegridadComprometida = inconsistencias.Any(),
                Inconsistencias = inconsistencias.Count
            });
        }
        
        return BadRequest(new { 
            Message = loginResult.ErrorMessage,
            StatusCode = 401
        });
    }
    catch (Exception ex)
    {
        return InternalServerError(ex);
    }
}
```

**✅ Verificación:**
- Compila sin errores
- Verifica integridad antes de cada login
- Bloquea usuarios normales si hay inconsistencias
- Permite login a Webmaster

---


### PASO 6.2: Crear IntegridadController

**Archivo:** `Backend/Controllers/IntegridadController.cs`

```csharp
using Backend.Infrastructure;
using BLL;
using System;
using System.Linq;
using System.Web.Http;

namespace Backend.Controllers
{
    /// <summary>
    /// Controller para gestión de integridad de datos
    /// Solo accesible por Webmaster
    /// </summary>
    [RoutePrefix("api/integridad")]
    public class IntegridadController : ApiController
    {
        private readonly IntegridadBLL _integridadBLL = IntegridadBLL.Instance;
        
        /// <summary>
        /// Verifica la integridad de todas las tablas críticas
        /// GET: api/integridad/verificar
        /// </summary>
        [HttpGet]
        [Route("verificar")]
        [CustomAuthorize(Permissions = "WEBMASTER,VER_BITACORA")]
        public IHttpActionResult VerificarIntegridad()
        {
            try
            {
                var inconsistencias = _integridadBLL.VerificarIntegridad();
                
                return Ok(new {
                    IntegridadOK = !inconsistencias.Any(),
                    TotalInconsistencias = inconsistencias.Count,
                    TablasAfectadas = inconsistencias
                        .Select(i => i.NombreTabla)
                        .Distinct()
                        .ToArray(),
                    Inconsistencias = inconsistencias.Select(i => new {
                        i.NombreTabla,
                        i.RegistroId,
                        i.TipoInconsistencia,
                        i.DescripcionError,
                        i.FechaDeteccion
                    }).ToArray()
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
        
        /// <summary>
        /// Repara la integridad recalculando todos los DVH y DVV
        /// POST: api/integridad/reparar
        /// </summary>
        [HttpPost]
        [Route("reparar")]
        [CustomAuthorize(Permissions = "WEBMASTER")]
        public IHttpActionResult RepararIntegridad()
        {
            try
            {
                // Verificar inconsistencias antes de reparar
                var inconsistenciasAntes = _integridadBLL.VerificarIntegridad();
                
                if (!inconsistenciasAntes.Any())
                {
                    return Ok(new {
                        Message = "No hay inconsistencias que reparar",
                        IntegridadOK = true
                    });
                }
                
                // Recalcular todos los dígitos verificadores
                _integridadBLL.RecalcularTodosLosDV();
                
                // Verificar que se haya reparado
                var inconsistenciasDespues = _integridadBLL.VerificarIntegridad();
                
                return Ok(new {
                    Message = "Integridad reparada exitosamente",
                    InconsistenciasReparadas = inconsistenciasAntes.Count,
                    TablasReparadas = inconsistenciasAntes
                        .Select(i => i.NombreTabla)
                        .Distinct()
                        .ToArray(),
                    IntegridadOK = !inconsistenciasDespues.Any(),
                    DetalleReparacion = inconsistenciasAntes
                        .GroupBy(i => i.NombreTabla)
                        .Select(g => new {
                            Tabla = g.Key,
                            InconsistenciasReparadas = g.Count(),
                            Tipos = g.Select(i => i.TipoInconsistencia)
                                    .Distinct()
                                    .ToArray()
                        }).ToArray()
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
```

**✅ Verificación:**
- Compila sin errores
- Endpoints protegidos con CustomAuthorize
- Retorna información detallada

---

### PASO 6.3: Registrar ruta en WebApiConfig

**Archivo:** `Backend/App_Start/WebApiConfig.cs`

**Agregar antes de la ruta default:**

```csharp
// Rutas de Integridad
config.Routes.MapHttpRoute(
    name: "IntegridadApi",
    routeTemplate: "api/integridad/{action}",
    defaults: new { controller = "Integridad" }
);
```

**✅ Verificación:**
- Compila sin errores
- Rutas registradas correctamente

---

