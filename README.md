# Proyecto Web: Sistema UNSC con Zona de Comando

Este proyecto cumple los requerimientos solicitados para una aplicación web completa.

## 1) Web Application

- **Frontend**: HTML, CSS y JavaScript en `frontend/`.
- **Backend**: Node.js + Express en `backend/app.js`.
- **Base de datos**: MongoDB (contenedor `mongo` en Docker Compose).

## 2) Estructura

- No es un "Administrador de tareas".
- Implementado como **Sistema UNSC con Zona de Comando**.

## 3) Flujo de Usuario

### Página de Inicio (`index.html`)
- Solo dos botones:
  - Crear Cuenta
  - Iniciar Sesión

### Dashboard (`dashboard.html`)
- **Contenido Principal**:
  - Bienvenida del usuario
  - Biblioteca UNSC (visible siempre):
    - Información UNSC
    - Qué es un Spartan
    - Armas de la humanidad
    - Rangos de la UNSC
    - Amenazas (Desterrados, Covenant, Flood)
  - Cargas de información a la biblioteca

- **Zona de Comando** (botón en panel de Cuenta):
  - Accesible solo cuando inicias sesión
  - Gestor de Misiones:
    - Crear misiones
    - Estados: Pendiente, En Progreso, Completada
    - Prioridades: Baja, Media, Alta
    - Actualizar estado de misiones
    - Eliminar misiones

## 4) Endpoints API

### Misiones
- `GET /misiones` - Listar todas las misiones
- `POST /misiones` - Crear nueva misión
- `PUT /misiones/:id` - Actualizar estado de misión
- `DELETE /misiones/:id` - Eliminar misión

### Secciones
- `GET /section-info` - Obtener información de biblioteca
- `POST /section-info` - Agregar información
- `PUT /section-info/:id` - Editar información
- `DELETE /section-info/:id` - Eliminar información

### Usuarios
- `POST /register` - Registro
- `POST /login` - Login
- `PUT /account/update` - Actualizar cuenta

## 5) Ejecución

```bash
docker compose up --build
```

Accesos:
- Frontend: `http://localhost:8080`
- API Backend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## 6) Base de Datos

Todo se guarda en MongoDB:
- **Usuarios**: Credenciales y avatares
- **Seción Info**: Información de la biblioteca UNSC
- **Misiones**: Reportes y tareas militares
- **Logs**: Historial de operaciones
