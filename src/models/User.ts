import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  location: {
    type: string;
    coordinates: number[];
    address?: string;
    city?: string;
  };
  preferences: {
    activities: string[];
    skillLevel: string;
    availability: string[];
    ageRange?: string;
    gender?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    profilePicture: {
      type: String,
      default: 'default-profile.jpg',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
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
      address: String,
      city: String,
    },
    preferences: {
      activities: {
        type: [String],
        required: [true, 'Please select at least one activity'],
        enum: ['running', 'cycling', 'gym', 'yoga', 'swimming', 'hiking', 'tennis', 'basketball', 'football', 'volleyball', 'skiing', 'other'],
      },
      skillLevel: {
        type: String,
        required: [true, 'Please select your skill level'],
        enum: ['beginner', 'intermediate', 'advanced', 'professional'],
      },
      availability: {
        type: [String],
        required: [true, 'Please select your availability'],
        enum: ['weekday_morning', 'weekday_afternoon', 'weekday_evening', 'weekend_morning', 'weekend_afternoon', 'weekend_evening'],
      },
      ageRange: {
        type: String,
        enum: ['18-25', '26-35', '36-45', '46-55', '56+'],
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'prefer_not_to_say'],
      },
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
