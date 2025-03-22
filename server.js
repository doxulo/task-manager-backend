const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { registerUser, loginUser, verifyToken } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // React app's origin
        methods: ['GET', 'POST'],
    },
});

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Example database query (test connection):
app.get('/test', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error ' + err);
    }
});

// Add user registration and login routes
app.post('/register', registerUser);
app.post('/login', loginUser);
app.post('/verifyToken', verifyToken); // Ensure this route is correctly defined

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
