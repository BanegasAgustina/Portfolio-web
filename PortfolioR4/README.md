# Portfolio de Silvia Agustina Banegas

Portfolio público inspirado en Windows XP, con React, TypeScript y Vite. Incluye un escritorio con ventanas reutilizables y un administrador protegido para editar el contenido en MySQL/MariaDB mediante una API Express.

## Estado y datos iniciales

Se reutilizaron el avatar, los fondos de PC/celular y los iconos de `src/assets/img`. El proyecto original era el ejemplo inicial de Vite: se conservaron su entorno TypeScript, React y configuración base, y se reemplazó la pantalla de demostración.

El contenido inicial contiene exclusivamente los datos profesionales proporcionados por la autora: perfil, Grupo Núcleo, EEST N°5, las herramientas indicadas, habilidades personales y enlaces reales. **No se cargaron proyectos ni logros inventados**, cursos del CV, The Candle Shop, DNI, nacimiento ni dirección exacta. PostgreSQL no se agregó porque no se identificaron proyectos que lo justifiquen. El teléfono empieza vacío y oculto. No existe dependencia de la API de GitHub.

## Instalación y base de datos con XAMPP / phpMyAdmin

El frontend está en `src/` y el servidor Node/Express está separado en `backend/`, con su propio `package.json`, configuración, pruebas y archivos SQL. La raíz usa un workspace npm para instalar las dependencias de ambos con un solo comando.

1. En el panel de XAMPP, iniciar **Apache** y **MySQL**.
2. Abrir **http://localhost/phpmyadmin**. phpMyAdmin administra la base MySQL/MariaDB; la API sigue ejecutándose con Node.
3. Crear la base **agustina_portfolio** con cotejamiento **utf8mb4_unicode_ci**.
4. Seleccionar esa base y, en **Importar**, cargar primero `backend/database/schema.sql` y después `backend/database/seed.sql`. Importar la semilla sólo una vez, sobre tablas vacías.
5. Desde la carpeta de la aplicación ejecutar `npm ci`.
6. Revisar `backend/.env`. Esta copia conserva los secretos locales y usa `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=agustina_portfolio`, `DB_USER=root`, `DB_PASSWORD=`. Ajustar usuario, contraseña y puerto si tu XAMPP usa otros valores.
7. Ejecutar `npm run admin:password` para crear el administrador en la base recién importada con la contraseña de `ADMIN_PASSWORD`.

En una copia nueva, crear primero `backend/.env` copiando `backend/.env.example` y completar `SESSION_SECRET` y `ADMIN_PASSWORD`. No guardar secretos en el frontend.

Como alternativa a importar los dos SQL, después de crear la base en phpMyAdmin se puede ejecutar `npm run db:setup`: crea las tablas, carga los datos iniciales y crea el administrador. **Elegir una de las dos formas de carga inicial**, sin importar de nuevo la semilla sobre datos existentes. La carga automática no sobrescribe un perfil ya creado.

La base aislada anterior permanece en `.runtime/mysql` como respaldo local, excluida de Git. La aplicación ya no la inicia ni se conecta a su puerto 3307. No se importó contenido ni se alteraron las bases de XAMPP automáticamente.

## Iniciar frontend y backend

Desde la carpeta de la aplicación, en una terminal:

```powershell
npm run backend
```

En otra terminal:

```powershell
npm run dev
```

También se puede iniciar el backend entrando a su carpeta:

```powershell
cd backend
npm run dev
```

`npm start` en la raíz o en `backend` inicia la API sin recarga automática. Los comandos de la raíz `npm run server`, `npm run db:setup`, `npm run admin:password` y `npm test` delegan al paquete backend.

Abrir **http://localhost:5173** y **http://localhost:5173/admin**. Usar `localhost` tal como está configurado en `FRONTEND_URL`, porque las escrituras verifican el origen exacto. La API escucha en el puerto 3001; MySQL en 3306. El frontend Vite se mantiene en 5173 y no es necesario copiar la aplicación a `htdocs`.

La contraseña inicial está en `ADMIN_PASSWORD` de `backend/.env`. Para cambiarla, editar ese campo y ejecutar `npm run admin:password`; guarda un hash bcrypt y cierra las sesiones anteriores. Las contraseñas requieren al menos 12 caracteres y no más de 72 bytes UTF-8. `ADMIN_PASSWORD` sólo es necesario durante la creación/cambio o las pruebas de integración, y se puede retirar del entorno de producción después de configurarlo.

Requisitos: Node.js 22.12+ o 24 LTS, npm y MySQL 8 o MariaDB 10.4+. El backend carga siempre `backend/.env`, sin depender de la carpeta desde donde se inicia.

## Variables de entorno

| Variable                            | Uso                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `PORT`                              | Puerto HTTP del backend; 3001 en desarrollo.                                                |
| `HOST`                              | Opcional: interfaz de escucha. Por defecto 127.0.0.1 en desarrollo y 0.0.0.0 en producción. |
| `DB_HOST`, `DB_PORT`                | Servidor SQL de XAMPP. Puerto 3306 por defecto.                                             |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Base y credenciales SQL; nunca se exponen al frontend.                                      |
| `DB_SSL`, `DB_CA_CERT`              | Usar `DB_SSL=true` para TLS con validación; certificado CA opcional mediante ruta local.    |
| `SESSION_SECRET`                    | Valor aleatorio de al menos 32 caracteres para firmar cookies.                              |
| `ADMIN_PASSWORD`                    | Contraseña inicial o nueva para los comandos de administración.                             |
| `FRONTEND_URL`                      | Origen público exacto, sin barra final. Ejemplo: http://localhost:5173.                     |
| `NODE_ENV`                          | Omitir en desarrollo local; production al desplegar, habilita cookies Secure.               |
| `TRUST_PROXY`                       | 1 únicamente si hay un proxy inverso confiable de un salto.                                 |
| `UPLOAD_DIR`                        | Carpeta persistente de imágenes, por defecto uploads.                                       |

Generar un secreto sin usar contraseñas de ejemplo:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

## Administración

El panel incluye Proyectos, Herramientas, Experiencia, Educación, Logros, Información personal, Redes, Habilidades personales, Mensajes y Configuración.

- Crear, editar y eliminar registros mediante formularios con etiquetas.
- Ordenar por `display_order`; los proyectos destacados aparecen primero.
- Proyectos: título, descripción breve/completa, imagen, tecnologías, categoría, fecha, estado, repositorio, demo y destacado.
- Herramientas: nombre, categoría, descripción del tooltip, icono y nivel opcional. No se generan porcentajes.
- Perfil: presentación, ubicación general, avatar, enlace a un CV público y teléfono con interruptor explícito de publicación.
- Imágenes: JPG, PNG y WEBP de hasta 5 MB. Se validan extensión, MIME y firma binaria. El nombre almacenado es un UUID.
- Mensajes: leer, marcar como leídos y eliminar con confirmación. El formulario guarda en la base; **no envía emails**.
- El CV se configura mediante un enlace a un documento público; no se añadió una carga de PDF.
- La eliminación pide confirmación en un diálogo XP con foco de teclado. Los errores no borran el formulario.

El portfolio consulta los datos al cargar y al recuperar el foco del navegador; después de editar en otra pestaña, volver al portfolio actualiza su contenido. También se puede recargar manualmente.

## Estructura

```text
src/
  components/
    admin/              Formularios, metadatos de campos y confirmación
    Window.tsx          Ventana reutilizable
    Icon.tsx            Recursos XP y accesos profesionales
    Projects.tsx        Búsqueda, filtros, tarjetas y detalle
    Tools.tsx           Panel de control por categorías y tooltips
    Contact.tsx         Formulario conectado al backend
    SocialLinks.tsx     Enlaces seguros a redes
  context/              Tema compartido mediante Context API
  hooks/                Reloj y administrador de ventanas
  pages/                Desktop y Admin
  services/api.ts       Cliente HTTP centralizado
  assets/img/           Recursos originales
  types.ts              Contratos de contenido
backend/
  config/               Pool SQL y almacenamiento de sesiones
  data/initial.json     Datos reales para la carga inicial
  middleware/           Validación de campos y autorización
  routes/api.js         Endpoints REST
  services/             Persistencia de contenido y almacenamiento de imágenes
  tests/                Validaciones y prueba de integración
  app.js                Seguridad, sesiones, rutas y servicio de producción
  setup.js              Esquema y carga inicial
  admin-password.js     Alta/cambio de contraseña por consola
 backend/database/schema.sql    Esquema relacional
 backend/database/seed.sql      Semilla SQL alternativa
backend/.env.example    Variables sin secretos
```

## API

Todos los cuerpos de contenido usan JSON. Las subidas usan `multipart/form-data` con el campo `image`. El cliente manda las cookies de sesión automáticamente.

| Método / ruta                  | Función                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| GET /api/health                | Verifica conexión SQL.                                              |
| GET /api/portfolio             | Contenido público completo, con privacidad aplicada.                |
| GET /api/projects/:id          | Detalle de un proyecto.                                             |
| GET /api/:recurso              | Lista pública de un recurso.                                        |
| POST /api/contact              | Valida y almacena un mensaje.                                       |
| POST /api/auth/login           | Inicia sesión con contraseña.                                       |
| GET /api/auth/me               | Indica si la sesión está autenticada.                               |
| POST /api/auth/logout          | Destruye la sesión.                                                 |
| GET /api/admin/:recurso        | Lista administrativa protegida.                                     |
| POST /api/admin/:recurso       | Crea un registro.                                                   |
| PUT /api/admin/:recurso/:id    | Actualiza un registro.                                              |
| DELETE /api/admin/:recurso/:id | Elimina un registro.                                                |
| GET, PUT /api/admin/profile    | Perfil único, con campos privados accesibles sólo al administrador. |
| GET /api/admin/messages        | Últimos 500 mensajes, en orden descendente.                         |
| PUT /api/admin/messages/:id    | Marca como leído.                                                   |
| DELETE /api/admin/messages/:id | Elimina un mensaje.                                                 |
| POST /api/admin/upload         | Guarda una imagen validada.                                         |

Recursos: `projects`, `skills`, `experiences`, `education`, `achievements`, `social_links`, `soft_skills`. No se admiten nombres arbitrarios de tablas.

## Modelo relacional y 3FN

Tablas: `admins`, `admin_sessions`, `profile`, `projects`, `technologies`, `project_technologies`, `skill_categories`, `skills`, `experiences`, `education`, `achievements`, `social_links`, `soft_skills`, `contact_messages`.

- **1FN:** cada columna almacena un valor atómico. Las tecnologías de un proyecto no se guardan como un texto separado por comas: se relacionan en `project_technologies`.
- **2FN:** cada atributo depende de la clave completa. La tabla intermedia tiene clave compuesta `(project_id, technology_id)` y no duplica atributos de proyecto o tecnología.
- **3FN:** los nombres de tecnologías y categorías viven en sus propios catálogos; las habilidades los referencian mediante claves foráneas. Los datos de perfil, educación, experiencia y mensajes están separados por entidad. No se almacenan conteos, porcentajes ni nombres derivados junto a sus claves.
- `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL` e índices mantienen identidad, integridad y orden de consulta. Al borrar un proyecto se borran sus relaciones, no las tecnologías.
- `admin_sessions` almacena estado técnico serializado del middleware de autenticación; no es un sustituto del modelo relacional del portfolio.

Los cambios de proyectos y sus relaciones se realizan en una transacción, con rollback ante errores.

## Seguridad

Contraseñas bcrypt con costo 12, cookies HttpOnly/SameSite y Secure en producción, regeneración de sesión al ingresar y vencimiento de ocho horas. Las sesiones persisten en SQL y las vencidas se depuran periódicamente.

Las escrituras exigen el origen exacto de `FRONTEND_URL` para prevenir CSRF. Frontend y API se sirven bajo el mismo origen mediante el proxy Vite en desarrollo o un proxy del host en producción: no se habilita CORS abierto. Las rutas administrativas verifican sesión en el servidor.

Zod valida límites, tipos, protocolos y campos permitidos. El frontend renderiza texto escapado por React, sin `dangerouslySetInnerHTML`. Las consultas usan parámetros; los identificadores SQL se seleccionan de listas y esquemas cerrados. Helmet agrega cabeceras de seguridad. Login y contacto tienen límites por IP. Los errores de infraestructura no devuelven consultas ni stack traces.

Para producción usar un usuario SQL restringido a esta base y una conexión privada o TLS según el proveedor. Las imágenes deben estar en un volumen persistente; `backend/services/storage.js` es el punto para conectar almacenamiento externo. No borrar archivos subidos automáticamente: pueden estar siendo reutilizados por varios registros.

## Hooks, eventos y experiencia de usuario

- `useState`: formularios, filtros, sesión, ventanas y mensajes de estado.
- `useEffect`: carga HTTP, actualización al recuperar foco, reloj, tema y limpieza de listeners.
- `useContext`: tema claro/oscuro compartido entre escritorio y administrador.
- `useMemo`: filtrado de proyectos y extracción de categorías.
- `useCallback`: acción estable para abrir/restaurar ventanas.
- `useRef`: menú Inicio y diálogo modal, con manejo de foco.
- Eventos de clic, cambio y envío coordinan navegación y CRUD. Escape cierra el menú y cancela diálogos. Los tooltips funcionan con hover y foco de teclado mediante CSS.
- Las ventanas pueden abrirse, cerrarse, minimizarse, restaurarse y maximizarse. No se implementa arrastre: se prioriza una grilla legible, con desplazamiento a la ventana seleccionada.
- La barra de tareas tiene reloj real. El menú Inicio incluye redes, recorrido, tema y administrador.
- Las animaciones de ventanas, tooltips y botones respetan `prefers-reduced-motion`.
- El tema usa primero la preferencia guardada y, si no existe, `prefers-color-scheme`.
- En celular hay accesos compactos, ventanas apiladas y formularios de una columna; las categorías administrativas se desplazan dentro de su propia barra.

## Verificación

```powershell
npm run lint
npm run build
npm test
```

La prueba de integración requiere backend y base activos, con la contraseña local disponible en `backend/.env`:

```powershell
$env:RUN_INTEGRATION='1'
npm test
Remove-Item Env:RUN_INTEGRATION
```

Usarla en una base de desarrollo: crea registros temporales identificados como `TEST-...`, verifica el CRUD y los elimina, restaura el perfil y borra la imagen de prueba. Prueba además autenticación, cookies, acceso anónimo, origen incorrecto, privacidad, contacto y rechazo de archivos falsos. Las pruebas unitarias siempre se ejecutan; integración se omite sin el indicador explícito.

## Producción y deploy

La aplicación está preparada para desplegarse; todavía no se publicó en un host externo.

Opción simple: un servicio Node con base SQL y disco persistente.

1. Configurar variables de entorno del servicio, sin subir `.env`. Usar `NODE_ENV=production`, el origen HTTPS final en `FRONTEND_URL`, credenciales SQL de producción y un nuevo `SESSION_SECRET`.
2. Crear la base y ejecutar `npm run db:setup` una sola vez. Configurar el administrador con una contraseña propia.
3. Compilar con `npm ci` y `npm run build`.
4. Iniciar con `npm start`. Express sirve tanto `dist` como la API y resuelve `/admin` al entrar directamente.
5. Configurar HTTPS y, si corresponde, `TRUST_PROXY=1` para un proxy confiable de un salto.
6. Montar almacenamiento persistente para `UPLOAD_DIR`, y respaldar base e imágenes.

Para frontend separado en Netlify/Vercel y backend en Render/Railway: publicar `dist`, redirigir `/api/*` y `/uploads/*` mediante proxy al backend, y las demás rutas a `index.html`. Mantener las cookies bajo el dominio del frontend y conservar `Origin`. No apuntar el formulario directamente a otro dominio sin diseñar de nuevo la política de cookies/CORS/CSRF. Las reglas exactas se definen cuando se elija el host; no se incluyeron credenciales ni configuraciones de un proveedor no elegido.

## Qué estudiar para defender el proyecto

1. Seguir un proyecto desde `Projects.tsx`, pasando por `services/api.ts`, las rutas Express y `services/content.js`, hasta sus tablas SQL.
2. Explicar la relación N:M y por qué se usa una transacción al guardar tecnologías.
3. Diferenciar estado de interfaz, contenido persistente y sesión de autenticación.
4. Mostrar por qué la contraseña no llega al bundle y cómo se restringe cada endpoint administrativo.
5. Explicar la doble validación, el escape de texto y las consultas parametrizadas.
6. Mostrar el componente `Window`, el hook de ventanas y la navegación responsive.
7. Comparar `useEffect`, `useMemo`, `useCallback` y Context en sus usos reales.
8. Mostrar que el teléfono se elimina de la respuesta pública, no sólo se oculta visualmente.

Los archivos principales llevan comentarios en español y pueden formatearse con `npm run format`.


## Escritorio y Curriculum

El escritorio público usa ventanas flotantes con orden de foco, minimizar/restaurar y tamaños por contenido. En pantallas de hasta 900 px sólo se muestra la ventana activa, centrada; el scroll queda dentro de su contenido. El administrador mantiene su desplazamiento habitual. Los estilos del escritorio están separados en `src/Desktop.css`.

Contacto muestra `agustinabanegas26@gmail.com`, las redes administradas y la descarga del PDF original completo, autorizado para publicación por su titular. El archivo se sirve desde `public/cv/Agustina-Banegas-CV.pdf`. Puede reemplazarse manteniendo ese nombre o configurarse otro CV público desde Información personal en `/admin`.

Los SVG de tecnologías se sirven localmente desde `public/technology-icons`, sin una dependencia de red en ejecución. Los logos institucionales y el avatar saludando se reutilizan desde `src/assets/img`.

La carpeta `src/src-backups` se conserva como respaldo del usuario y está excluida de TypeScript y ESLint.
