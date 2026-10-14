# Mugxie ☕

Tienda virtual colombiana de Mugs coleccionables. Es un proyecto personal desarrollado como aplicación full-stack: catálogo público, carrito, pedidos por WhatsApp y panel privado de administración.

## Enlaces

- Tienda: [mugxie.com](https://mugxie.com)
- Panel administrador: [mugxie.com/admin](https://mugxie.com/admin)

> El acceso al administrador está protegido con contraseña. No hay enlaces al panel desde la tienda pública.

## Funcionalidades

- Catálogo paginado, búsqueda, categorías, favoritos y ordenamiento por precio o nombre.
- Productos con galería de fotos, video, variantes de color/diseño y disponibilidad.
- Carrito de compras con descuentos automáticos: 5% para 4–7 Mugs y 10% desde 8 Mugs.
- Pedido generado para WhatsApp con detalle de referencias, cantidades y total.
- Panel administrador para gestionar Mugs, categorías, testimonios, imágenes, videos y configuración de la tienda.
- Testimonios, preguntas frecuentes y una interfaz responsiva pensada principalmente para celular.

## Tecnologías

- **Frontend:** React, Vite, Tailwind CSS y Lucide.
- **Backend:** Cloudflare Workers.
- **Base de datos:** Cloudflare D1.
- **Archivos multimedia:** Cloudinary.
- **Despliegue y dominio:** Cloudflare Workers + `mugxie.com`.

## Arquitectura

```text
Cliente React ──► Cloudflare Worker ──► Cloudflare D1
       │                    │
       └──── Cloudinary ◄───┘
```

El Worker sirve la aplicación, protege las rutas administrativas y expone la API. D1 almacena productos, categorías, testimonios y ajustes. Cloudinary almacena imágenes y videos.

## Desarrollo local

Requisitos: Node.js y `npm`.

```bash
npm install
npm run cf:local:setup
npm run cf:dev
```

Abre `http://localhost:3001`. Para el frontend sin Worker se puede usar `npm run dev`.

## Variables y secretos

Nunca subas `.env`, `.dev.vars`, `.cloudinary.env` ni `.admin-credentials.txt`. Ya están incluidos en `.gitignore`.

Ejemplo para desarrollo local:

```env
ADMIN_PASSWORD=usa-una-clave-larga-y-unica
APP_ORIGIN=http://localhost:5173
PORT=3001
```

Las credenciales de Cloudinary y la contraseña de administrador de producción se guardan como secretos de Cloudflare, no en GitHub.

## Publicación

```bash
npm run cf:deploy
```

El despliegue publica el Worker y mantiene asociados los dominios `mugxie.com` y `www.mugxie.com`.

## Validación

```bash
npm run build
npm test
npm run lint
```

## Próximas mejoras

- Integración de pagos en línea.
- Métricas de ventas y productos más consultados.
- Confirmaciones de pedido y seguimiento de envíos.

---

Desarrollado por **Carol Velasco** como proyecto personal de Ingeniería de Sistemas.
