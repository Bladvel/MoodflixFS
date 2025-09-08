using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace Services
{
    public static class CryptoManager
    {
        public static string HashPassword(string text)
        {
            if (string.IsNullOrEmpty(text))
                return string.Empty;

            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(text));
                StringBuilder stringBuilder = new StringBuilder();
                for (int i = 0; i< hashBytes.Length; i++)
                {
                    stringBuilder.Append(hashBytes[i].ToString("x2"));
                }
                return stringBuilder.ToString().ToUpperInvariant();
            }

        }

        public static bool VerificarPassword(string passwordPlana, string passwordHash)
        {
            string hashedInput = HashPassword(passwordPlana);
            return hashedInput.Equals(passwordHash, StringComparison.OrdinalIgnoreCase);
        }
    }
}
