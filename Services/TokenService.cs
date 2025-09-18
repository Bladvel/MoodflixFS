using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Security.Claims;
using BE;
using System.IdentityModel.Tokens.Jwt;

namespace Services
{

    public static class TokenService
    {
        public static string GenerateToken(Usuario usuario)
        {

            var secretKey = Convert.FromBase64String(ConfigurationManager.AppSettings["JwtSecret"]);
            var securityKey = new SymmetricSecurityKey(secretKey);

            var tokenHandler = new JwtSecurityTokenHandler();

            var permisosEfectivos = new HashSet<string>();
            if (usuario.Permisos != null)
            {
                ExtraerPatentesRecursivamente(usuario.Permisos, permisosEfectivos);
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.NombreUsuario),
                new Claim(ClaimTypes.Email, usuario.Email),
            };

            foreach (var patente in permisosEfectivos)
            {
                claims.Add(new Claim(ClaimTypes.Role, patente));
            }


            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


        private static void ExtraerPatentesRecursivamente(IEnumerable<Permiso> permisos, HashSet<string> patentes)
        {
            if (permisos == null) return;

            foreach (var p in permisos)
            {
                if (p is Familia f)
                {
                    ExtraerPatentesRecursivamente(f.Hijos, patentes);
                }
                else
                {
                    patentes.Add(p.Nombre);
                }
            }
        }
    }
}