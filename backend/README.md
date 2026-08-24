# VitaGloss RD — Backend API 🔧

API REST para el sistema de gestión de ventas de VitaGloss RD. Autenticación JWT, gestión de leads, registro de ventas y estadísticas del dashboard.

## Stack

- **Node.js** + **Express 4**
- **MongoDB Atlas** + **Mongoose 8**
- **JWT** + **bcryptjs** — autenticación segura
- **express-rate-limit** — protección contra abuso

## Instalación

```bash
npm install
cp .env.example .env   # Completa las variables
npm run seed:admin     # Crea o actualiza el admin con variables privadas
npm run dev            # Servidor en http://localhost:4000
```

## Variables de entorno (`.env`)

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vitagloss
JWT_SECRET=clave_secreta_muy_larga
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5174
ADMIN_NAME=Administrador VitaGloss RD
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=una_clave_unica_de_14_o_mas_caracteres
ADMIN_WHATSAPP=18492763532
```

Para recuperación de contraseñas, los planes Free, Trial y Hobby de Railway
bloquean SMTP. En esos planes configura el envío HTTPS de Resend:

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM="VitaGloss RD <noreply@vitaglossrd.com>"
```

El dominio usado en `RESEND_FROM` debe estar verificado en Resend. Si existe
`RESEND_API_KEY`, el sistema usa su API HTTPS; de lo contrario intenta las
variables `SMTP_*` con tiempos de espera limitados.

Para producción, agrega temporalmente las cuatro variables `ADMIN_*` al
servicio de Railway y ejecuta `npm run seed:admin`. El proceso nunca imprime la
contraseña y MongoDB almacena únicamente su hash con bcrypt. Al finalizar,
elimina `ADMIN_PASSWORD` de Railway y vuelve a desplegar el servicio.

El registro público no puede crear al primer administrador. Los vendedores se
crean desde una sesión de administrador autenticada.

## Endpoints principales

| Método | Ruta                  | Descripción                        |
|--------|-----------------------|------------------------------------|
| POST   | /api/auth/login       | Iniciar sesión                     |
| POST   | /api/auth/register    | Registrar usuario (requiere admin) |
| GET    | /api/auth/me          | Usuario actual                     |
| GET    | /api/members          | Miembros públicos del equipo       |
| GET    | /api/leads            | Leads del vendedor (protegido)     |
| POST   | /api/leads            | Crear lead                         |
| GET    | /api/sales            | Ventas del vendedor (protegido)    |
| POST   | /api/sales            | Registrar venta                    |
| GET    | /api/dashboard        | Estadísticas y KPIs                |

## Estructura

```
vitagloss-rd-api/
├── models/       # User, Lead, Sale (Mongoose)
├── routes/       # auth, members, leads, sales, dashboard
├── middleware/   # auth.js (JWT verify)
├── scripts/      # seed.js (admin inicial)
└── server.js     # Entry point
```
