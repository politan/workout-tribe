import { Request, Response } from 'express';
import Workout, { IWorkout } from '../models/Workout';

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
export const createWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      activity,
      duration,
      intensity,
      location,
      date,
      notes
    } = req.body;

    // Create new workout
    const workout = await Workout.create({
      title,
      description,
      activity,
      duration,
      intensity,
      user: req.user._id,
      location,
      date: date || new Date(),
      notes
    });

    res.status(201).json({
      success: true,
      workout,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all workouts for logged in user
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      activity, 
      startDate,
      endDate,
      sort = '-date'
    } = req.query;

    let query: any = { user: req.user._id };

    // Filter by activity
    if (activity) {
      query.activity = activity;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }

    const workouts = await Workout.find(query)
      .sort(sort as string);

    res.status(200).json({
      success: true,
      count: workouts.length,
      workouts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
// @access  Private
export const getWorkoutById = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    // Check if workout belongs to user
    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to access this workout' });
      return;
    }

    res.status(200).json({
      success: true,
      workout,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    // Check if workout belongs to user
    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this workout' });
      return;
    }

    // Update workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      workout: updatedWorkout,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    // Check if workout belongs to user
    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this workout' });
      return;
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workout removed',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
