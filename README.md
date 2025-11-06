
# MVP de explorador de grafos

## Descripción
PathFinder es un MVP que permite:

- Autenticar usuarios con JWT.
- Crear, listar y eliminar nodos y aristas en un grafo persistido en SQLite.
- Ejecutar BFS y Dijkstra para explorar rutas.
- Consumir la API desde un frontend React protegido con sesión (token).


## Requisitos

- Python 3.11+
- Node.js 18+ y npm
- Git
- jq (opcional, para pruebas con curl)


## Variables de entorno (.env)

```bash
JWT_SECRET=CLAVEGRUPO5
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRES_MINUTES=60
SQLITE_URL=sqlite:///app.db
CORS_ORIGINS=http://localhost:5173
```

## Backend — FastAPI + SQLite

### 1. Crear y activar entorno virtual

```bash
source backend/.venv/bin/activate
```

### 2. Instalar dependencias

```bash
pip install -r backend/requirements.txt
```

### 4. Cargar dataset inicial

```bash
python -m backend.scripts.load_seed
```

> Esto poblará la base de datos a partir de `nodes.csv` y `edges.csv`.


### 5. Ejecutar servidor

```bash
uvicorn backend.app.main:app --reload
```

### 6. Reiniciar base de datos (opcional)

```bash
rm backend/app.db
python -m backend.scripts.load_seed
uvicorn backend.app.main:app --reload
```

---

## Frontend — React + Vite

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Ejecutar aplicación

```bash
npm run dev
```

> Por defecto corre en `http://localhost:5173`.

---

## Pasos de prueba / comandos manuales

### Registro de usuario

```bash
curl -X POST http://localhost:8000/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"demo","password":"1234"}'
```

### Login y obtener token

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=demo&password=1234" | jq -r .access_token)
```

### Perfil

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/auth/me
```

### Crear nodo

```bash
curl -X POST http://localhost:8000/graph/nodes \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{"name":"Cali"}'
```

### Crear arista

```bash
curl -X POST http://localhost:8000/graph/edges \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{"src_id":1,"dst_id":2,"weight":28}'
```

### Ejecutar BFS

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/graph/bfs?start_id=1"
```

### Ejecutar Dijkstra

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/graph/shortest-path?src_id=1&dst_id=3"
```

### Video demo
[Demo API web](https://www.youtube.com/watch?v=SX_t4n9__Xc)

Decisiones técnicas

Backend protegido con JWT y contraseña hasheada con `bcrypt`.
Base de datos SQLite por simplicidad para MVP.
Grafo implementado con nodos/aristas y algoritmos BFS y Dijkstra.
Frontend React con Vite y visualización de grafos usando `react-force-graph`.
Uso de `.env` para configuraciones sensibles.


Limitaciones

 No se soporta multiusuario simultáneo avanzado (SQLite tiene limitaciones de concurrencia).
 Interfaz gráfica básica, enfocada en funcionalidad.
 No se incluyen pruebas automatizadas (opcional para extensión).

 Mejoras posibles

 Integrar exportación del árbol BFS a JSON/CSV.
 Agregar tests unitarios y de integración.
 Mejorar UI con visualización interactiva del grafo.
 Permitir grafo no dirigido configurable.
 Implementar refresco automático de tokens JWT.
