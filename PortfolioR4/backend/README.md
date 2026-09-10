# Backend opcional

El portfolio y el administrador se conectan directamente a Supabase. Este servicio Express conserva la recepción de contacto con validación y rate limit, y permite servir `dist/`.

Copiar `.env.example` a `.env` y completar `SUPABASE_URL`. Para `/api/contact` y `/api/health`, completar también `SUPABASE_SECRET_KEY` exclusivamente en este servidor. `FRONTEND_URL` debe coincidir con el origen del formulario; las escrituras desde otro origen se rechazan. No usar variables `VITE_` para secretos.

- `npm run dev`: servidor con recarga.
- `npm start`: servidor sin recarga, por defecto puerto 3001.
- `/api/contact`: POST con nombre, email, asunto y mensaje; validación Zod y máximo 5 envíos cada 15 minutos por IP.
- `/api/health`: prueba la conexión del servidor a Supabase.

La interfaz de contacto actual usa email y redes, por lo que el frontend se puede alojar estáticamente sin este servicio. El SQL de Supabase bloquea la inserción directa de mensajes desde clientes públicos. La administración de mensajes usa Auth y RLS desde React.

Documentación de configuración, migración, seguridad y verificación en el [README del repositorio](../../README.md).
