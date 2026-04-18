# Practica Final Codex Frontend

Aplicacion frontend creada con React y Vite para ejecutarse de forma local.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalacion

```bash
npm install
```

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo local.
- `npm run build`: genera la carpeta de produccion `dist`.
- `npm run preview`: sirve localmente la version compilada.
- `npm run test`: ejecuta las pruebas unitarias.

## Ejecucion local

1. Instala dependencias con `npm install`.
2. Inicia el backend vecino `PracticaFinalCodexBackend` con `npm start`.
3. Inicia el proyecto con `npm run dev`.
4. Abre en el navegador la URL que muestre Vite, normalmente `http://localhost:5173`.

## Configuracion del backend

Por defecto el frontend consume `http://localhost:3000`.

Si necesitas otro host o puerto, configura la variable `VITE_API_BASE_URL`.

Ejemplo en PowerShell:

```powershell
$env:VITE_API_BASE_URL="http://localhost:4000"
npm run dev
```

## Estructura principal

```text
.
|-- index.html
|-- package.json
|-- vite.config.js
`-- src
    |-- App.jsx
    |-- App.css
    |-- App.test.jsx
    |-- index.css
    |-- main.jsx
    `-- test
        `-- setupTests.js
```
