require('dotenv').config();
const express = require('express');
const sequelize = require('./config/db');
const countryRoutes = require('./routes/countryRoutes');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Ensure cache dir
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// Routes
app.get('/status', require('./controllers/countryController').getStatus);
app.use('/countries', countryRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start
async function start() {
  try {
    await sequelize.sync();
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
  }
}

start();