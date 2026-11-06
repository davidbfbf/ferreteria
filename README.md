# 🔧 Sistema de Gestión de Ferretería

Sistema para administrar **productos** y **categorías** de una ferretería, compuesto por:

| Parte | Tecnología | Carpeta |
|---|---|---|
| Base de datos | MySQL | `database/` |
| API RESTful | Node.js + Express.js | `backend/` |
| Frontend web | React.js (Vite) | `frontend-web/` |
| App móvil | React Native (Expo) | `mobile/` |
| Pruebas de la API | Postman / Thunder Client | `postman/` |

La API corre en una computadora que actúa como **servidor**; otras computadoras y celulares conectados a la **misma red** la consumen usando la **IP del servidor**.

```
 ┌──────────────┐      HTTP/JSON       ┌───────────────────────┐      SQL      ┌─────────┐
 │ Web (React)  │ ───────────────────▶ │                       │ ────────────▶ │         │
 │ :5173        │                      │  API Node + Express   │               │  MySQL  │
 └──────────────┘                      │  0.0.0.0:3000         │ ◀──────────── │ :3306   │
 ┌──────────────┐ http://IP:3000/api   │                       │               │         │
 │ Móvil (Expo) │ ───────────────────▶ └───────────────────────┘               └─────────┘
 └──────────────┘
```

---

## 1. Base de datos

Modelo relacional (1 categoría → N productos):

```
categorias                         productos
─────────────────────              ──────────────────────────────
id_categoria  INT PK  ◀──┐          id_producto   INT PK
nombre        VARCHAR    │          nombre        VARCHAR
descripcion   VARCHAR    │          descripcion   VARCHAR
                         │          precio        DECIMAL(10,2)
                         │          stock         INT
                         └───────── id_categoria  INT FK  (NOT NULL)
```

- `ON DELETE RESTRICT`: no se puede eliminar una categoría que tenga productos (la API responde **409**).
- `ON UPDATE CASCADE`: si cambia el ID de la categoría, se actualiza en los productos.

**Crear la BD** (MySQL Workbench → abrir `database/ferreteria.sql` → ejecutar ⚡), o por consola:

```bash
mysql -u root -p < database/ferreteria.sql
```

El script crea la base `ferreteria`, las dos tablas y datos de ejemplo.

---

## 2. Backend (API)

```bash
cd backend
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
# editar .env con el usuario/contraseña de MySQL
npm start
```

Al iniciar muestra las direcciones disponibles, por ejemplo:

```
API Ferretería escuchando en el puerto 3000
  Local:  http://localhost:3000
  Red:    http://192.168.1.10:3000     ← esta es la que usan los demás equipos
Conexión a MySQL: OK
```

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categorias` | Lista categorías (incluye `total_productos`) |
| GET | `/api/categorias/:id` | Obtiene una categoría |
| GET | `/api/categorias/:id/productos` | Productos de una categoría |
| POST | `/api/categorias` | Registra una categoría |
| PUT | `/api/categorias/:id` | Modifica una categoría |
| DELETE | `/api/categorias/:id` | Elimina (409 si tiene productos) |
| GET | `/api/productos` | Lista productos con el nombre de su categoría. Filtros: `?buscar=texto&categoria=id` |
| GET | `/api/productos/:id` | Obtiene un producto |
| POST | `/api/productos` | Registra un producto |
| PUT | `/api/productos/:id` | Modifica un producto |
| DELETE | `/api/productos/:id` | Elimina un producto |

Ejemplo de cuerpo para productos:

```json
{
  "nombre": "Alicate universal 8\"",
  "descripcion": "Mango aislado",
  "precio": 55.0,
  "stock": 20,
  "id_categoria": 1
}
```

Códigos de respuesta: `200` OK · `201` creado · `400` datos inválidos · `404` no encontrado · `409` conflicto (nombre duplicado o categoría con productos) · `500` error del servidor.

### Pruebas con Postman / Thunder Client

Importar `postman/Ferreteria.postman_collection.json`. La colección tiene la variable `baseUrl`; cambiarla a `http://IP_DEL_SERVIDOR:3000` para probar desde otra computadora.

---

## 3. Frontend web (React)

```bash
cd frontend-web
npm install
npm run dev
```

- En el servidor: abrir `http://localhost:5173`
- Desde otra computadora de la red: abrir `http://IP_DEL_SERVIDOR:5173`

La web detecta automáticamente la API en `http://<host-actual>:3000`, así que funciona igual en ambos casos. Para forzar otra URL, crear `frontend-web/.env` con `VITE_API_URL=http://IP:3000`.

Funciones: listar, buscar y filtrar productos por categoría, registrar/editar en formulario modal, eliminar con confirmación; CRUD completo de categorías.

---

## 4. App móvil (React Native + Expo)

1. Instalar **Expo Go** en el celular (Play Store / App Store).
2. Editar `mobile/src/config.js` y poner la IP del servidor:
   ```js
   export const DEFAULT_API_URL = 'http://192.168.1.10:3000';
   ```
   (También se puede cambiar desde la app con el botón ⚙.)
3. Ejecutar:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
4. Escanear el código QR con Expo Go (celular y PC en la misma Wi-Fi).

> **iPhone:** Expo Go pide tener sesión iniciada con la misma cuenta de Expo en el celular y en la PC.
> Si `npx expo login` falla, crear un *Access token* personal en expo.dev (Settings → Access tokens) y antes de iniciar ejecutar:
> `set EXPO_TOKEN=<token>` (Windows) y luego `npx expo start`. No subir el token al repositorio.

Funciones: lista de productos con búsqueda, tarjetas con categoría y stock, alta/edición en hoja inferior con selector de categoría, eliminación con confirmación, *pull-to-refresh*; CRUD completo de categorías.

---

## 5. Acceso desde la red local — checklist

1. Todos los dispositivos en la **misma red** (Wi-Fi o LAN).
2. Obtener la IP del servidor: `ipconfig` (Windows) → *Dirección IPv4*.
3. Permitir los puertos en el **Firewall de Windows** (PowerShell como administrador):
   ```powershell
   netsh advfirewall firewall add rule name="Ferreteria API" dir=in action=allow protocol=TCP localport=3000
   netsh advfirewall firewall add rule name="Ferreteria Web" dir=in action=allow protocol=TCP localport=5173
   ```
4. Probar desde otro equipo: `http://IP_DEL_SERVIDOR:3000/api/productos` en el navegador.
5. Si la red es la Wi-Fi de la universidad y bloquea conexiones entre equipos, usar el **hotspot de un celular**.

---

## 6. División del trabajo

| Integrante | Responsabilidades |
|---|---|
| **Compañero (nombre)** | Base de datos MySQL, API RESTful (Node + Express), colección de Postman |
| **David Bustos** | Frontend web (React), app móvil (React Native / Expo) |

Ambos: pruebas integradas en red local y documentación.
