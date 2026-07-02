// controllers/directMessageController.js
import DirectMessage from '../models/DirectMessage.js';

const getDirectMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await DirectMessage.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: 1 });

    const normalizedMessages = messages.map((msg) => ({
      id: msg._id,
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),
      text: msg.text,
      createdAt: msg.createdAt
    }));

    res.json(normalizedMessages);
  } catch (error) {
    next(error);
  }
};

const createDirectMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver is required.' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const message = await DirectMessage.create({
      senderId: req.user._id,
      receiverId,
      text: text.trim()
    });

    res.status(201).json({
      id: message._id,
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      text: message.text,
      createdAt: message.createdAt
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDirectMessages,
  createDirectMessage
};