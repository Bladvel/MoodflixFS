using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class BitacoraService
    {
        private BitacoraService() { }

        private static readonly object padlock = new object();
        private static BitacoraService instance = null;
        public static BitacoraService Instance
        {
            get
            {
                lock (padlock)
                {
                    if (instance == null)
                    {
                        instance = new BitacoraService();
                    }
                    return instance;
                }
            }
        }
    }
}
