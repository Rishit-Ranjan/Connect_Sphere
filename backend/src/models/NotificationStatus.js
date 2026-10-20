import { Schema, model } from 'mongoose';

const notificationStatusSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notificationId: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    dismissed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

notificationStatusSchema.index({ user: 1, notificationId: 1 }, { unique: true });

export default model('NotificationStatus', notificationStatusSchema);
