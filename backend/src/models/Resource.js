// Resource.js
import { Schema, model } from 'mongoose';

const resourceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: '',
      trim: true
    },
    fileType: {
      type: String,
      default: '',
      trim: true
    },
    fileSize: {
      type: String,
      default: '',
      trim: true
    },
    url: {
      type: String,
      default: '#'
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default model('Resource', resourceSchema);