const Notice = require('../models/Notice');

const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('author', 'name handle avatarUrl role')
      .sort({ createdAt: -1 });

    const normalized = notices.map((notice) => ({
      id: notice._id,
      title: notice.title,
      message: notice.message,
      isUrgent: notice.isUrgent,
      createdAt: notice.createdAt,
      author: notice.author
    }));

    res.json(normalized);
  } catch (error) {
    next(error);
  }
};

const createNotice = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const { title, message, isUrgent } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      message: message.trim(),
      isUrgent: !!isUrgent,
      author: req.user._id
    });

    const populated = await Notice.findById(notice._id)
      .populate('author', 'name handle avatarUrl role');

    res.status(201).json({
      id: populated._id,
      title: populated.title,
      message: populated.message,
      isUrgent: populated.isUrgent,
      createdAt: populated.createdAt,
      author: populated.author
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const { noticeId } = req.params;
    const notice = await Notice.findByIdAndDelete(noticeId);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    res.json({ message: 'Notice deleted successfully.', id: noticeId });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotices, createNotice, deleteNotice };