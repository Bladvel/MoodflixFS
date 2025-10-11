using BE;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BitacoraBLL
    {

        private BitacoraBLL() { }

        private static readonly object padlock = new object();
        private static BitacoraBLL instance = null;

        private readonly BitacoraDAL _bitacoraDAL = new BitacoraDAL();
        public static BitacoraBLL Instance
        {
            get
            {
                lock (padlock)
                {
                    if (instance == null)
                    {
                        instance = new BitacoraBLL();
                    }
                    return instance;
                }
            }
        }

        public void Registrar(Bitacora evento)
        {
            try
            {
                _bitacoraDAL.Create(evento);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error CRÍTICO al escribir en la bitácora: {ex.Message}");
            }
        }

        public List<Bitacora> Listar(int? usuarioId = null, int? criticidad = null, DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            if (fechaDesde.HasValue && fechaHasta.HasValue)
            {
                if (fechaDesde.Value > fechaHasta.Value)
                {
                    throw new Exception("La fecha 'desde' no puede ser posterior a la fecha 'hasta'.");
                }
            }

            if (fechaDesde.HasValue && fechaDesde.Value > DateTime.Now)
            {
                throw new Exception("La fecha 'desde' no puede ser una fecha futura.");
            }

            if (usuarioId.HasValue && usuarioId.Value <= 0)
            {
                throw new Exception("El ID de usuario para el filtro no es válido.");
            }

            if (criticidad.HasValue && (criticidad.Value < 1 || criticidad.Value > 5))
            {
                throw new Exception("El nivel de criticidad debe estar entre 1 y 5.");
            }

            return _bitacoraDAL.ListarConFiltros(usuarioId, criticidad, fechaDesde, fechaHasta);
        }


    }
}
