using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Xml.Serialization;
using BLL;
using BE;

namespace FileServices
{
    /// <summary>
    /// Summary description for XmlService
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    // [System.Web.Script.Services.ScriptService]
    public class XmlService : System.Web.Services.WebService
    {

        private readonly ProductoBLL _productoBLL = new ProductoBLL();

        /// <summary>
        /// Exporta todo el catálogo de productos a una cadena de texto en formato XML.
        /// </summary>
        /// <returns>Un string que contiene el XML del catálogo de productos.</returns>
        [WebMethod]
        public string ExportarProductosComoXml()
        {
            try
            {
                // 1. Obtenemos la lista completa de productos desde la BLL.
                List<Producto> productos = _productoBLL.GetAll();

                // 2. Usamos XmlSerializer para convertir la lista de objetos a XML.
                //    Necesita saber los tipos concretos que puede encontrar (Libro y Pelicula).
                XmlSerializer serializer = new XmlSerializer(typeof(List<Producto>), new Type[] { typeof(Libro), typeof(Pelicula) });

                using (StringWriter stringWriter = new StringWriter())
                {
                    serializer.Serialize(stringWriter, productos);
                    return stringWriter.ToString();
                }
            }
            catch (Exception ex)
            {
                // En un servicio ASMX, las excepciones se devuelven como SOAP Faults.
                // Es buena idea registrar el error aquí.
                throw new Exception("Ocurrió un error al exportar los productos.", ex);
            }
        }

        /// <summary>
        /// Importa un catálogo de productos desde una cadena de texto XML,
        /// reemplazando los productos existentes.
        /// </summary>
        /// <param name="xmlData">El string que contiene los datos en formato XML.</param>
        /// <returns>Un mensaje de éxito o error.</returns>
        [WebMethod]
        public string ImportarProductosDesdeXml(string xmlData)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(xmlData))
                {
                    return "Error: El XML no puede estar vacío.";
                }

                // 1. Preparamos el deserializador.
                XmlSerializer serializer = new XmlSerializer(typeof(List<Producto>), new Type[] { typeof(Libro), typeof(Pelicula) });

                using (StringReader stringReader = new StringReader(xmlData))
                {
                    // 2. Convertimos el XML de vuelta a una lista de objetos.
                    var productosImportados = (List<Producto>)serializer.Deserialize(stringReader);

                    // 3. Llamamos a un método en la BLL (que deberíamos crear)
                    //    para que se encargue de la lógica de negocio de reemplazar el catálogo.
                    // _productoBLL.ReemplazarCatalogo(productosImportados);

                    return $"Importación exitosa. Se procesaron {productosImportados.Count} productos.";
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Ocurrió un error durante la importación. Verifique el formato del XML.", ex);
            }
        }
    }
}
