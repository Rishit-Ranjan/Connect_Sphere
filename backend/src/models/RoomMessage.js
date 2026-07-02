// models/RoomMessage.js
import { Schema, model } from 'mongoose';

const roomMessageSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    sender: {
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

export default model('RoomMessage', roomMessageSchema);