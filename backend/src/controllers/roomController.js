// controllers/roomController.js
import pkg from 'bcryptjs';
import Room from '../models/Room.js';
import RoomMessage from '../models/RoomMessage.js';

const { hash, compare } = pkg;

const normalizeRoom = (room) => ({
  id: room._id,
  name: room.name,
  description: room.description,
  visibility: room.visibility || 'public',
  isPrivate: (room.visibility || 'public') === 'private',
  createdBy: room.createdBy ? room.createdBy.toString() : null,
  createdAt: room.createdAt
});

const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ createdAt: 1 });

    res.json(rooms.map(normalizeRoom));
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { name, description, visibility, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Room name is required.' });
    }

    const cleanVisibility = visibility === 'private' ? 'private' : 'public';

    // Private rooms require a password to create.
    if (cleanVisibility === 'private' && (!password || !password.trim())) {
      return res.status(400).json({ message: 'Private rooms require a password.' });
    }

    const room = await Room.create({
      name: name.trim(),
      description: description?.trim() || '',
      visibility: cleanVisibility,
      createdBy: req.user._id,
      passwordHash: cleanVisibility === 'private' ? await hash(password.trim(), 10) : ''
    });

    res.status(201).json(normalizeRoom(room));
  } catch (error) {
    next(error);
  }
};

// Verify a private room's password. Returns 200 + { ok: true } on success.
const verifyRoomPassword = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await Room.findById(roomId).select('+passwordHash');

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    if ((room.visibility || 'public') !== 'private') {
      return res.json({ ok: true, message: 'Room is public.' });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ message: 'Password is required to join this private room.' });
    }

    const isMatch = await compare(password.trim(), room.passwordHash || '');
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect room password.' });
    }

    res.json({ ok: true, message: 'Password verified.' });
  } catch (error) {
    next(error);
  }
};

// Admins can delete any room; other users can delete rooms they created.
// Rooms created before ownership tracking (createdBy == null) are orphaned and
// can be removed by any authenticated user. Deleting cascades to messages.
const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isCreator = Boolean(
      room.createdBy && room.createdBy.toString() === req.user._id.toString()
    );
    const isOrphan = !room.createdBy;

    if (!isAdmin && !isCreator && !isOrphan) {
      return res.status(403).json({
        message: 'Only an admin or the room creator can delete this room.'
      });
    }

    await RoomMessage.deleteMany({ roomId: room._id });
    await Room.findByIdAndDelete(room._id);

    res.json({ message: 'Room deleted successfully.', id: roomId });
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

export default {
  getRooms,
  createRoom,
  verifyRoomPassword,
  deleteRoom,
  getRoomMessages,
  createRoomMessage
};