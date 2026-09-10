# Backend del portfolio

API Node + Express separada del frontend. Dependencias propias en `package.json`; la instalación de la raíz (`npm ci`) incluye este paquete mediante npm workspaces.

## MySQL de XAMPP

1. Iniciar Apache y MySQL en XAMPP.
2. Abrir http://localhost/phpmyadmin y crear `agustina_portfolio` con cotejamiento `utf8mb4_unicode_ci`.
3. Seleccionar la base e importar `database/schema.sql`, luego `database/seed.sql`, sólo una vez en tablas vacías.
4. Configurar `.env` (copiar `.env.example` si no existe). Con XAMPP habitual: `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_USER=root`, `DB_PASSWORD=` y `DB_NAME=agustina_portfolio`.
5. Completar `SESSION_SECRET` (mínimo 32 caracteres aleatorios) y `ADMIN_PASSWORD` (12 caracteres como mínimo, máximo 72 bytes UTF-8).
6. Ejecutar `npm run admin:password` para crear el administrador en la base importada.

Alternativa: crear únicamente la base en phpMyAdmin y ejecutar `npm run db:setup`; este comando importa estructura y datos automáticamente. No combinar ambas cargas de la semilla.

## Comandos desde esta carpeta

```powershell
npm run dev             # API en http://localhost:3001 con recarga automática
npm start               # API sin recarga automática
npm run db:setup        # Crear tablas y datos iniciales en una base existente
npm run admin:password  # Crear o cambiar la contraseña y cerrar sesiones anteriores
npm test                # Pruebas unitarias; integración requiere RUN_INTEGRATION=1
```

Desde la raíz del proyecto también funciona `npm run backend`.

Las imágenes se guardan en `backend/uploads`. `.env` se carga desde esta carpeta independientemente del directorio de trabajo. La compilación del frontend se sirve desde `../dist` y su proxy de desarrollo dirige `/api` y `/uploads` a esta API.

La documentación completa de endpoints, seguridad, normalización SQL, pruebas y deploy está en el README de la raíz de la aplicación.
