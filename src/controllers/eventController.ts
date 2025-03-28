import { Request, Response } from 'express';
import Event from '../models/Event';
import mongoose from 'mongoose';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, date, location, maxParticipants, workoutType } = req.body;

    const event = await Event.create({
      creator: req.user.id,
      title,
      description,
      date,
      location,
      maxParticipants,
      workoutType
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find()
      .populate('creator', 'name')
      .populate('participants', 'name')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants', 'name email');

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid event ID' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Creator only)
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      description, 
      activity,
      skillLevel,
      location,
      dateTime,
      duration,
      maxParticipants,
      status
    } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.activity = activity || event.activity;
    event.skillLevel = skillLevel || event.skillLevel;
    
    // Update location if provided
    if (location) {
      event.location.coordinates = location.coordinates || event.location.coordinates;
      event.location.address = location.address || event.location.address;
      event.location.city = location.city || event.location.city;
    }
    
    event.dateTime = dateTime || event.dateTime;
    event.duration = duration || event.duration;
    event.maxParticipants = maxParticipants || event.maxParticipants;
    
    // Only update status if provided and valid
    if (status && ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      event.status = status;
    }

    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid event ID' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Creator only)
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    await event.deleteOne();

    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid event ID' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join an event
// @route   POST /api/events/:id/join
// @access  Private
export const joinEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      res.status(400).json({ message: 'Event is full' });
      return;
    }

    // Check if user is already a participant
    if (event.participants.includes(req.user.id)) {
      res.status(400).json({ message: 'Already joined this event' });
      return;
    }

    // Add user to participants
    event.participants.push(req.user.id);
    await event.save();

    res.json(event);
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid event ID' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave an event
// @route   POST /api/events/:id/leave
// @access  Private
export const leaveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Check if user is a participant
    if (!event.participants.includes(req.user.id)) {
      res.status(400).json({ message: 'Not a participant of this event' });
      return;
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      (participantId) => participantId.toString() !== req.user.id
    );
    
    await event.save();

    res.json(event);
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid event ID' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};