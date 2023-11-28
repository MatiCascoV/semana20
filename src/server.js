require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));



// Ruta por defecto, redirige a la página de inicio de sesión
app.get('/', (req, res) => {
    res.redirect('/login');
  });
  
  // Ruta para la página de registro
  app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html', 'registro.html'));
  });
  
  // Ruta  de inicio de sesión
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html', 'login.html'));
  });
  
  // Ruta de inicio 
  app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html', 'inicio.html'));
  });
  


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'usuarios',
  connectionLimit: 50,
});

// Test de conexión
pool.getConnection()
.then(connection => {
    console.log('Conexión a la base de datos establecida con éxito');
    connection.release();
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error.message);
  });

  const bcrypt = require('bcrypt');

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await pool.query('SELECT * FROM usuarios WHERE username = ? OR email = ?', [username, email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'El usuario o el correo electrónico ya están registrados.' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario en la base de datos
    await pool.query('INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

    res.status(201).json({ message: 'Usuario registrado correctamente.' });
  } catch (error) {
    console.error('Error en el registro:', error.message);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos.' });
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos.' });
    }

    // Generar un token de autenticación
    const token = jwt.sign({ userId: user[0].id, username: user[0].username }, 'tu_secreto_secreto', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.message);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});




