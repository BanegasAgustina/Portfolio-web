# Portfolio de Agustina

Portfolio en React y TypeScript con una interfaz inspirada en Windows XP. La pantalla pública permite explorar proyectos, herramientas, habilidades, experiencia, educación y contacto. `/admin` abre el acceso a la administración del contenido.

Para estudiar el código, empezá por [DOCUMENTACION.md](DOCUMENTACION.md): incluye el mapa de archivos, las consultas, los endpoints y el recorrido de los datos. Los archivos propios tienen comentarios en español; `src/src-backups` está identificado como código histórico.

## Estructura del proyecto


PortfolioR4/
├── src/
│   ├── main.tsx                 Monta React en index.html.
│   ├── App.tsx                  Rutas y proveedor compartido del tema.
│   ├── index.css                Base global y variables de color.
│   ├── App.css                  Ventanas XP y estilos compartidos.
│   ├── Desktop.css              Distribución del escritorio público.
│   ├── types.ts                 Tipos de registros, portfolio y ventanas.
│   ├── pages/                   Desktop, Admin y estilos específicos del admin.
│   ├── components/              Ventanas y contenido público reutilizable.
│   │   └── admin/               Editor, campos, confirmación e iconos del panel.
│   ├── context/                Tema claro/oscuro compartido.
│   ├── hooks/                   Reloj y manejo de ventanas.
│   ├── services/                Adaptador de datos y cliente público Supabase.
│   ├── assets/                  Imágenes, iconos y documentos importables.
│   └── src-backups/             Copias históricas excluidas del build y lint.
├── backend/
│   ├── app.js                   Servidor Express y tratamiento de errores.
│   ├── config/                  Entorno y cliente privado Supabase.
│   ├── middleware/              Sesiones del admin y validación del contacto.
│   └── routes/                  Endpoints públicos y privados.
├── api/index.js                 Entrada de Express para Vercel.
├── scripts/                     Generador de seed y prueba de integración antigua.
├── public/                      CV, SVG y recursos servidos por URL.
├── tmp/pdfs/                    Imágenes auxiliares de documentos; no ejecutan lógica.
├── index.html                   Documento inicial y metadatos públicos.
├── vite.config.ts               Configuración de React en Vite.
├── eslint.config.js             Reglas de revisión estática.
├── tsconfig*.json               Configuración TypeScript.
├── vercel.json                  Reescrituras para API y /admin.
└── .env.example                 Nombres de variables públicas, sin credenciales.
```

`node_modules` contiene dependencias instaladas y `dist` el resultado generado del build. No se editan para modificar el proyecto. No hay una carpeta `supabase` ni archivos SQL versionados en este checkout, aunque algunos scripts los mencionan.

## Ejecución y verificaciones

Desde `PortfolioR4`, con las dependencias instaladas:

```sh
npm run dev
npm run build
npm run lint
```

En PowerShell se puede usar `npm.cmd` si `npm` resuelve a otro ejecutable del sistema.

- `dev` abre Vite para desarrollar la interfaz. Su configuración actual **no tiene proxy** al backend.
- `build` comprueba TypeScript y genera `dist`.
- `lint` revisa el frontend activo, backend y configuración indicada en el script.
- `start` inicia Express, que sirve `dist` y `/api` desde el mismo origen; requiere un build previo y configuración de backend.
- `server` y `backend` inician Express en modo observación; `preview` sirve sólo el build mediante Vite.

Las plantillas `.env.example` y `backend/.env.example` explican las variables. El frontend necesita URL y clave **pública** de Supabase. El backend utiliza su propia clave privada para login, sesiones, administración y contacto. Los archivos `.env` reales no se incluyen en la documentación ni se modificaron.

## Cómo se conectan las partes

El contenido público se lee directamente de Supabase con el cliente público. El administrador envía solicitudes a Express; el servidor verifica una cookie `admin_session` y consulta Supabase con su cliente privado. Son dos caminos diferentes dentro de `src/services/api.ts`.

El login actual usa la tabla `admins` y sesiones guardadas en `admin_sessions`. No usa el login de Supabase Auth que aparece en el script de verificación histórico.

## Estado de los scripts auxiliares

- `npm test` y el test del backend apuntan a `tests/*.test.mjs`; esa carpeta no está presente en el checkout revisado.
- `test:supabase` intenta escribir datos y subir imágenes reales, y presupone Supabase Auth/RPC adicionales. No es una prueba de sólo lectura ni representa el login actual.
- `db:seed` necesita `supabase/data.json`, ausente aquí. Genera SQL, pero no lo ejecuta. Debe revisarse el contenido de entrada porque el script también admite perfil y mensajes.
- `format` reescribe archivos con Prettier; no es una comprobación de sólo lectura.

La documentación describe estas condiciones sin cambiar rutas, lógica, consultas ni diseño.
