import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkout extends Document {
  title: string;
  description: string;
  activity: string;
  duration: number; // in minutes
  intensity: string;
  user: mongoose.Types.ObjectId;
  location?: {
    type: string;
    coordinates: number[];
    address?: string;
    city?: string;
  };
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workoutSchema = new Schema<IWorkout>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a workout title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a workout description'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    activity: {
      type: String,
      required: [true, 'Please select an activity'],
      enum: ['running', 'cycling', 'gym', 'yoga', 'swimming', 'hiking', 'tennis', 'basketball', 'football', 'volleyball', 'skiing', 'other'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide a duration'],
      min: [5, 'Duration must be at least 5 minutes'],
    },
    intensity: {
      type: String,
      required: [true, 'Please select an intensity level'],
      enum: ['low', 'medium', 'high', 'very_high'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      address: String,
      city: String,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
  },
  { timestamps: true }
);

// Index for geospatial queries if location is provided
workoutSchema.index({ 'location.coordinates': '2dsphere' });

const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);

export default Workout;
