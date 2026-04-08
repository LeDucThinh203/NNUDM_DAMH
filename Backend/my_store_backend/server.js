import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { existsSync, mkdirSync } from 'fs';

import uiRoutes from './routes/ui.js'; // gom tất cả route
import { initChatSocket } from './socket/chatSocket.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);

// --- Middleware ---
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    let normalizedOrigin = String(origin || '').trim();
    try {
      if (normalizedOrigin) {
        normalizedOrigin = new URL(normalizedOrigin).origin;
      }
    } catch {
      normalizedOrigin = normalizedOrigin.replace(/\/$/, '');
    }

    const allowedOrigins = new Set([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3006',
      'http://127.0.0.1:3006'
    ]);
    const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);

    // Cho phép server-to-server hoặc curl không gửi Origin.
    if (!origin || allowedOrigins.has(normalizedOrigin) || isLocalDevOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Mount tất cả route ---
app.use('/', uiRoutes);

// --- Server config ---
const PORT = process.env.PORT || 3006;
const SERVER_URL = process.env.USE_NGROK === 'true' && process.env.NGROK_URL
  ? process.env.NGROK_URL
  : `http://localhost:${PORT}`;

// --- Swagger setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, 'uploads');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', (req, res, next) => {
  if (req.query?.download === '1') {
    const fileName = String(req.path || '').split('/').pop() || 'download-file';
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  }
  next();
});
app.use('/uploads', express.static(uploadDir));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Store API",
      version: "1.0.0",
      description: "API CRUD cho database my_store với JWT Authentication",
    },
    servers: [{ url: SERVER_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token vào đây (không cần thêm "Bearer ")'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [join(__dirname, 'routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Root route ---
app.get('/', (req, res) => {
  res.send(`
    <h2>My Store API is running</h2>
    <p>Swagger UI available at <a href="/swagger">${SERVER_URL}/swagger</a></p>
  `);
});

// --- Health check endpoint for Render ---
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Config endpoint để frontend lấy API URL động ---
app.get('/api/config', (req, res) => {
  res.json({ 
    apiUrl: SERVER_URL,
    useNgrok: process.env.USE_NGROK === 'true',
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Start server ---
initChatSocket(httpServer);

// --- Error handler ---
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File vượt quá kích thước cho phép (25MB)' });
    }

    return res.status(400).json({ error: err.message || 'Upload file không hợp lệ' });
  }

  if (err?.message?.startsWith('CORS blocked for origin:')) {
    return res.status(403).json({ error: err.message });
  }

  if (err) {
    return res.status(500).json({ error: err.message || 'Lỗi máy chủ' });
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔗 Swagger UI: ${SERVER_URL}/swagger`);
});





