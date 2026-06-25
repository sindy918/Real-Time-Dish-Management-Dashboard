const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

// Configure CORS to allow communication from frontend development servers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Express endpoints
// 1. GET all dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dishes ORDER BY dish_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. PATCH toggle is_published status
app.patch('/api/dishes/:dishId/toggle', async (req, res) => {
  const { dishId } = req.params;
  try {
    const result = await pool.query(
      'UPDATE dishes SET is_published = NOT is_published WHERE dish_id = $1 RETURNING *',
      [dishId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const updatedDish = result.rows[0];
    console.log(`Dish status updated: ${updatedDish.dish_id} is_published = ${updatedDish.is_published}`);

    // Emit Socket.io real-time update to all connected clients
    io.emit('dishUpdated', updatedDish);

    res.json(updatedDish);
  } catch (err) {
    console.error('Error toggling dish status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.io connection setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
