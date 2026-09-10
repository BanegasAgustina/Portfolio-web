# Portfolio de Agustina Banegas

SPA en React + TypeScript con escritorio Windows XP. El contenido y la administración están adaptados para Supabase PostgreSQL, Auth y Storage. Logros fue retirado del escritorio, del menú Inicio y del administrador por indicación de la autora.

**Estado actual:** código migrado y pruebas locales de PostgreSQL aprobadas. Falta crear el proyecto Supabase, ejecutar el SQL y configurar las claves públicas. Por eso todavía no se declara una conexión en la nube, un CRUD remoto probado ni un deploy publicado. La aplicación muestra un error de configuración y permite reintentar mientras faltan esas variables.

## Supabase

Todos los comandos npm se ejecutan en `PortfolioR4/`, con Node.js 24.

1. Crear un proyecto en el [Dashboard de Supabase](https://supabase.com/dashboard), guardar su contraseña de base y esperar a que esté listo.
2. Abrir SQL Editor y ejecutar `PortfolioR4/supabase/schema.sql`. Crea tablas, funciones, políticas RLS y el bucket `portfolio-images`.
3. Elegir **una** carga de datos:
   - Para conservar los datos de esta instalación, ejecutar `PortfolioR4/supabase/migration-data.sql`. Es un archivo privado local, ignorado por Git, que conserva también el teléfono y los mensajes. Ejecutarlo sólo en el proyecto propio.
   - Para una instalación desde el repositorio, ejecutar `PortfolioR4/supabase/seed.sql`. Contiene el perfil público, un proyecto, 32 herramientas/capacidades, experiencia, educación, redes y habilidades personales. Excluye teléfono privado y mensajes.
4. Obtener la Project URL y la clave pública publishable o anon desde la configuración de API del proyecto. Completar `PortfolioR4/.env`:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

5. Instalar y ejecutar:

```powershell
cd PortfolioR4
npm ci
npm run dev
```

El `.env.example` incluye las variables vacías. El `.env` local ya está preparado con esos nombres; no hay credenciales ficticias. Reiniciar Vite después de completarlo. La URL debe usar HTTPS. La clave secreta o service_role nunca debe tener prefijo `VITE_` ni incorporarse al frontend. Las variables `VITE_` son públicas en el build.

### Crear el administrador

1. En Authentication → Users, crear el usuario con email y contraseña y confirmar su email. La contraseña la administra Supabase Auth.
2. Copiar su UUID. En SQL Editor ejecutar el siguiente SQL reemplazando el texto entre comillas por ese UUID real:

```sql
insert into private.admin_users(user_id)
values ('UUID-DEL-USUARIO')
on conflict do nothing;
```

3. Abrir `/admin` e iniciar sesión con email y contraseña. No existe registro público en la interfaz. Se recomienda desactivar nuevos registros en la configuración de Auth si sólo se usará esta cuenta.

Tener una sesión de Supabase **no** alcanza para editar: el UUID también debe estar autorizado en `private.admin_users`. Esa tabla no está expuesta al frontend; los usuarios no pueden agregarse solos. La función `is_admin()` y las políticas de las tablas comprueban esa autorización en cada operación. [Documentación de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

El cliente usa `signInWithPassword()`, `getUser()`, `onAuthStateChange()` y `signOut()`. Se guardan los tokens de sesión mediante el cliente oficial, nunca la contraseña; no se mantiene la antigua tabla de contraseñas ni sesiones propias. [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signinwithpassword).

### Base de datos

El portfolio está implementado para obtener su información real de Supabase PostgreSQL alojado en la nube. React consulta proyectos, habilidades/herramientas, experiencia, educación y redes con `supabase-js`; el administrador permite gestionarlos utilizando Auth y RLS. La instancia remota todavía debe ser creada y configurada.

| Recurso | Diseño y acceso |
| --- | --- |
| `projects` | IDs bigint identity, textos, tecnologías `text[]`, URLs opcionales, estado, orden y fecha de creación `timestamptz`. Lectura pública; CRUD exclusivo del administrador. |
| `skills` | Conserva nombre, categoría, descripción, nivel e icono. Alimenta Herramientas y las capacidades de Habilidades; se evita una tabla duplicada de herramientas. |
| `experiences`, `education` | Conservan campos y fechas descriptivas existentes sin inventar períodos. |
| `soft_skills`, `social_links` | Habilidades personales y enlaces reales. |
| `profile` | Lectura directa sólo para admin. `get_public_profile()` entrega el perfil público y elimina `phone` cuando está oculto. `save_profile()` valida la autorización y actualiza el perfil. |
| `contact_messages` | Privado. Admin puede leer, marcar y eliminar. La recepción pública opcional pasa por Express. |
| `private.admin_users` | Lista de UUID autorizados de Supabase Auth, gestionada desde SQL Editor. |

Las antiguas relaciones que sólo contenían nombres de tecnologías se transformaron en el array `projects.technologies` y los campos `skills.name/category`, conservando su información. Esto permite guardar cada proyecto o herramienta con una única operación atómica. Se preservaron los IDs y se ajustan las secuencias al importar; las fechas de creación nuevas usan `timestamptz` y los períodos históricos conservan su texto original.

`supabase/data.json` es sólo fuente de la semilla pública; **no es un fallback de ejecución**. `npm run db:seed` regenera el SQL público. Las importaciones no reemplazan registros con el mismo ID: elegir la migración privada o la semilla sobre una base vacía, no combinarlas para sobrescribir contenido.

La copia privada `supabase/backups/content-before-supabase.json` conserva el contenido previo, incluidos los logros retirados, sin hashes de contraseñas ni sesiones. El archivo `migration-data.sql` conserva la información necesaria para la aplicación actual. Los respaldos y el SQL privado están ignorados y no se incluyen en el build.

### Seguridad y Storage

`schema.sql` habilita RLS en las ocho tablas de contenido y en la lista privada de administradores. Los visitantes pueden consultar contenido público. Una cuenta autenticada sin autorización tampoco puede escribir. Las restricciones SQL controlan longitudes, estados, URLs y orden, aunque alguien omita la interfaz. El perfil privado se protege también ante consultas directas.

`portfolio-images` permite leer imágenes públicamente y subir/modificar/eliminar sólo con autorización de admin. El bucket limita imágenes a PNG, JPEG y WEBP de hasta 5 MB. El editor comprueba tipo, tamaño y firma del archivo, sube con un nombre aleatorio y guarda su URL pública en el registro. Una subida fallida no modifica el campo. Una imagen subida que no llegue a guardarse en un registro puede limpiarse desde Storage; eliminar un proyecto no elimina imágenes que puedan estar compartidas.

Los logos de la escuela y Grupo Núcleo, avatar, iconos del sistema y PDF del CV siguen en los assets locales del sitio. No requieren Storage. [Control de acceso de Storage](https://supabase.com/docs/guides/storage/security/access-control).

### Backend opcional

Se conserva Express por el endpoint `/api/contact`, su validación y límite de envíos, y como opción para servir el build. El portfolio, Auth, CRUD e imágenes funcionan directamente con Supabase y no necesitan ejecutar el backend.

Para usar `/api/contact`, configurar `backend/.env` según su ejemplo con `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `FRONTEND_URL` y `PORT`, y ejecutar `npm run backend` o `npm start`. La clave secreta queda exclusivamente en el servidor; RLS impide insertar mensajes directamente con la clave pública. `/api/health` comprueba la conexión del servidor. El contacto visible actual usa email y redes, por lo que el despliegue estático no requiere ese endpoint.

Si Express sirve la SPA, configurar `SUPABASE_URL` aunque no se utilice contacto: Helmet la usa en `connect-src` para permitir las consultas del navegador. `TRUST_PROXY=1` sólo corresponde cuando existe un proxy confiable delante del servidor.

## Hosting

El frontend puede desplegarse como sitio estático: comando `npm run build`, directorio de salida `dist`, raíz del proyecto `PortfolioR4`. Configurar las dos variables `VITE_SUPABASE_*` **antes** del build. Las lecturas, Auth, CRUD y subidas irán directamente a Supabase. El build no usa conexiones de base de datos locales ni un proxy de desarrollo.

Se incluyen `vercel.json` y `public/_redirects` para que la recarga de `/admin` resuelva la SPA. Los assets y el PDF se incluyen en `dist`. Para servirlo con Node, `npm start` inicia el servidor opcional; debe terminarse HTTPS en el host y configurarse el origen Supabase para CSP.

No hay una URL pública de deploy todavía. La entrega con hosting real exige crear Supabase, completar la configuración, pasar las pruebas remotas y publicar el frontend.

## Cumplimiento de la consigna

- SPA: todas las secciones del portfolio se abren dentro de `/`; `/admin` sólo administra contenido.
- Componentes: Desktop, Window, Projects/ProjectCard, Skills, Tools, Contact y componentes del editor.
- Hooks: estado de ventanas y formularios, carga con `useEffect`, suscripción de Auth con limpieza y referencias para arrastrar.
- Eventos: abrir, cerrar, minimizar, restaurar, foco, filtros, teclado y Pointer Events.
- Animaciones CSS: apertura/cierre, minimización, Inicio y avatar, respetando movimiento reducido.
- Responsive: escritorio acotado, ventanas con scroll interno; adaptación móvil y controles táctiles.
- Persistencia: consultas y CRUD mediante Supabase; al volver al escritorio se recarga la base y se actualiza al recuperar el foco.
- Logros: sección retirada por solicitud posterior de la autora.

## Revisión final

- [x] Eliminadas la conexión, dependencia y configuración de la base local anterior del código activo.
- [x] Cliente centralizado `src/services/supabaseClient.ts` y variables públicas documentadas.
- [x] Logros retirado de la navegación y del administrador.
- [x] SQL PostgreSQL, semilla pública y migración privada con datos conservados.
- [x] RLS y políticas de autorización definidas en SQL.
- [x] Pruebas locales del SQL: lectura pública, privacidad, rechazo de escrituras anónimas, rechazo de usuarios no autorizados, CRUD del administrador y políticas de Storage.
- [x] Carga/error/reintento y login por email y contraseña implementados.
- [x] Build de producción compatible con despliegue estático.
- [ ] Crear proyecto Supabase y ejecutar SQL allí.
- [ ] Configurar `.env` con las credenciales públicas reales.
- [ ] Confirmar lectura, Auth, CRUD y Storage contra Supabase remoto.
- [ ] Revisar consola y flujo completo con datos remotos.
- [ ] Publicar y comprobar deploy real por HTTPS.

### Pruebas

```powershell
npm test
npm run lint
npm run build
```

`npm test` ejecuta el esquema y las políticas reales sobre PostgreSQL embebido (PGlite) con roles de prueba y estructuras mínimas que simulan Auth/Storage. Prueba restricciones y permisos SQL sin requerir un servicio local. **No sustituye** probar Supabase Auth, sus APIs ni el bucket real.

Cuando Supabase esté configurado:

```powershell
npm run test:supabase
```

Para que la verificación remota incluya login, CRUD y Storage, proporcionar temporalmente `TEST_ADMIN_EMAIL` y `TEST_ADMIN_PASSWORD` en la terminal. No usar prefijo `VITE_` ni guardar estos datos en Git. El script crea un proyecto y una imagen de prueba y los elimina al terminar. Con variables vacías termina indicando exactamente qué configuración falta; no marca pruebas omitidas como aprobadas.

Los archivos `src/src-backups` son copias históricas ajenas a la aplicación activa y están excluidos del build y lint. Los nombres de tecnologías del perfil se preservan como conocimientos, no como dependencias de ejecución.
