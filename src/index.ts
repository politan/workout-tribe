import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/database';
import swaggerDocs from './config/swagger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
// Using require instead of import to avoid TypeScript module resolution issues
const userRoutes = require('./routes/userRoutes').default;
const workoutRoutes = require('./routes/workoutRoutes').default;
const eventRoutes = require('./routes/eventRoutes').default;

// Apply routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/events', eventRoutes);

// Home route
app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'Workout Tribe - Find Your Fitness Crew!' });
});

// Initialize Swagger documentation
swaggerDocs(app, Number(PORT));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
