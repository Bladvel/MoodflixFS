using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL;

namespace BLL
{
    public class BackupBLL
    {
        private readonly BackupDAL _backupDAL = new BackupDAL();

        public void GenerarBackup(string ruta)
        {
            if (string.IsNullOrWhiteSpace(ruta))
                throw new Exception("La ruta de destino para el backup no puede estar vacía.");

            _backupDAL.GenerarBackup(ruta);
        }

        public void RestaurarBackup(string ruta)
        {
            if (string.IsNullOrWhiteSpace(ruta))
                throw new Exception("La ruta de origen para el restore no puede estar vacía.");

            _backupDAL.RestaurarBackup(ruta);
        }
    }
}
