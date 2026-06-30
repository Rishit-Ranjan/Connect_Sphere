// controllers/roomController.js
const Room = require('../models/Room');
const RoomMessage = require('../models/RoomMessage');

const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ createdAt: 1 });

    const normalizedRooms = rooms.map((room) => ({
      id: room._id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt
    }));

    res.json(normalizedRooms);
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Room name is required.' });
    }

    const room = await Room.create({
      name: name.trim(),
      description: description?.trim() || ''
    });

    res.status(201).json({
      id: room._id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt
    });
  } catch (error) {
    next(error);
  }
};

const getRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const messages = await RoomMessage.find({ roomId })
      .populate('sender', 'name handle avatarUrl role bio department email')
      .sort({ createdAt: 1 });

    const normalizedMessages = messages.map((msg) => ({
      id: msg._id,
      roomId: msg.roomId,
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt
    }));

    res.json(normalizedMessages);
  } catch (error) {
    next(error);
  }
};

const createRoomMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const message = await RoomMessage.create({
      roomId,
      sender: req.user._id,
      text: text.trim()
    });

    const populatedMessage = await RoomMessage.findById(message._id)
      .populate('sender', 'name handle avatarUrl role bio department email');

    res.status(201).json({
      id: populatedMessage._id,
      roomId: populatedMessage.roomId,
      sender: populatedMessage.sender,
      text: populatedMessage.text,
      createdAt: populatedMessage.createdAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  createRoom,
  getRoomMessages,
  createRoomMessage
};