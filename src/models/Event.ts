import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  activity: string;
  skillLevel: string;
  creator: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: number[];
    address: string;
    city: string;
  };
  dateTime: Date;
  duration: number; // in minutes
  maxParticipants: number;
  participants: mongoose.Types.ObjectId[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    activity: {
      type: String,
      required: [true, 'Please select an activity'],
      enum: ['running', 'cycling', 'gym', 'yoga', 'swimming', 'hiking', 'tennis', 'basketball', 'football', 'volleyball', 'skiing', 'other'],
    },
    skillLevel: {
      type: String,
      required: [true, 'Please select a skill level'],
      enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    },
    creator: {
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
        required: true,
        index: '2dsphere',
      },
      address: {
        type: String,
        required: [true, 'Please provide an address'],
      },
      city: {
        type: String,
        required: [true, 'Please provide a city'],
      },
    },
    dateTime: {
      type: Date,
      required: [true, 'Please provide a date and time'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide a duration'],
      min: [15, 'Duration must be at least 15 minutes'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Please provide a maximum number of participants'],
      min: [2, 'At least 2 participants are required'],
      max: [100, 'Maximum 100 participants allowed'],
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
