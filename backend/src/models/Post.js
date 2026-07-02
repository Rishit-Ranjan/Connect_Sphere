import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    imageUrl: {
      type: String,
      default: ''
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema]
  },
  { timestamps: true }
);

export default model('Post', postSchema);