import express from 'express';
import { 
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent
} from '../controllers/eventController';
import { protect, isCreator } from '../middleware/auth';
import Event from '../models/Event';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', protect, createEvent);
router.put('/:id', protect, isCreator(Event), updateEvent);
router.delete('/:id', protect, isCreator(Event), deleteEvent);
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);

export default router;
