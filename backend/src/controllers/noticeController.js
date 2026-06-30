
const Notice = require('../models/Notice');

const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    const normalized = notices.map((notice) => ({
      id: notice._id,
      title: notice.title,
      content: notice.content,
      category: notice.category,
      createdAt: notice.createdAt,
      authorName: `${notice.author.name} (${notice.author.role === 'admin' ? 'Admin' : 'Faculty'})`,
      isUrgent: notice.isUrgent
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

    const { title, content, category, isUrgent } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      isUrgent: !!isUrgent,
      author: req.user._id
    });

    const populated = await Notice.findById(notice._id).populate('author', 'name role');

    res.status(201).json({
      id: populated._id,
      title: populated.title,
      content: populated.content,
      category: populated.category,
      createdAt: populated.createdAt,
      authorName: `${populated.author.name} (${populated.author.role === 'admin' ? 'Admin' : 'Faculty'})`,
      isUrgent: populated.isUrgent
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