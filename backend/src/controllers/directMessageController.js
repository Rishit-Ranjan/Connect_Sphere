// controllers/directMessageController.js
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { isValidObjectId } from 'mongoose';
import DirectMessage from '../models/DirectMessage.js';
import { MESSAGE_MEDIA_DIR } from '../config/uploads.js';

const removeUploadedMedia = async (file) => {
  if (!file?.path) return;
  try {
    await unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const normalizeMessage = (message) => ({
  id: message._id,
  senderId: message.senderId.toString(),
  receiverId: message.receiverId.toString(),
  text: message.text || '',
  attachment: message.attachment?.filename
    ? {
        url: `/api/direct-messages/${message._id}/media`,
        filename: message.attachment.originalName,
        mimeType: message.attachment.mimeType,
        size: message.attachment.size
      }
    : null,
  createdAt: message.createdAt
});

const getDirectMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await DirectMessage.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: 1 });

    const normalizedMessages = messages.map(normalizeMessage);

    res.json(normalizedMessages);
  } catch (error) {
    next(error);
  }
};

const createDirectMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;
    const cleanText = typeof text === 'string' ? text.trim() : '';

    if (!receiverId) {
      await removeUploadedMedia(req.file);
      return res.status(400).json({ message: 'Receiver is required.' });
    }

    if (!cleanText && !req.file) {
      await removeUploadedMedia(req.file);
      return res.status(400).json({ message: 'Message text is required.' });
    }

    let message;
    try {
      const originalName = basename(req.file?.originalname || '')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .slice(0, 180);
      message = await DirectMessage.create({
        senderId: req.user._id,
        receiverId,
        text: cleanText,
        ...(req.file
          ? {
              attachment: {
                filename: req.file.filename,
                originalName: originalName || 'attachment',
                mimeType: req.file.mimetype,
                size: req.file.size
              }
            }
          : {})
      });
    } catch (error) {
      await removeUploadedMedia(req.file);
      throw error;
    }

    res.status(201).json(normalizeMessage(message));
  } catch (error) {
    next(error);
  }
};

const getDirectMessageMedia = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.messageId)) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    const message = await DirectMessage.findById(req.params.messageId);
    if (!message?.attachment?.filename) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    const userId = req.user._id.toString();
    if (
      message.senderId.toString() !== userId &&
      message.receiverId.toString() !== userId
    ) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    const filename = message.attachment.filename;
    if (!/^[a-f\d-]{36}\.[a-z\d]{1,10}$/i.test(filename) || basename(filename) !== filename) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.type(message.attachment.mimeType);
    res.sendFile(join(MESSAGE_MEDIA_DIR, filename), (error) => {
      if (error?.code === 'ENOENT') {
        if (!res.headersSent) res.status(404).json({ message: 'Attachment not found.' });
      } else if (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDirectMessages,
  createDirectMessage,
  getDirectMessageMedia
};