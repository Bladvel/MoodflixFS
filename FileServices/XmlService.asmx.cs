using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Xml.Serialization;
using BLL;
using BE;

namespace Backend
{
    /// <summary>
    /// Servicio web para exportar e importar el catálogo de productos en formato XML
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    public class XmlService : System.Web.Services.WebService
    {
        private readonly ProductoBLL _productoBLL = new ProductoBLL();

        /// <summary>
        /// Exporta todo el catálogo de productos a una cadena de texto en formato XML.
        /// </summary>
        /// <returns>Un string que contiene el XML del catálogo de productos.</returns>
        [WebMethod(Description = "Exporta todos los productos del catálogo en formato XML")]
        public string ExportarProductosComoXml()
        {
            try
            {
                // 1. Obtener la lista completa de productos desde la BLL
                List<Producto> productos = _productoBLL.GetAll();

                if (productos == null || productos.Count == 0)
                {
                    return "<?xml version=\"1.0\" encoding=\"utf-8\"?><ArrayOfProducto />";
                }

                // 2. Usar XmlSerializer para convertir la lista de objetos a XML
                // Necesita saber los tipos concretos que puede encontrar (Libro y Pelicula)
                XmlSerializer serializer = new XmlSerializer(
                    typeof(List<Producto>),
                    new Type[] { typeof(Libro), typeof(Pelicula) }
                );

                using (StringWriter stringWriter = new StringWriter())
                {
                    serializer.Serialize(stringWriter, productos);
                    string xmlResult = stringWriter.ToString();

                    // Registrar en bitácora (opcional)
                    // BitacoraBLL.Registrar("Exportación XML", $"Se exportaron {productos.Count} productos");

                    return xmlResult;
                }
            }
            catch (Exception ex)
            {
                // Registrar el error
                string errorMsg = $"Error al exportar productos: {ex.Message}";

                // En un servicio ASMX, las excepciones se devuelven como SOAP Faults
                throw new Exception(errorMsg, ex);
            }
        }

        /// <summary>
        /// Importa un catálogo de productos desde una cadena de texto XML,
        /// reemplazando los productos existentes.
        /// </summary>
        /// <param name="xmlData">El string que contiene los datos en formato XML.</param>
        /// <returns>Un mensaje de éxito o error.</returns>
        [WebMethod(Description = "Importa productos desde XML, reemplazando el catálogo existente")]
        public string ImportarProductosDesdeXml(string xmlData)
        {
            try
            {
                // Validación de entrada
                if (string.IsNullOrWhiteSpace(xmlData))
                {
                    return "Error: El XML no puede estar vacío.";
                }

                // 1. Preparar el deserializador
                XmlSerializer serializer = new XmlSerializer(
                    typeof(List<Producto>),
                    new Type[] { typeof(Libro), typeof(Pelicula) }
                );

                using (StringReader stringReader = new StringReader(xmlData))
                {
                    // 2. Convertir el XML de vuelta a una lista de objetos
                    var productosImportados = (List<Producto>)serializer.Deserialize(stringReader);

                    // Validar que se hayan importado productos
                    if (productosImportados == null || productosImportados.Count == 0)
                    {
                        return "Error: No se encontraron productos válidos en el XML.";
                    }

                    // 3. Llamar al método en la BLL para reemplazar el catálogo
                    _productoBLL.ReemplazarCatalogo(productosImportados);

                    // Registrar en bitácora (opcional)
                    // BitacoraBLL.Registrar("Importación XML", $"Se importaron {productosImportados.Count} productos");

                    return $"Importación exitosa. Se procesaron {productosImportados.Count} productos.";
                }
            }
            catch (InvalidOperationException ex)
            {
                // Error de formato XML
                return $"Error: El formato del XML no es válido. Detalle: {ex.Message}";
            }
            catch (Exception ex)
            {
                // Otros errores
                return $"Error durante la importación: {ex.Message}";
            }
        }

        /// <summary>
        /// Método de prueba para verificar que el servicio está funcionando
        /// </summary>
        /// <returns>Mensaje de confirmación</returns>
        [WebMethod(Description = "Verifica que el servicio XML está funcionando correctamente")]
        public string Ping()
        {
            return "Servicio XML funcionando correctamente. Fecha: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        }
    }
}
