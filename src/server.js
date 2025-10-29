require('dotenv').config();
const express = require('express');
const countryRoutes = require('./routes/countryRoutes');
const sequelize = require('./config/db');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use('/countries', countryRoutes);
app.use('/status',  require('./controllers/countryController').getStatus);

// Create cache directory
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// Start server with DB sync
async function startServer() {
  try {
    console.log('Connecting to database...');
    await sequelize.sync({ force: true });  // ← Remove after first deploy
    console.log('Database synced');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();