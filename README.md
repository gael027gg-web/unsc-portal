# 🎖️ UNSC Recruitment & Intelligence Hub

## 📝 Descripción del Proyecto
Este proyecto es una plataforma web integral para la gestión de reclutamiento y visualización de inteligencia de la UNSC. Está pensada como una aplicación completa con frontend, backend y base de datos, y utiliza contenedores para facilitar el despliegue local y en AWS.

## 🏗️ Arquitectura del Sistema
La aplicación sigue un modelo de tres capas:

1. **Frontend:** interfaz web basada en HTML, CSS y JavaScript servida con Nginx.
2. **Backend:** API REST construida en Node.js y Express.
3. **Base de datos:** persistencia de datos mediante MongoDB.

## 🔧 Servicios y Puertos

| Servicio | Puerto | Descripción |
| --- | ---: | --- |
| Frontend | 8080 | Interfaz de Reclutamiento |
| Backend | 3000 | API de Inteligencia |
| MongoDB | 27017 | Base de Datos de Spartans |
| SSH | 22 | Administración remota |

## 📌 Alcance Funcional
La aplicación no es un administrador de tareas genérico. Está organizada como un sistema UNSC con:

- **Página de inicio** con acceso a registro e inicio de sesión.
- **Dashboard** con biblioteca UNSC visible y panel de cuenta.
- **Zona de Comando** accesible después de iniciar sesión.
- **Gestor de misiones** con estados, prioridad y edición/eliminación.
- **Biblioteca de inteligencia** con información sobre Spartan, Desterrados, Covenant y Flood.

## 🛠️ Tecnologías Utilizadas
- **Cloud:** AWS (EC2, S3, CloudFormation)
- **Contenerización:** Docker y Docker Compose
- **Automatización:** Bash Scripting y Cron
- **Base de Datos:** MongoDB
- **Servidor Web:** Nginx
- **Backend:** Node.js + Express

## 🔌 API Principal

### Misiones
- `GET /misiones` - Listar todas las misiones
- `POST /misiones` - Crear nueva misión
- `PUT /misiones/:id` - Actualizar misión
- `DELETE /misiones/:id` - Eliminar misión

### Biblioteca UNSC
- `GET /section-info` - Obtener información de secciones
- `POST /section-info` - Agregar información
- `PUT /section-info/:id` - Editar información
- `DELETE /section-info/:id` - Eliminar información

### Usuarios
- `POST /register` - Registro
- `POST /login` - Inicio de sesión
- `PUT /account/update` - Actualizar cuenta

## 🚀 Instrucciones de Ejecución Local
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/gael027gg-web/unsc-portal.git
   ```
2. Iniciar contenedores:
   ```bash
   docker compose up -d
   ```

## ☁️ Despliegue en AWS EC2
Para desplegar en la nube, ejecute el orquestador de despliegue:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🗄️ Persistencia de Datos
Todo se guarda en MongoDB:

- **Usuarios**: credenciales y avatares
- **Biblioteca UNSC**: información de secciones
- **Misiones**: reportes y tareas militares
- **Logs**: historial de operaciones en el servidor

## 📍 Accesos
- Frontend: `http://localhost:8080`
- API Backend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`
