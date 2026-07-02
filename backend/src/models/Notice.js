
import { Schema, model } from 'mongoose';

const noticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    isUrgent: {
      type: Boolean,
      default: false
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default model('Notice', noticeSchema);