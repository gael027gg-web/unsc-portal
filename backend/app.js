const express = require('express');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// --- Crear carpeta de logs si no existe ---
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// --- Conexión a Mongo ---
mongoose.connect('mongodb://mongo:27017/unsc')
    .then(() => console.log("✅ Conectado al MongoDB de Docker (UNSC Network)"))
    .catch(err => console.error("❌ Error de conexión:", err.message));

// --- Modelos ---
const User = mongoose.model('User', {
    username: String,
    password: String,
    avatar: String
});

const Post = mongoose.model('Post', {
    content: String,
    username: String
});

const SectionInfo = mongoose.model('SectionInfo', {
    section: String,
    content: String,
    createdBy: String,
    createdAt: { type: Date, default: Date.now },
    updatedBy: String,
    updatedAt: Date
});

const Mision = mongoose.model('Mision', {
    nombre: String,
    descripcion: String,
    estado: {
        type: String,
        enum: ['pendiente', 'en-progreso', 'completada'],
        default: 'pendiente'
    },
    prioridad: {
        type: String,
        enum: ['baja', 'media', 'alta'],
        default: 'media'
    },
    asignadoA: String,
    createdBy: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// --- Función de log ---
function log(message) {
    const pathLog = `${logDir}/app.log`;
    fs.appendFileSync(pathLog, `[${new Date().toISOString()}] ${message}\n`);
}

// --- Rutas ---
// Registro
app.post('/register', async (req, res) => {
    const { username, password, avatar } = req.body;
    try {
        const exist = await User.findOne({ username });
        if (exist) return res.json({ message: "Usuario ya existe" });

        const newUser = new User({ username, password, avatar });
        await newUser.save();

        log("Usuario registrado: " + username);
        res.json({ message: "Usuario creado" });
    } catch (error) {
        res.status(500).json({ message: "Error en registro" });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.json({ message: "Usuario no existe" });
        if (user.password !== password) return res.json({ message: "Contraseña incorrecta" });

        log("Login exitoso: " + username);
        res.json({
            message: "Bienvenido " + username,
            username: user.username,
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({ message: "Error en login" });
    }
});

// Actualizar cuenta
app.put('/account/update', async (req, res) => {
    const {
        currentUsername,
        currentPassword,
        newUsername,
        newPassword,
        newAvatar
    } = req.body;

    if (!currentUsername || !currentPassword) {
        return res.status(400).json({ message: 'Usuario y contraseña actuales son obligatorios' });
    }

    try {
        const user = await User.findOne({ username: currentUsername });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no existe' });
        }

        if (user.password !== currentPassword) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        if (newUsername && newUsername !== currentUsername) {
            const existing = await User.findOne({ username: newUsername });
            if (existing) {
                return res.status(409).json({ message: 'El nuevo nombre de usuario ya existe' });
            }
        }

        const previousUsername = user.username;

        if (newUsername) {
            user.username = newUsername;
        }
        if (newPassword) {
            user.password = newPassword;
        }
        if (newAvatar) {
            user.avatar = newAvatar;
        }

        await user.save();

        if (newUsername && newUsername !== previousUsername) {
            await Post.updateMany({ username: previousUsername }, { $set: { username: newUsername } });
            await SectionInfo.updateMany({ createdBy: previousUsername }, { $set: { createdBy: newUsername } });
            await SectionInfo.updateMany({ updatedBy: previousUsername }, { $set: { updatedBy: newUsername } });
        }

        log('Cuenta actualizada: ' + previousUsername + ' -> ' + user.username);
        res.json({
            message: 'Cuenta actualizada',
            user: {
                username: user.username,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cuenta' });
    }
});

// Posts
app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

app.post('/posts', async (req, res) => {
    const { content, username } = req.body;
    try {
        const newPost = new Post({ content, username });
        await newPost.save();

        log("Post creado por " + username);
        res.json({ message: "Post guardado" });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar post" });
    }
});

// Info del dashboard por secciones
app.get('/section-info', async (req, res) => {
    try {
        const info = await SectionInfo.find().sort({ createdAt: 1, _id: 1 });
        res.json(info);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener informacion de secciones' });
    }
});

app.post('/section-info', async (req, res) => {
    const { section, content, username } = req.body;

    if (!section || !content) {
        return res.status(400).json({ message: 'Seccion y contenido son obligatorios' });
    }

    try {
        const created = new SectionInfo({
            section,
            content,
            createdBy: username || 'desconocido'
        });
        await created.save();

        log('Seccion agregada: ' + section + ' por ' + (username || 'desconocido'));
        res.json({ message: 'Informacion guardada', data: created });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar informacion de seccion' });
    }
});

app.delete('/section-info/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try {
        const entry = await SectionInfo.findById(id);

        if (!entry) {
            return res.status(404).json({ message: 'La informacion no existe' });
        }

        const owner = entry.createdBy || entry.updatedBy || 'desconocido';
        if (owner !== (username || 'desconocido')) {
            return res.status(403).json({ message: 'Solo el autor puede borrar esta informacion' });
        }

        await SectionInfo.deleteOne({ _id: id });
        log('Seccion eliminada: ' + entry.section + ' por ' + (username || 'desconocido'));
        res.json({ message: 'Informacion eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar informacion de seccion' });
    }
});

app.put('/section-info/:id', async (req, res) => {
    const { id } = req.params;
    const { username, content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Contenido obligatorio' });
    }

    try {
        const entry = await SectionInfo.findById(id);

        if (!entry) {
            return res.status(404).json({ message: 'La informacion no existe' });
        }

        const owner = entry.createdBy || entry.updatedBy || 'desconocido';
        if (owner !== (username || 'desconocido')) {
            return res.status(403).json({ message: 'Solo el autor puede editar esta informacion' });
        }

        entry.content = content;
        if (!entry.createdBy) {
            entry.createdBy = owner;
        }
        entry.updatedBy = username || owner;
        entry.updatedAt = new Date();
        await entry.save();

        log('Seccion editada: ' + entry.section + ' por ' + (username || 'desconocido'));
        res.json({ message: 'Informacion actualizada', data: entry });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar informacion de seccion' });
    }
});

// Zona de Comando - Misiones
app.get('/misiones', async (req, res) => {
    try {
        const misiones = await Mision.find().sort({ createdAt: -1, _id: -1 });
        res.json(misiones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener misiones' });
    }
});

app.post('/misiones', async (req, res) => {
    const { nombre, descripcion, estado, prioridad, asignadoA, createdBy } = req.body;

    if (!nombre || !descripcion) {
        return res.status(400).json({ message: 'Nombre y descripcion de mision son obligatorios' });
    }

    try {
        const mision = new Mision({
            nombre,
            descripcion,
            estado: ['pendiente', 'en-progreso', 'completada'].includes(estado) ? estado : 'pendiente',
            prioridad: ['baja', 'media', 'alta'].includes(prioridad) ? prioridad : 'media',
            asignadoA: asignadoA || 'no asignado',
            createdBy: createdBy || 'comandante'
        });

        await mision.save();
        log('Mision creada: ' + nombre + ' por ' + (createdBy || 'comandante'));
        res.status(201).json({ message: 'Mision registrada', data: mision });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear mision' });
    }
});

app.put('/misiones/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, estado, prioridad, asignadoA, username } = req.body;

    try {
        const mision = await Mision.findById(id);
        if (!mision) {
            return res.status(404).json({ message: 'Mision no encontrada' });
        }

        if (mision.createdBy !== (username || 'comandante')) {
            return res.status(403).json({ message: 'Solo el creador puede actualizar la mision' });
        }

        if (nombre) mision.nombre = nombre;
        if (descripcion) mision.descripcion = descripcion;
        if (estado && ['pendiente', 'en-progreso', 'completada'].includes(estado)) mision.estado = estado;
        if (prioridad && ['baja', 'media', 'alta'].includes(prioridad)) mision.prioridad = prioridad;
        if (asignadoA) mision.asignadoA = asignadoA;

        mision.updatedAt = new Date();
        await mision.save();

        log('Mision actualizada: ' + mision.nombre + ' por ' + (username || 'comandante'));
        res.json({ message: 'Mision actualizada', data: mision });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar mision' });
    }
});

app.delete('/misiones/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try {
        const mision = await Mision.findById(id);
        if (!mision) {
            return res.status(404).json({ message: 'Mision no encontrada' });
        }

        if (mision.createdBy !== (username || 'comandante')) {
            return res.status(403).json({ message: 'Solo el creador puede eliminar la mision' });
        }

        await Mision.deleteOne({ _id: id });
        log('Mision eliminada: ' + mision.nombre + ' por ' + (username || 'comandante'));
        res.json({ message: 'Mision eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar mision' });
    }
});

// Ver logs
app.get('/ver-logs', (req, res) => {
    try {
        const pathLog = `${logDir}/app.log`;
        if (fs.existsSync(pathLog)) {
            const contenido = fs.readFileSync(pathLog, 'utf8');
            res.send(contenido);
        } else {
            res.send("No hay registros todavía.");
        }
    } catch (error) {
        res.status(500).send("Error al leer logs");
    }
});

// --- Servidor ---
app.listen(3000, () => console.log("🚀 Servidor en puerto 3000 activo"));
