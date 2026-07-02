import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    department: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

export default model('User', userSchema);