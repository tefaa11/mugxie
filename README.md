# Mugxie

Tienda React/Vite preparada para Cloudflare Workers, D1 y Cloudinary Free. El dominio puede permanecer registrado en Hostinger. El despliegue remoto todavía requiere una cuenta de Cloudflare y conectar la cuenta Cloudinary para las fotos y videos.

## Qué guarda cada servicio

- **Workers:** página pública, administrador `/admin` y API con autenticación.
- **D1:** catálogo, categorías, testimonios, configuración, sesiones y límites de intentos de acceso.
- **Cloudinary:** fotos y videos, servidos directamente por sus enlaces HTTPS. Las subidas se firman en el Worker; el API secret nunca se envía al navegador. No requiere activar R2.
- **Navegador:** únicamente carrito y favoritos.

La base inicial contiene los productos de ejemplo existentes. No se han cargado automáticamente las 280 referencias reales. Las migraciones usan `INSERT OR IGNORE` y no reemplazan datos guardados.

## Desarrollo local con Cloudflare

Requiere Node.js 24 y `npm install`. Ejecuta, en orden:

```sh
npm run cf:local:setup
npm run cf:dev
```

Abre `http://localhost:3001` o `http://localhost:3001/admin`. La contraseña local se guarda en `.dev.vars`; ese archivo está excluido de Git y no forma parte del sitio. D1 local vive en `.wrangler/state` y no se sincroniza con producción. Para subir archivos en desarrollo configura las tres variables CLOUDINARY_* en `.dev.vars`.

También se conserva el servidor SQLite anterior para desarrollo: `npm run server` y `npm run dev`. El despliegue recomendado es Cloudflare.

## Publicar en Cloudflare

1. Crea una cuenta en https://dash.cloudflare.com/sign-up y verifica el correo.
2. En Cloudinary Free, abre **Settings > API Keys**, copia la **API environment variable** en el archivo privado `.cloudinary.env` como `CLOUDINARY_URL=cloudinary://...` y ejecuta:

```sh
node scripts/configure-cloudinary.js
```

El comando guarda CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET como secretos en Cloudflare. No compartas ese archivo ni la variable por el chat. No se necesita R2 ni tarjeta. El plan gratuito tiene una cuota compartida de almacenamiento, transferencia y procesamiento.

3. Desde este proyecto, autoriza Wrangler en el navegador:

```sh
npx wrangler login
```

4. Crea o reutiliza D1 e inicializa las tablas. El script actualiza el identificador real de D1 en `wrangler.jsonc`:

```sh
npm run cf:setup
```

5. Configura la contraseña del administrador como secreto de Cloudflare, sin pegarla en archivos públicos ni en el chat:

```sh
npx wrangler secret put ADMIN_PASSWORD
```

Usa al menos 16 caracteres. Si Wrangler solicita crear el Worker antes de subir el secreto, acepta la creación del Worker `mugxie`. La contraseña local y la remota son independientes.

6. Compila y publica:

```sh
npm run cf:deploy
```

El despliegue se detiene si todavía está el identificador de D1 de ejemplo. La primera dirección será `mugxie.<tu-subdominio>.workers.dev`; comprueba el catálogo, inicia sesión en `/admin`, sube una foto y un video y verifica desde otro navegador los cambios.

## Conectar mugxie.com

Después de verificar la dirección de prueba:

1. Agrega `mugxie.com` a Cloudflare con el plan Free y revisa los registros DNS importados, conservando los que use el correo u otros servicios.
2. En Hostinger, cambia los nameservers a los dos valores exactos asignados por Cloudflare. El dominio sigue siendo de Hostinger y se renueva allí.
3. Cuando la zona esté activa, ve al Worker `mugxie` > **Settings > Domains & Routes > Add > Custom Domain** y agrega `mugxie.com` y, si lo deseas, `www.mugxie.com`.
4. Acceso privado: `https://mugxie.com/admin`. No hay botones de administrador en la tienda pública.

No se incluye una ruta de dominio en `wrangler.jsonc` para evitar cambiar DNS o sustituir una web existente antes de verificar el despliegue.

## Imágenes, videos y funcionamiento

Las fotos JPG/PNG/WebP se convierten en WebP con un lado máximo de 1400 px antes de subir; los GIF se conservan. El máximo de imagen subida es 5 MB. Los videos MP4/WebM/MOV deben ser clips cortos de máximo 25 MB; no se convierten ni comprimen automáticamente. El servidor verifica el tipo y la firma del archivo.

Las imágenes del catálogo y testimonios cargan cuando se acercan a la pantalla. Los videos solo están montados cuando se selecciona Video en el detalle; Cloudinary entrega los archivos para reproducirlos directamente. Los enlaces TikTok están bloqueados también en la API.

Las sesiones duran ocho horas, usan cookies HttpOnly y Secure en HTTPS y están guardadas en D1. Hay límites de intentos de acceso, validación de origen y revisiones para evitar sobrescribir cambios de otro administrador. Cerrar el panel cierra la sesión. Los testimonios no almacenan nombres ni identificaciones del cliente.

Los archivos subidos y posteriormente quitados de un producto no se eliminan automáticamente: se conservan para evitar romper referencias. Revisa periódicamente Cloudinary y elimina únicamente archivos que ya no use el catálogo. Cloudinary requiere controlar almacenamiento, transferencia y transformaciones para permanecer dentro de sus créditos gratuitos.

## Datos de versiones anteriores

Los productos guardados en el navegador o la base SQLite anterior no se migran automáticamente a D1. Antes de cambiar de versión, exporta el catálogo con el administrador anterior. Importa el JSON desde el nuevo panel; si tiene fotos en base64 o videos `idb://`, vuelve a subir esos archivos para obtener URLs compartidas. Los testimonios y categorías locales también deben trasladarse. No se generan testimonios ficticios.

## Pruebas

```sh
npm test
npm run build
npm run lint
```

`npm test` compila el Worker sin publicarlo y prueba D1 y la compatibilidad con R2 local en el runtime local de Cloudflare (Miniflare/workerd): autenticación, permisos, origen, cierre de sesión, límites de intentos, datos públicos, conflictos de edición, validación, carga y lectura parcial de archivos. Se mantienen las pruebas de SQLite. `npm run cf:check` comprueba el paquete de despliegue sin publicar.

## Referencias oficiales

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://cloudinary.com/documentation/billing_and_plans
- https://cloudinary.com/documentation/upload_images
