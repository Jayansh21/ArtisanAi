import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Request, Response } from 'express'; // ADD THIS LINE
import { connectDB } from './config/database';
import marketRoutes from './routes/market';
import contactRoutes from './routes/contacts';
import automationRoutes from './routes/automation';
import storytellingRoutes from './routes/storytelling';
import authRoutes from './routes/auth';
import { handleUploadErrors } from './middleware/fileUpload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection will be awaited during server startup

// Middleware
// Configure CORS first to ensure preflight succeeds
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
// Explicitly enable preflight for all routes
app.options('*', cors(corsOptions));

// Security headers after CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow file uploads
  crossOriginEmbedderPolicy: false // Disable for Google Cloud APIs
}));

app.use(morgan('combined'));

// Increase payload limits for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      speechToText: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'configured' : 'not configured',
      translation: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'configured' : 'not configured'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/storytelling', storytellingRoutes);

// ADD THIS NEW ROUTE - Direct translation endpoint (matches frontend expectation)
app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: text and targetLanguage'
      });
    }

    // Import Google Cloud Translation
    const { Translate } = require('@google-cloud/translate').v2;
    const translate = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'central-rig-415910'
    });

    // Perform translation
    const [translation] = await translate.translate(text, targetLanguage);
    
    res.json({
      success: true,
      originalText: text,
      translatedText: translation,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Translation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// File upload error handling middleware
app.use(handleUploadErrors);

// Global error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation Error', details: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format', details: err.message });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate entry', details: 'Resource already exists' });
  }

  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Start server with error handling
const startServer = async () => {
  try {
    // Ensure DB is connected before starting server when bufferCommands=false
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 ArtisanAI Backend running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth API available at http://localhost:${PORT}/api/auth`);
      console.log(`🎤 Storytelling API available at http://localhost:${PORT}/api/storytelling`);
      console.log(`🌐 Translation API available at http://localhost:${PORT}/api/translate`);
      
      if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.log(`☁️ Google Cloud services configured for project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
      } else {
        console.log(`⚠️ Google Cloud services not configured. Set GOOGLE_CLOUD_PROJECT_ID to enable speech-to-text and translation features.`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();