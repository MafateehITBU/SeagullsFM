import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import cookieParser from "cookie-parser";

// Import routes
import superAdminRoutes from './routes/superAdmin.js';
import channelRoutes from './routes/channel.js';
import adminRoutes from './routes/admin.js';
import newsRoutes from './routes/news.js';
import advertisementRoutes from './routes/advertisement.js';
import eventRoutes from './routes/event.js';
import interviewApplicantRoutes from './routes/interviewApplicant.js';
import competitionRoutes from './routes/competition.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser middleware
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SeagullsFM API' });
});

// API Routes
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/channel', channelRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/news', newsRoutes);  
app.use('/api/ad', advertisementRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/interview-applicant', interviewApplicantRoutes);
app.use('/api/competition', competitionRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

