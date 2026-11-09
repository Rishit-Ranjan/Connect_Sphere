// models/DirectMessage.js
import { Schema, model } from 'mongoose';

const directMessageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      default: '',
      trim: true
    },
    attachment: {
      filename: { type: String, default: '' },
      originalName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export default model('DirectMessage', directMessageSchema);