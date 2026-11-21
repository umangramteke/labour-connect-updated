require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const seedDatabase = require('./config/seedData');
const ApiResponse = require('./utils/apiResponse');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const providerRoutes = require('./routes/providerRoutes');
const workerRoutes = require('./routes/workerRoutes');
const profileRoutes = require('./routes/profileRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const skillRoutes = require('./routes/skillRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8081;

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));

const corsOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all dev origins cleanly
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoints matching Spring RootHealthController
const healthHandler = (req, res) => {
  return res.status(200).json(
    ApiResponse.ok(
      {
        status: 'UP',
        service: 'Labour Connect Backend Platform (Node.js/Express + MongoDB)',
        version: '1.0.0',
        serverTime: new Date().toISOString(),
        database: 'MongoDB',
        apiBasePath: '/api/v1'
      },
      'Labour Connect API v1 is active and healthy.'
    )
  );
};

app.get(['/', '/api', '/api/v1', '/api/v1/health'], healthHandler);

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/requests', serviceRequestRoutes);
app.use('/api/v1/services/providers', providerRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler for unknown routes under /api
app.use('/api/*', (req, res) => {
  res.status(404).json(ApiResponse.error(`Route '${req.originalUrl}' not found.`));
});

// Centralized Error Handler
app.use(errorHandler);

// Start server function
async function startServer() {
  await connectDB();

  if (process.env.SEED_DATA !== 'false') {
    try {
      await seedDatabase();
    } catch (e) {
      console.error('[Seed Error]', e);
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Labour Connect Backend (Node.js + Express + MongoDB)`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`🍃 Connected to MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/labour_connect'}`);
    console.log(`======================================================\n`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
