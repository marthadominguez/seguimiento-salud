# Seguimiento de salud — despliegue en Cloudflare Pages

Este proyecto es independiente de Claude: tus datos viven en una base de datos
de Cloudflare (KV) ligada a tu propia cuenta.

## Estado actual

Este proyecto ya está desplegado y funcionando:

- **Tablero:** https://seguimiento-salud.pages.dev
- **Proyecto de Pages:** `seguimiento-salud`
- **KV namespace:** `salud_mld` (vinculado en `wrangler.toml` como `HEALTH_KV`)
- **Clave de acceso:** configurada como secreto `API_KEY` en el proyecto

No necesitas repetir la configuración inicial salvo que empieces desde una
cuenta de Cloudflare nueva. Ve directo a "Actualizar el tablero en el futuro"
más abajo.

## Estructura

```
public/index.html        → el tablero (frontend)
functions/api/storage.js → la función que guarda/lee los datos (backend)
wrangler.toml            → configuración de despliegue
```

## Requisitos

- Cuenta gratuita de Cloudflare: https://dash.cloudflare.com/sign-up
- Node.js instalado en tu computador
- Wrangler (CLI de Cloudflare): se instala en el paso 1

## Configuración inicial (referencia — ya hecha en esta cuenta)

### 1. Instalar Wrangler y conectar tu cuenta

```bash
npm install -g wrangler
wrangler login
```

Esto abre el navegador para autorizar tu cuenta de Cloudflare.

### 2. Elegir tu clave de acceso

Piensa una clave (como una contraseña) que vas a usar para entrar al tablero
desde cualquier dispositivo. Guárdala en un lugar seguro (un gestor de
contraseñas), la necesitarás en el paso 5 y cada vez que entres desde un
dispositivo nuevo.

### 3. Crear la base de datos (KV namespace)

Desde la carpeta del proyecto:

```bash
wrangler kv namespace create HEALTH_KV
```

Esto imprime algo como:

```
[[kv_namespaces]]
binding = "HEALTH_KV"
id = "abcd1234..."
```

Copia esas 3 líneas y pégalas al final de `wrangler.toml`, reemplazando el
bloque comentado que ya está ahí.

### 4. Crear el proyecto de Pages

```bash
wrangler pages project create seguimiento-salud
```

Elige la región/ajustes por defecto cuando te pregunte.

### 5. Configurar tu clave de acceso como secreto

```bash
wrangler pages secret put API_KEY --project-name=seguimiento-salud
```

Te va a pedir el valor: pega la clave que elegiste en el paso 2.

### 6. Desplegar

```bash
wrangler pages deploy public --project-name=seguimiento-salud
```

Al terminar te da una URL tipo `https://seguimiento-salud.pages.dev` — esa es
tu tablero, ya accesible desde cualquier PC o celular.

### 7. Entrar por primera vez

Abre la URL, ingresa la clave de acceso que elegiste. El navegador la recuerda
localmente para que no la pidas cada vez en ese mismo dispositivo (pero sí la
primera vez en cada dispositivo nuevo).

## Actualizar el tablero en el futuro

Si quieres cambiar algo del diseño o agregar un marcador nuevo, edita
`public/index.html` y vuelve a correr:

```bash
wrangler pages deploy public --project-name=seguimiento-salud
```

Tus datos guardados no se pierden — viven en el KV namespace, separado del
código.

## Cambiar la clave de acceso

```bash
printf 'TU_NUEVA_CLAVE' | wrangler pages secret put API_KEY --project-name=seguimiento-salud
```

Usa `printf` (no `echo`) para no incluir un salto de línea al final del
valor — un secreto con un salto de línea de más no coincide con lo que el
navegador envía y la clave "correcta" aparece como incorrecta.

⚠️ Los secretos y variables de entorno de Cloudflare Pages solo aplican a los
despliegues hechos **después** de configurarlos. Si cambias la clave, corre
también el comando de "Actualizar el tablero" de arriba para que el cambio
tome efecto.

## Nota de seguridad

Esto usa una clave compartida simple, suficiente para uso personal. Si en
algún momento quieres algo más robusto (login con correo, múltiples
usuarios), se puede migrar a Cloudflare Access o a un proveedor como
Supabase/Firebase — avísame si llegas a ese punto.
