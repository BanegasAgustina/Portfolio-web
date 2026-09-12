# Logos locales de Herramientas

Los archivos se cargan como imágenes con `object-fit: contain`; no se dibujan marcas con CSS, máscaras, texto ni SVG inline. No se solicitan logos a servidores externos al abrir el portfolio.

## Procedencia

- **Devicon 2.16.0 (MIT)**: HTML5, CSS3, JavaScript, TypeScript, React, Node.js, Express, Vite, Bootstrap, MySQL, PostgreSQL, Supabase, Git, GitHub, C++, Java, Visual Studio Code, Figma, Linux y Windows. Se conservan los SVG originales en color.
- **Simple Icons 11.15.0 y 13.21.0 (CC0)**: OpenAI/ChatGPT, Claude, Microsoft Word, Excel, PowerPoint, Outlook, OneNote, Teams y Access; Google, Drive, Docs, Sheets, Slides, Forms, Gmail, Meet y Calendar; Canva y XAMPP. Se conservan las versiones monocromáticas originales.
- **Simple Icons 9.21.0 (CC0)**: Microsoft Office, emblema histórico de la suite.
- **CapCut**: icono oficial de 64 × 64 del sitio `https://www.capcut.com/`, exportado de ICO a PNG sin modificar el diseño.

`sources.json` contiene la URL y versión exactas de cada archivo. Las licencias de las bibliotecas están incluidas junto a los SVG. Las marcas pertenecen a sus respectivos titulares.

## Datos y comportamiento

`ToolLogo.tsx` asocia nombres y alias con archivos, pero no crea herramientas. La lista, el orden, las categorías, los niveles y las descripciones siguen llegando desde `skills` en Supabase.

Se prioriza el logo local conocido. Para nombres desconocidos se admite un `icon` que sea una ruta local absoluta. Las URLs remotas no se cargan. Cuando no existe logo local o la imagen falla se utiliza la carpeta de herramientas XP del proyecto, identificada como icono genérico en su texto alternativo. SQL no tiene una marca oficial única: no se le atribuye el logo de un proveedor de bases de datos. Las habilidades genéricas de soporte tampoco se presentan como marcas.

El contenedor blanco y pequeño permite leer los SVG negros en ambos temas sin recolorear los logos. `TechnologyIcon.tsx` continúa existiendo para otras ventanas, fuera del alcance de este rediseño; Herramientas ya no lo utiliza.

## Verificación del catálogo

El script existente `scripts/update-tools.mjs` contempla ChatGPT, Claude, CapCut y las herramientas individuales de Office y Google. No se ejecutó: este trabajo no modifica Supabase ni agrega registros hardcodeados. En este entorno no están configuradas las variables públicas necesarias para consultar `skills`; por eso no es posible confirmar qué herramientas faltan en la base activa. Los recursos están preparados para los registros actuales y futuros, sin duplicarlos.
