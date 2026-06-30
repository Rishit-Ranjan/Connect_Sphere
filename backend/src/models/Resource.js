// Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);