# Lista de espera digital, frontend

Las tres pantallas del producto: **Unirse** y **Tu turno** (comensal, en el celular) y **La cola** (anfitrión, en la
tablet). Se actualizan en vivo sin recargar.

**Stack:** React 19 · Vite · Tailwind CSS v4 · shadcn/ui · TanStack Query · React Router · react-hook-form + zod ·
Vitest · **TypeScript** (modo estricto).

## Levantarlo en 5 minutos

**Requisitos:** Node 22.12 o superior (24 o 26 también sirven) y el **backend corriendo** en el puerto 8000.
Es un repo aparte: [mesa-24-7-backend](https://github.com/yonelacv-dev/mesa-24-7-backend) — clónalo y sigue
su propio README (`poetry install`, `./scripts/setup_demo_data.sh --demo-queue`, `poetry run uvicorn ...`).

```bash
cd frontend

npm install
cp .env.example .env      # en desarrollo no hay que cambiar nada
npm run dev
```

Abre <http://localhost:5173>. En desarrollo el front llama a `/api` en su propio origen y Vite lo reenvía al back
(`VITE_PROXY_TARGET`), así que no hace falta configurar CORS.

| Pantalla | URL de ejemplo |
|---|---|
| Unirse (lo que abre el QR) | <http://localhost:5173/venues/la-terraza-azul/diner> |
| Tu turno | `/venues/la-terraza-azul/diner/turn/<token>` (se llega al unirse) |
| Login de la tablet | <http://localhost:5173/venues/la-terraza-azul/host/login> |
| La cola (tablet) | <http://localhost:5173/venues/la-terraza-azul/host> (pide login) |

**Para probar el flujo completo** abre dos pestañas o un celular y una tablet:

1. En la tablet: entra a `/host`, inicia sesión con el usuario del local (`terraza-azul`, `cuatro-vientos` o
   `casa-mediterranea`) y la contraseña `demo1234` (fija por defecto; distinta solo si el back se sembró
   con `SEED_PASSWORD` en otro valor).
2. En el celular: entra a `/diner` y únete. Verás tu puesto y tu ticket.
3. En la tablet aparece la fila al instante. Toca **Llamar**: el celular cambia a "Tu mesa está lista" con la cuenta
   regresiva de 10 minutos.

> Si la lista está **cerrada** (fuera del horario del local), nadie puede unirse. Se abre desde el botón **Horario** de
> la tablet.

Para probar desde un celular real en la misma red: `npm run dev -- --host` y abre `http://<IP-de-tu-Mac>:5173/...`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Verifica los tipos (`tsc`) y genera el build de producción en `dist/` (cada página se carga bajo demanda) |
| `npm run preview` | Sirve el build para revisarlo |
| `npm test` | Tests unitarios y de arquitectura (`npm run test:watch` para modo interactivo) |
| `npm run typecheck` | Solo verifica los tipos, sin compilar |
| `npm run gen:api` | Regenera los tipos de la API desde el OpenAPI del back (necesita el back corriendo en el puerto 8000) |
| `npm run lint` | Lint con oxlint |
| `npm run e2e` | Pruebas de punta a punta con Playwright (ver abajo) |
| `npm run e2e:ui` | Igual, con la interfaz visual de Playwright para depurar |

## Variables de entorno (`.env`)

| Variable | Por defecto | Para qué |
|---|---|---|
| `VITE_API_URL` | vacío | URL base del back. **Vacío** = mismo origen (`/api/...`), que es lo normal |
| `VITE_PROXY_TARGET` | `http://127.0.0.1:8000` | A dónde reenvía `/api` el servidor de desarrollo |

## Producción

```bash
npm run build      # genera dist/
```

Lo más simple es servir `dist/` y `/api` bajo el **mismo dominio** (nginx), sin CORS:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_buffering off;              # necesario para los streams en vivo (SSE)
    proxy_read_timeout 1h;
}
location / {
    root /var/www/lista-espera/dist;
    try_files $uri /index.html;       # rutas del front (SPA)
}
```

Si el back vive en otro dominio: definir `VITE_API_URL=https://api.ejemplo.com` **antes** del build y añadir el origen
del front a `CORS_ORIGINS` en el back.

**El QR** de cada local apunta a `https://<tu-dominio>/venues/<slug>/diner`. La tablet del local abre
`https://<tu-dominio>/venues/<slug>/host` y queda con la sesión iniciada (no vence por tiempo).

## Docker

Para un servidor de pruebas (no para desarrollo local, donde `npm run dev` recarga en caliente). Sirve el
build con nginx, que además reenvía `/api` al contenedor del backend por una red compartida entre los dos
`docker-compose.yml` — así el navegador ve un solo origen y no hay que configurar CORS.

```bash
docker network create waitlist-net   # una sola vez, si no existe ya (o créala al levantar el backend)
docker compose up -d --build         # requiere el backend ya levantado (repo mesa-24-7-backend, sección Docker de su README)
```

- Se sirve en `http://<tu-servidor>:8080` por defecto — no en el 80, porque un servidor de pruebas suele
  tener ya algo propio ahí (tu nginx, otro proyecto). Si el 80 está libre y quieres usarlo directo, pon
  `WEB_PORT=80` en un `.env`. Si no, deja el 8080 y pon tu propio nginx/apache al frente apuntando a él
  (`proxy_pass http://127.0.0.1:8080;`), con `proxy_buffering off` para no cortar los streams en vivo.
- `VITE_API_URL` no se usa aquí: el build de producción llama a `/api` en su propio origen (nginx lo
  reenvía), así que no hace falta ninguna variable al construir la imagen.
- `nginx.conf` es quien resuelve el nombre `api` (el servicio del backend) dentro de `waitlist-net`, y
  quien desactiva el buffering (`proxy_buffering off`) para que los streams en vivo (SSE) no se corten.

```bash
docker compose logs -f web        # ver los logs
docker compose up -d --build      # reconstruir tras un cambio (recompila el front entero)
docker compose down               # detener
```

## Pruebas de punta a punta (e2e)

```bash
npx playwright install chromium   # solo la primera vez
npm run e2e
```

Requisitos: MySQL corriendo en local (con usuario `root` sin contraseña, igual que el resto del proyecto) y el
repo [mesa-24-7-backend](https://github.com/yonelacv-dev/mesa-24-7-backend) clonado, con `poetry install` ya
corrido ahí. Por defecto se asume una carpeta **hermana** de esta llamada `backend` (`git clone` ese repo
como `backend` justo al lado de `frontend/`); si lo tienes en otro lado o con otro nombre:
`BACKEND_DIR=/ruta/a/mesa-24-7-backend npm run e2e`.

No hace falta tener el back ni el front arrancados a mano: Playwright levanta su **propia** copia de ambos
(puertos 8001 y 5174, distintos de los de desarrollo) contra una base de datos propia, `waiting_list_e2e`,
que recrea desde cero en cada corrida — nunca toca `waiting_list`.

Corre el flujo completo contra el back real (sin mocks): unirse, ser llamado, sentarse, cancelar, "Voy en camino",
recuperar el turno con ticket y teléfono, un teléfono con una sola entrada activa, las acciones del anfitrión con su
confirmación, pausar/reanudar, validación del horario, y que ninguna pantalla desborde ni tenga botones más chicos
que 44px, en tres anchos (celular, tablet y escritorio).

> El back de desarrollo (`uvicorn` sin `--workers`) es un solo proceso: bajo la carga de la suite completa, algún
> paso puntual puede tardar de más. Por eso hay un reintento configurado — si un caso falla y pasa solo al
> reintentarlo, es lentitud del entorno, no un defecto real. Si falla dos veces seguidas, sí hay que mirarlo.

## Arquitectura

Módulos que espejan los del back (`auth`, `venues`, `waitlist`), con la lógica de negocio separada de la interfaz:

```
src/
├── modules/<módulo>/
│   ├── domain/       reglas y textos puros: sin React ni HTTP (cuenta regresiva, "Eres el siguiente"...)
│   ├── schemas/      validación de formularios (zod)
│   ├── services/     HTTP, SSE y almacenamiento: los adaptadores hacia el back
│   ├── hooks/        casos de uso de la interfaz: TanStack Query + tiempo real
│   ├── components/   presentacionales: reciben props y emiten eventos
│   ├── pages/        componen hooks y componentes; una por ruta
│   └── index.ts      API pública del módulo (no exporta páginas)
├── components/ui/    componentes base de shadcn/ui
├── shared/           componentes, hooks, utilidades, constantes y tipos propios reutilizables
│   └── types/        tipos del dominio; api.generated.ts sale del OpenAPI del back (no se edita)
├── services/         cliente HTTP global (api.ts) y SSE (sse.ts)
├── router/ · lib/ · App.tsx · main.tsx
```

Los componentes van en tres niveles: `components/ui` (base) → `shared/components` (reutilizables propios) →
`modules/*/components` (específicos del negocio).

`src/architecture.test.ts` **hace cumplir** las capas: `domain` no importa React, `components` no llaman a servicios
ni a hooks de datos, un módulo entra a otro solo por su `index.ts`, y las páginas no se exportan en él.

### Tipos

- **Los tipos de la API no se escriben a mano:** `src/shared/types/api.generated.ts` se genera desde el OpenAPI del back con
  `npm run gen:api`. Cuando cambie un endpoint o un esquema del back, se vuelve a correr y el compilador señala lo que
  dejó de cuadrar.
- `src/shared/types/index.ts` da nombres al dominio (`Entry`, `HostQueue`, `HostRow`...) y acota lo que el back declara como
  `str` a las uniones reales (`EntryStatus`, `ListKind`...).
- Todos los errores de consultas y mutaciones son `ApiError` (declarado una vez en `src/services/react-query.d.ts`), así que
  `error.status` y `error.code` están tipados.
- El único punto sin verificación en compilación es el JSON que llega por red (SSE y HTTP): ahí hay una aserción, en
  `services/sse.ts` y `services/api.ts`.

### Decisiones que conviene conocer

- **La verdad del negocio está en el back.** El front no recalcula puesto, ETA ni horario: los muestra. En `domain/`
  solo hay lógica de presentación (textos, cuenta regresiva, qué acciones ofrecer).
- **Tiempo real con SSE por `fetch`** (no `EventSource`), porque la tablet necesita enviar el header `Authorization`.
  Reconecta sola con espera creciente y al reconectar recibe el estado completo. Si no hay conexión, los botones de
  acción se deshabilitan y se muestra "Sin conexión, reintentando".
- **La cuenta regresiva usa el reloj del servidor** (`server_time`), no el del celular.
- **El turno del comensal se recuerda** en `localStorage` por local: al escanear el QR otra vez va directo a su turno.
- **Responsive sin tamaños fijos:** mobile-first, números que escalan con `clamp()`, filas de la cola con container
  queries, diálogos como panel inferior en móvil, botones táctiles y respeto de las áreas seguras (notch).
- **Modo oscuro** automático según el sistema.

## Problemas comunes

| Síntoma | Causa |
|---|---|
| Pantalla en blanco o errores `502` en `/api/...` | El back no está corriendo en el puerto 8000 |
| "No encontramos ese local" | El slug de la URL no existe (¿corriste el seed del back?) |
| "La lista de espera está cerrada" | Fuera del horario del local; abrirlo desde **Horario** en la tablet |
| La tablet vuelve al login sola | El back rechazó el token (sesión cerrada): iniciar sesión de nuevo |
| `npm test` falla con "Node version" | Usar Node 22.12 o superior |
