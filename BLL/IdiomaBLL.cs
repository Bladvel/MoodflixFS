using BE;
using BE.DTOs;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class IdiomaBLL
    {
        private static readonly object padlock = new object();
        private static IdiomaBLL instance = null;

        private readonly IdiomaDAL _idiomaDAL = new IdiomaDAL();
        private readonly TraduccionDAL _traduccionDAL = new TraduccionDAL();

        // Cache en memoria para performance
        private static Dictionary<int, Dictionary<string, object>> _cacheTraduccionesPorId = new Dictionary<int, Dictionary<string, object>>();
        private static Dictionary<string, Dictionary<string, object>> _cacheTraduccionesPorCodigo = new Dictionary<string, Dictionary<string, object>>();
        private static DateTime _ultimaActualizacionCache = DateTime.MinValue;
        private static readonly TimeSpan _tiempoExpiracionCache = TimeSpan.FromMinutes(30);

        public static IdiomaBLL Instance
        {
            get
            {
                lock (padlock)
                {
                    if (instance == null)
                        instance = new IdiomaBLL();
                    return instance;
                }
            }
        }

        private IdiomaBLL() { }

        public List<IdiomaDTO> ObtenerIdiomasActivos()
        {
            var idiomas = _idiomaDAL.GetAll();
            return idiomas.Select(i => new IdiomaDTO
            {
                Id = i.Id,
                Codigo = i.Codigo,
                Nombre = i.NombreIdioma,
                Bandera = i.Bandera,
                Preestablecido = i.Preestablecido
            }).ToList();
        }

        public Idioma ObtenerIdiomaPorCodigo(string codigo)
        {
            return _idiomaDAL.GetByCodigo(codigo);
        }

        public Idioma ObtenerIdiomaPreestablecido()
        {
            return _idiomaDAL.GetPreestablecido();
        }

        public TraduccionesDTO ObtenerTraduccionesPorIdiomaId(int idiomaId)
        {
            // Verificar cache
            if (_cacheTraduccionesPorId.ContainsKey(idiomaId) &&
                DateTime.Now - _ultimaActualizacionCache < _tiempoExpiracionCache)
            {
                var idioma = _idiomaDAL.GetById(idiomaId);
                return new TraduccionesDTO
                {
                    IdiomaId = idiomaId,
                    CodigoIdioma = idioma?.Codigo,
                    Traducciones = _cacheTraduccionesPorId[idiomaId]
                };
            }

            // Obtener de base de datos
            var traduccionesPlanas = _traduccionDAL.GetTraduccionesPorIdiomaId(idiomaId);
            var traduccionesAnidadas = ConstruirDiccionarioAnidado(traduccionesPlanas);

            // Actualizar cache
            lock (padlock)
            {
                _cacheTraduccionesPorId[idiomaId] = traduccionesAnidadas;
                _ultimaActualizacionCache = DateTime.Now;
            }

            var idiomaInfo = _idiomaDAL.GetById(idiomaId);
            return new TraduccionesDTO
            {
                IdiomaId = idiomaId,
                CodigoIdioma = idiomaInfo?.Codigo,
                Traducciones = traduccionesAnidadas
            };
        }

        public TraduccionesDTO ObtenerTraduccionesPorCodigo(string codigoIdioma)
        {
            // Verificar cache
            if (_cacheTraduccionesPorCodigo.ContainsKey(codigoIdioma) &&
                DateTime.Now - _ultimaActualizacionCache < _tiempoExpiracionCache)
            {
                var idioma = _idiomaDAL.GetByCodigo(codigoIdioma);
                return new TraduccionesDTO
                {
                    IdiomaId = idioma?.Id ?? 0,
                    CodigoIdioma = codigoIdioma,
                    Traducciones = _cacheTraduccionesPorCodigo[codigoIdioma]
                };
            }

            // Obtener de base de datos
            var traduccionesPlanas = _traduccionDAL.GetTraduccionesPorCodigoIdioma(codigoIdioma);
            var traduccionesAnidadas = ConstruirDiccionarioAnidado(traduccionesPlanas);

            // Actualizar cache
            lock (padlock)
            {
                _cacheTraduccionesPorCodigo[codigoIdioma] = traduccionesAnidadas;
                _ultimaActualizacionCache = DateTime.Now;
            }

            var idiomaInfo = _idiomaDAL.GetByCodigo(codigoIdioma);
            return new TraduccionesDTO
            {
                IdiomaId = idiomaInfo?.Id ?? 0,
                CodigoIdioma = codigoIdioma,
                Traducciones = traduccionesAnidadas
            };
        }

        private Dictionary<string, object> ConstruirDiccionarioAnidado(Dictionary<string, string> traduccionesPlanas)
        {
            var resultado = new Dictionary<string, object>();

            foreach (var kvp in traduccionesPlanas)
            {
                var partes = kvp.Key.Split('.');
                var actual = resultado;

                // Navegar/crear estructura anidada
                for (int i = 0; i < partes.Length - 1; i++)
                {
                    if (!actual.ContainsKey(partes[i]))
                    {
                        actual[partes[i]] = new Dictionary<string, object>();
                    }
                    actual = (Dictionary<string, object>)actual[partes[i]];
                }

                // Asignar valor final
                actual[partes[partes.Length - 1]] = kvp.Value;
            }

            return resultado;
        }

        public void LimpiarCache()
        {
            lock (padlock)
            {
                _cacheTraduccionesPorId.Clear();
                _cacheTraduccionesPorCodigo.Clear();
                _ultimaActualizacionCache = DateTime.MinValue;
            }
        }
    }
}
