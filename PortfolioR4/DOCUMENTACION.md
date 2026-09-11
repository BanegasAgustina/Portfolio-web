# Documentación del proyecto

Esta guía describe el código presente en este checkout. Los comentarios dentro de los archivos explican el propósito y las partes importantes sin cambiar su ejecución. Las definiciones SQL y el entorno remoto de Supabase no están incluidos: los nombres de tablas y campos de esta guía se obtienen de las consultas y formularios, no de una inspección de la base real.

## Frontend

### Entrada y rutas

| Archivo | Responsabilidad y relación con otros archivos |
| --- | --- |
| `index.html` | Metadatos, favicon, idioma y nodo `#root`. Carga `src/main.tsx`. |
| `src/main.tsx` | Importa `index.css` y monta `App` dentro de `StrictMode`, que ayuda a detectar problemas en desarrollo. |
| `src/App.tsx` | Comparte `ThemeProvider`, configura `BrowserRouter` y carga los estilos de aplicación/escritorio. |
| `src/types.ts` | Define `RecordData`, `Portfolio` y `WindowId`; son contratos TypeScript, no validaciones de red ni tablas SQL. |

`/` es público y muestra `Desktop`. `/admin` muestra `Admin`, que primero consulta la sesión y puede presentar el login. No existe un componente `ProtectedRoute`: el estado del frontend decide qué mostrar y el middleware de Express decide si una operación privada está autorizada. Cualquier otra ruta presenta la pantalla de “no encontramos esa carpeta”.

### Pantallas

**`src/pages/Desktop.tsx`** carga el contenido mediante `api('/portfolio')`. Conserva la última respuesta correcta en `data`, el fallo en `error`, el contador de reintento en `attempt` y la apertura del recorrido ampliado en `more`. El efecto carga al montar, al reintentar y al recuperar el foco de la ventana del navegador. También escucha `portfolio-content-changed`; no se encontró un emisor de ese evento en el frontend activo revisado. La limpieza impide aplicar respuestas después de desmontar y retira los listeners.

`open(id)` pide al administrador de ventanas abrir/restaurar una sección y enfoca su elemento después del próximo dibujo de React. Las ventanas se generan desde `manager.windows`, usando `Window` como contenedor. El escritorio activo comienza sin ventanas abiertas.

**`src/pages/Admin.tsx`** consulta la sesión al montarse y coordina las secciones internas sin cambiar la URL. La segunda consulta depende de `auth`, `section` y `revision`: guardar, eliminar o marcar leído incrementa `revision` para volver a leer. El panel y configuración no necesitan listas remotas. El perfil se recibe como objeto único y abre directamente el editor.

| Estado de Admin | Para qué sirve |
| --- | --- |
| `auth` | `null`: comprobando; `false`: login; `true`: panel. No es una credencial. |
| `notice` | Mensaje de resultado o fallo de una operación. |
| `busy` | Deshabilita controles durante operaciones. |
| `section` | Clave de la sección seleccionada. |
| `rows` | Registros de la sección cargada. |
| `editing` | `null` sin formulario; objeto vacío al crear; registro al editar. |
| `remove` | ID pendiente de confirmación de eliminación. |
| `loading`, `loadError` | Estado y error de la lectura de datos. |
| `revision` | Contador que provoca una nueva lectura. |
| `selectedMessage` | Mensaje abierto en detalle. |

### Componentes públicos

| Archivo | Qué recibe y qué devuelve |
| --- | --- |
| `src/components/Window.tsx` | `title`, `icon`, `children`, clases y estado visual; devuelve marco XP y controles. Notifica foco, cierre y minimización por callbacks. |
| `src/components/Projects.tsx` | Lista `projects`; devuelve búsqueda, filtro, tarjetas o detalle. `category`, `search` y `detail` viven sólo en memoria. |
| `src/components/Tools.tsx` | Lista `skills`; devuelve herramientas filtradas e información de ayuda. `selected` conserva la herramienta elegida por clic/toque. |
| `src/components/Skills.tsx` | `skills` y `personal`; agrupa descripciones por categoría y muestra habilidades personales. No tiene efectos ni consultas. |
| `src/components/Contact.tsx` | `links` y URL opcional `cv`; devuelve correo, redes y descarga. Usa `/cv/Agustina-Banegas-CV.pdf` como alternativa. No contiene formulario de envío. |
| `src/components/SocialLinks.tsx` | `links` con nombre/URL/ID; devuelve enlaces en otra pestaña e iconos. |
| `src/components/Icon.tsx` | Nombre y tamaño; elige recursos clásicos o delega en `TechnologyIcon`. Los desconocidos usan carpeta. |
| `src/components/TechnologyIcon.tsx` | Nombre y tamaño; usa SVG locales como máscaras con color o dibuja una alternativa SVG. No consulta servicios de logos. |

`ProjectCard`, dentro de `Projects.tsx`, recibe un registro `p` y `onSelect`; el botón de detalle entrega el registro al padre. `ProjectLinks` muestra demo/GitHub si existen. El filtro usa título, descripción y tecnologías; `useMemo` lo recalcula cuando cambian los registros o filtros.

`Window` mantiene `maximized`, `position` y `leaving`. Las referencias guardan el elemento, el puntero de arrastre y el temporizador. Arrastrar modifica variables CSS, limitado al espacio del padre y desactivado a 900 px o menos. `leave(kind, action)` ejecuta la animación antes del callback; reduce la espera a cero si el sistema solicita menos movimiento. Minimizar oculta una ventana montada; cerrar la retira y pierde su estado local.

### Componentes del administrador

| Archivo | Función |
| --- | --- |
| `src/components/admin/fields.ts` | Define controles por entidad y nombres del menú. `key` coincide con la propiedad del registro, `type` decide el control y `required/max/options` configuran sus restricciones. |
| `src/components/admin/Editor.tsx` | Recibe `entity`, `record`, `busy`, `onSave`, `onCancel`. Construye el formulario desde `fields` y guarda una copia editable en `value`. |
| `src/components/admin/ConfirmDialog.tsx` | Recibe estado ocupado y callbacks. Abre un diálogo nativo al montarse, limita el foco y permite Escape cuando no está ocupado. No hace DELETE por sí mismo. |
| `src/components/admin/AdminIcon.tsx` | Traduce claves de secciones a iconos clásicos; los degradados usan IDs únicos por instancia para no mezclarse. |

`Editor.update(key, value)` modifica un campo local. `upload(key, file)` rechaza archivos de más de 5 MB y envía `FormData` a `/api/admin/upload`; guarda la URL recibida en el formulario. Subir el archivo y guardar el registro son operaciones separadas: cancelar el formulario no borra automáticamente la imagen subida. `submit(event)` transforma checks en booleanos y listas de texto en arrays antes de llamar a `onSave`. Los errores se muestran sin descartar lo escrito.

Las restricciones HTML del editor ayudan a completar los datos, pero no deben confundirse con permisos de Supabase. El backend valida expresamente el contacto y los archivos; el CRUD genérico pasa `req.body` a Supabase sin un esquema de validación propio por entidad.

### Contextos y hooks

- `src/context/theme.ts` define `{ dark, toggle }` y el hook `useTheme`. El contexto conecta a sus consumidores con `ThemeProvider`.
- `src/context/ThemeProvider.tsx` recibe `children`, restaura el tema y lo comparte con todas las rutas.
- `src/hooks/useDesktop.ts` exporta `useClock` y `useWindowManager`. El reloj actualiza la hora cada segundo y limpia el intervalo al desmontar. El gestor conserva `windows`, `minimized` y `stack`; el último elemento de `stack` es la ventana activa.

Las acciones `open`, `close`, `minimize` y `focus` reciben un `WindowId`. `zIndex(id)` convierte la posición dentro del orden de foco en una capa CSS. No se persiste la distribución de ventanas.

### Servicios

**`src/services/supabaseClient.ts`** lee `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Comprueba presencia, URL HTTPS y que la clave no sea del tipo secreto conocido. Si tiene formato JWT, lee el rol declarado `anon`; esa lectura no valida una firma. Si falla la configuración, conserva el error y exporta `null`. `getSupabase()` devuelve el cliente o lanza ese error.

El cliente permite persistencia y renovación de tokens de Supabase Auth, pero el login vigente del administrador no utiliza ese mecanismo. No hay que confundir esas opciones del SDK con la cookie propia de Express.

**`src/services/api.ts`** organiza ambos transportes:

| Función | Entrada y resultado |
| --- | --- |
| `check(error)` | Lanza un error legible si Supabase informó un fallo. |
| `serverApi(path, options)` | Hace `fetch('/api' + path)` con credenciales del mismo origen. Devuelve JSON o lanza el mensaje recibido. |
| `list(table)` | Lee registros por orden de visualización e ID; prioriza destacados en proyectos. |
| `portfolio()` | Combina seis listas y RPC `get_public_profile` en un objeto `Portfolio`; se ejecutan lecturas en paralelo. |
| `api(path, options)` | `/auth/*` y `/admin*` pasan a Express; `/portfolio` pasa al cliente público de Supabase. Rechaza otras rutas. |
| `send(method, data)` | Construye opciones HTTP y body JSON; por sí sola no envía nada. |

`GET` obtiene datos; `POST` crea o inicia una acción; `PUT` actualiza; `DELETE` elimina. El código no utiliza Axios ni endpoints PATCH. En subida de archivos el navegador prepara `Content-Type` con el separador multipart; el adaptador evita reemplazarlo.

### Estilos y temas

| Archivo | Alcance |
| --- | --- |
| `src/index.css` | Tipografía global, controles, foco accesible y variables de color para ambos temas. |
| `src/App.css` | Marco/barra de ventanas, perfil, proyectos, barra de tareas y base del administrador. |
| `src/Desktop.css` | Posiciones y tamaños del escritorio, ventanas, contacto, herramientas y animaciones. |
| `src/pages/Admin.css` | Escala de lectura, sidebar, listados, formularios, iconos y variantes responsive del admin. |

Los comentarios CSS separan propósito de cada bloque sin reordenar reglas ni cambiar propiedades. La especificidad de los selectores permite a `.admin-page ...` ajustar el panel sobre reglas base.

Al iniciar, el proveedor lee `localStorage['xp-theme']`. Si existe, usa `dark` o `light`; si no, consulta `prefers-color-scheme`. Al pulsar el control del tema se invierte `dark`; un efecto escribe `document.documentElement.dataset.theme` y guarda `xp-theme`. Los selectores `[data-theme="dark"]` cambian variables y algunos fondos. Si localStorage falla, el cambio visual sigue funcionando durante esa visita. El mismo proveedor sirve al escritorio y al administrador.

### Recursos y copias históricas

`src/assets/` contiene imágenes, iconos ICO, SVG y documentos que pueden importarse desde React. `src/assets/img/` aporta fondos, avatares, logos e iconos XP; `cv icon.txt` es un recurso auxiliar, no lógica. `public/` sirve archivos directamente por URL: `favicon.svg`, `icons.svg` (símbolos SVG), `technology-icons/*.svg` y el PDF del CV. `public/technology-icons/README.txt` acompaña los recursos de iconografía.

`src/src-backups/` conserva otra versión de `App`, `main`, tipos, CSS, servicios, hooks, contextos, páginas, componentes y assets. No se importa desde el punto de entrada activo y está excluida en TypeScript/ESLint. Sus archivos de código también tienen comentarios y una cabecera que los identifica como copias.

Los componentes comunes tienen la misma función general que sus equivalentes actuales, con estas diferencias importantes:

- `src-backups/App.tsx` no carga el `Desktop.css` actual.
- `src-backups/services/api.ts` envía todas las rutas a Express, incluido `/portfolio`; no contiene el adaptador público directo actual.
- `src-backups/pages/Desktop.tsx` conserva menú Inicio y referencias a logros. Esas referencias no demuestran que exista una sección activa equivalente.
- `src-backups/hooks/useDesktop.ts` abre Sobre mí y Proyectos inicialmente; la versión activa empieza con la lista vacía.
- `src-backups/pages/Admin.tsx` conserva otro login visual y una comprobación de sesión más sencilla.
- `src-backups/components/admin/fields.ts`, `types.ts` e `Icon.tsx` conservan referencias a logros; los tipos también mencionan papelera.
- `src-backups/App.css` conserva estilos de menú Inicio y distribución anterior. No se sincronizaron sus reglas con el diseño activo.

## Backend

### Archivos y arranque

| Archivo | Responsabilidad |
| --- | --- |
| `backend/config/env.js` | Carga `backend/.env`, resuelve `backendRoot` y `frontendDist`. |
| `backend/config/supabase.js` | Crea clientes con URL y clave privada del entorno. No se importa desde React. |
| `backend/app.js` | Configura Express, Helmet, JSON, control de origen, router, archivos estáticos y errores. Abre puerto fuera de Vercel. |
| `backend/routes/api.js` | Contiene todos los endpoints; no hay carpetas separadas de controllers/services en este backend. |
| `backend/middleware/adminAuth.js` | Crea, consulta y destruye sesiones de administración. |
| `backend/middleware/validation.js` | Esquema Zod del contacto público. |
| `api/index.js` | Exporta Express como función serverless para Vercel. |
| `backend/package.json` | Dependencias de Node, módulo ES y comandos de arranque/test del workspace. |

`app.js` carga el entorno antes de usarlo. `helmet` añade cabeceras de seguridad y una política de contenido; `connect-src` incluye el mismo origen y la URL de Supabase configurada. `express.json` admite hasta 100 KB. Las escrituras bajo `/api` que incluyen `Origin` se comparan con `FRONTEND_URL` o el origen del servidor. No existe un middleware CORS general que habilite orígenes arbitrarios.

El router se monta bajo `/api` y también sin prefijo para admitir la entrada serverless prevista por el código. Después se sirven `dist` y el HTML de la aplicación. El manejador final registra el fallo y responde con un mensaje genérico. En ejecución local el puerto predeterminado es 3001; `VERCEL` evita abrir un servidor con `listen`.

### Endpoints

Las URL siguientes muestran el prefijo normal `/api`.

| Método y URL | Entrada | Operación y respuesta |
| --- | --- | --- |
| `GET /api/health` | Sin body | Lee hasta un ID de `projects`; devuelve estado y nombre de base. |
| `POST /api/contact` | `name`, `email`, `subject`, `message` | Zod valida; inserta `contact_messages`; devuelve 201 `{ ok: true }`. Hasta cinco solicitudes por 15 minutos. |
| `POST /api/auth/login` | `password` | Lee `admins.id=1`, compara bcrypt, crea sesión y cookie; devuelve `{ authenticated: true }`. Hasta diez solicitudes por 15 minutos. |
| `GET /api/auth/me` | Cookie opcional | Consulta vencimiento y devuelve `{ authenticated: boolean }`. |
| `POST /api/auth/logout` | Cookie opcional | Intenta borrar sesión y expira cookie; devuelve `{ ok: true }`. |
| `GET /api/admin/profile` | Cookie | Devuelve el registro completo `profile.id=1`. |
| `PUT /api/admin/profile` | Cookie y campos del perfil | Actualiza `id=1` y devuelve registro completo. |
| `POST /api/admin/upload` | Cookie y archivo `image` multipart | Verifica formato/tamaño, sube a Storage y devuelve `{ url }`. |
| `GET /api/admin/:table` | Cookie y sección | Devuelve registros ordenados. Para mensajes: hasta 500, más recientes primero. |
| `POST /api/admin/:table` | Cookie y campos del nuevo registro | Inserta en tabla admitida; devuelve 201 `{ id }`. No admite mensajes. |
| `PUT /api/admin/:table/:id` | Cookie, ID y campos | Actualiza y devuelve `{ id }`. Mensajes sólo cambia `is_read` a true. |
| `DELETE /api/admin/:table/:id` | Cookie e ID | Elimina y devuelve `{ id }`. Rechaza mensajes con 404. |

`resolveTable` traduce `messages` a `contact_messages`. La lista admitida es `projects`, `skills`, `experiences`, `education`, `social_links`, `soft_skills`, `contact_messages`; perfil tiene endpoints propios. Todas las rutas de administración pasan por `requireAdmin`.

Multer conserva el archivo en memoria, limita a 5 MB y la ruta contrasta MIME y bytes iniciales de PNG/JPEG/WEBP. Se guarda con nombre aleatorio en `portfolio-images`, bajo `admin/`, con `upsert: false`. `getPublicUrl` construye la dirección; que se pueda leer depende del bucket configurado.

### Configuración y variables

No se muestran valores reales. `.env.example` documenta las variables públicas y `backend/.env.example` las del servidor.

| Variable | Uso observado |
| --- | --- |
| `VITE_SUPABASE_URL` | URL pública HTTPS para el cliente del navegador. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon/publishable; queda incluida en el frontend. |
| `SUPABASE_URL` | URL del cliente privado del servidor y origen permitido en CSP. |
| `SUPABASE_SECRET_KEY` | Clave privada del servidor; no debe usar prefijo `VITE_`. |
| `PORT`, `HOST` | Puerto e interfaz de escucha de Express. |
| `FRONTEND_URL` | Origen adicional admitido por el control de escrituras. |
| `TRUST_PROXY` | Si vale `1`, Express confía en un proxy. |
| `NODE_ENV` | Afecta cookies seguras, CSP e interfaz de escucha predeterminada. |
| `VERCEL` | Indica ejecución serverless y evita `app.listen`. |
| `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` | Sólo para el script de prueba de Supabase Auth; no para el login de Admin. |

## Base de datos

### Qué se puede afirmar desde este repositorio

No hay `schema.sql`, migraciones ni definiciones de funciones SQL incluidas en este checkout. Por eso no se puede confirmar tipos SQL, índices, restricciones, claves foráneas ni políticas RLS efectivamente instaladas. El siguiente mapa describe lo que el código espera encontrar.

| Tabla | Campos usados y finalidad |
| --- | --- |
| `profile` | Registro `id=1`: nombre, rol, descripción, frase, ubicación, avatar, CV, teléfono y `show_phone`. |
| `projects` | Título, descripciones, imagen, tecnologías, categoría, fecha, estado, GitHub, demo, destacado y orden. |
| `skills` | Nombre, categoría, descripción, icono, nivel opcional y orden. |
| `experiences` | Título, organización, descripción, fecha, estado y orden. |
| `education` | Datos de estudio: título, organización, descripción, ubicación, fecha, estado y orden. |
| `social_links` | Nombre de red, URL y orden. |
| `soft_skills` | Nombre de habilidad personal y orden. |
| `contact_messages` | Nombre, email, asunto, mensaje, `is_read`, `created_at`; lectura privada desde el admin. |
| `admins` | El login busca `id=1` y `password_hash`. |
| `admin_sessions` | `session_id`, `expires_at` en milisegundos y `data` con JSON de `adminId`. |

El frontend relaciona las listas por sus claves dentro de `Portfolio`; no hay joins entre proyectos, estudios y herramientas. `adminId` se serializa dentro de `admin_sessions.data`: eso expresa una relación de aplicación, no demuestra una foreign key SQL.

`get_public_profile` es una RPC llamada por el cliente público. La intención del código de verificación es ocultar `phone` cuando `show_phone` es falso y bloquear lectura anónima directa de `profile`; la definición remota no se verificó. `is_admin` aparece sólo en el script de prueba de Supabase Auth. La protección del administrador vigente depende de su middleware y cliente de servidor, no de invocar esa RPC desde React.

`portfolio-images` es un bucket de Storage, no una tabla del contenido. Los registros guardan sus URL en campos como `image`, `avatar` o `icon`.

### Scripts de datos

**`scripts/generate-seed.mjs`** lee `supabase/data.json`, convierte valores a SQL y escribe `supabase/seed.sql`. `toSql(content)` admite determinadas tablas, usa `ON CONFLICT(id) DO NOTHING` y ajusta secuencias de IDs. Envuelve el resultado en `begin/commit`, pero no ejecuta la transacción. La carpeta/entrada no están presentes. No filtra columnas privadas ni mensajes: el texto de consola sobre “sin datos privados” no constituye una comprobación del contenido.

**`scripts/verify-supabase.mjs`** espera acceso público, Supabase Auth y RPC `is_admin`. Lee tablas, comprueba el perfil, intenta una escritura anónima esperando rechazo, inicia sesión, crea/edita/lee un proyecto y sube un PNG temporal. Intenta limpiar proyecto e imagen en `finally` y cerrar Supabase Auth. No es de sólo lectura y un fallo en una aserción de limpieza puede detener pasos posteriores. No se ejecutó durante la documentación.

## Autenticación

1. `Admin` se monta y consulta `GET /api/auth/me`. El navegador adjunta la cookie del mismo origen si existe.
2. Sin sesión vigente se muestra el formulario. `login(event)` obtiene la contraseña y hace `POST /api/auth/login`.
3. Express valida el formato y consulta el hash de `admins.id=1`. `bcrypt.compare` comprueba la contraseña sin recuperar una contraseña original desde el hash.
4. `createAdminSession(res, adminId)` genera 32 bytes aleatorios convertidos a hexadecimal, calcula ocho horas de vigencia e inserta un registro en `admin_sessions`.
5. El servidor emite `admin_session` con `HttpOnly`, `SameSite=Lax`, `Path=/` y `Max-Age`; agrega `Secure` en producción. JavaScript no necesita ni puede leer esa cookie HttpOnly.
6. Cada operación `/admin` pasa por `requireAdmin`: consulta el token, verifica vencimiento, lee `data` en `req.admin` y llama a `next()`, o responde 401. No renueva la duración por actividad.
7. `logout()` solicita `POST /api/auth/logout`. El servidor intenta eliminar el registro y expira la cookie; el frontend limpia su estado al recibir éxito.

La sesión se restaura mediante cookie y consulta al servidor, no mediante `localStorage`. `auth=true` en React sólo controla la vista. La consulta `/auth/me` no se repite automáticamente en un intervalo; si la sesión vence, la siguiente operación protegida puede responder 401. La eliminación de sesión en logout no inspecciona el error que devuelve Supabase: se documenta la implementación existente.

## Panel administrador

| Sección visible | Clave y comportamiento |
| --- | --- |
| Panel de control | `dashboard`: accesos a las secciones, sin consulta de registros. |
| Proyectos | `projects`: formulario de datos, tecnologías, enlaces, imagen, destacado y orden. |
| Herramientas | `skills`: nombre, categoría, descripción, icono, nivel y orden. |
| Experiencia | `experiences`: puesto/título, organización, descripción, período, estado y orden. |
| Educación | `education`: estudio, institución, descripción, ubicación, período, estado y orden. |
| Información personal | `profile`: edición del registro único, incluido CV y visibilidad del teléfono. |
| Redes | `social_links`: nombre de red, URL y orden. |
| Habilidades personales | `soft_skills`: nombre y orden. |
| Mensajes | `messages`: listado privado y detalle; abrir uno nuevo solicita marcarlo leído. La API vigente rechaza su eliminación, aunque hay botones en la interfaz. |
| Configuración | `settings`: cambia el tema local del navegador. No modifica Supabase. |
| Cerrar sesión | Solicita logout y vuelve al formulario. |

Flujo de edición: `navigate` selecciona la sección → el efecto carga filas → Editar entrega el registro a `Editor` → `submit` normaliza campos → `Admin.save` elige POST/PUT → Express escribe en Supabase → `revision` cambia → el listado se consulta otra vez. La confirmación de borrado sólo guarda un ID pendiente hasta aceptar el diálogo.

## Portfolio público

- **Sobre mí:** usa `profile`, con avatar alternativo local. El recorrido ampliado muestra educación, habilidades personales, CV y teléfono si corresponde.
- **Proyectos:** utiliza `projects`, con búsqueda y categorías locales, detalle y enlaces a demo/GitHub.
- **Herramientas:** utiliza `skills`, sus categorías e iconos. La ayuda explica cada herramienta.
- **Habilidades:** reutiliza descripciones de `skills` agrupadas y las etiquetas de `soft_skills`.
- **Experiencia y educación:** muestran listas cronológicas con los datos recibidos; algunos nombres de organización activan logos locales mediante expresiones regulares.
- **Contacto:** correo, redes y CV. El endpoint público de mensajes existe en Express, pero este componente no envía mensajes.
- **Barra de tareas:** restaura/minimiza ventanas, muestra reloj y permite alternar tema.
- **Bloc de notas:** hay una rama de renderizado para `notes`; no se ofrece un acceso en los iconos activos actuales. Su texto no se guarda en servidor ni localStorage.

Las lecturas públicas dependen de los permisos del cliente público y del perfil devuelto por RPC. No se publican hashes ni sesiones mediante el objeto `Portfolio` construido por el frontend.

## Configuración propia y archivos auxiliares

| Archivo/carpeta | Explicación |
| --- | --- |
| `package.json` | Dependencias React/Vite/Supabase y scripts; declara `backend` como workspace. |
| `package-lock.json` | Resolución generada de dependencias; no se agregan comentarios. |
| `vite.config.ts` | Plugin React. No tiene proxy `/api`. |
| `eslint.config.js` | Análisis de Node y React/TypeScript; omite copias y salidas generadas. |
| `tsconfig.json` | Referencias para `tsc -b`. |
| `tsconfig.app.json` | React/DOM, revisión sin emitir JS y exclusión de respaldos. |
| `tsconfig.node.json` | Revisa la configuración de Vite en entorno Node. |
| `vercel.json` | Reescribe `/api/*` a la función y `/admin` a `index.html`. |
| `public/_redirects` | Regla de fallback a `index.html` para hosts que reconocen este formato; no inicia Express. |
| `.gitignore` | Excluye dependencias, build, entornos reales, uploads y ciertas copias de datos. |
| `.env.example`, `backend/.env.example` | Plantillas comentadas; conservan nombres y valores de ejemplo originales. |
| `tmp/pdfs/` | Imágenes auxiliares sin lógica de aplicación. |
| `dist/`, `node_modules/` | Salidas generadas y dependencias, fuera de la documentación interna del código. |

Los archivos JSON estrictos, como `package.json` y `vercel.json`, se explican aquí para no introducir sintaxis inválida. Los `tsconfig` admiten comentarios JSONC. No se comentaron imágenes, binarios, dependencias ni salidas generadas.

## Flujo general

```text
LECTURA PÚBLICA
Visitante → Desktop → api('/portfolio')
         → cliente público de Supabase
         → get_public_profile + SELECT de seis tablas
         → objeto Portfolio → componentes y ventanas

ADMINISTRACIÓN
Formulario → Admin/Editor → api('/admin/...')
           → fetch /api + cookie admin_session
           → Express → requireAdmin → consulta admin_sessions
           → cliente privado Supabase → tabla o Storage
           → JSON de respuesta → estado React y nueva lectura

TEMA
Botón → theme.toggle → dark → data-theme en html + localStorage xp-theme
      → variables CSS → apariencia del escritorio y del panel
```

Para explicar una función, seguí siempre su entrada, su efecto y su resultado: por ejemplo, `Editor.submit` recibe el evento, transforma la copia local y llama a `Admin.save`; no guarda directamente en Supabase. Esa separación ayuda a ubicar en qué archivo ocurre cada paso.

## Verificaciones y límites

`build` revisa TypeScript y genera el frontend. `lint` analiza el código activo indicado en `package.json`. Los scripts de test apuntan a una carpeta `tests` ausente en este checkout. No se ejecutaron scripts de migración, generación de datos ni pruebas con escrituras remotas para documentar el proyecto.

Verificación de esta edición: build y lint finalizaron correctamente. La comparación de 65 archivos de código/configuración modificados no encontró cambios en el JavaScript emitido ni en las reglas CSS, configuración JSON o estructura HTML al excluir comentarios. Las plantillas de entorno conservan nombres y valores. Los bundles de JavaScript y CSS conservaron sus identificadores de contenido respecto del build anterior. `npm test` finalizó informando cero tests y cero suites; no hay cobertura automatizada que atribuirle. También se comprobó la sintaxis de la entrada serverless y los scripts sin ejecutarlos.

Las observaciones sobre diferencias históricas y restricciones actuales se documentan; no se corrigen dentro de esta tarea.
