import NotificationStatus from '../models/NotificationStatus.js';

const notificationIdPattern = /^(notice|like|comment)-[a-f\d]{24}$/i;

const getStatuses = async (req, res, next) => {
  try {
    const statuses = await NotificationStatus.find({ user: req.user._id })
      .select('notificationId read dismissed -_id')
      .lean();

    res.json(statuses);
  } catch (error) {
    next(error);
  }
};

const updateStatuses = async (req, res, next) => {
  try {
    const { notificationIds, read, dismissed } = req.body;
    const hasRead = typeof read === 'boolean';
    const hasDismissed = typeof dismissed === 'boolean';

    if (
      !Array.isArray(notificationIds) ||
      notificationIds.length < 1 ||
      notificationIds.length > 20 ||
      !notificationIds.every((id) => typeof id === 'string' && notificationIdPattern.test(id)) ||
      (!hasRead && !hasDismissed)
    ) {
      return res.status(400).json({ message: 'Valid notification IDs and a read or dismissed status are required.' });
    }

    const operations = notificationIds.map((notificationId) => {
      const status = {};
      if (hasRead) status.read = read;
      if (hasDismissed) status.dismissed = dismissed;

      return {
        updateOne: {
          filter: { user: req.user._id, notificationId },
          update: {
            $set: status,
            $setOnInsert: { user: req.user._id, notificationId }
          },
          upsert: true
        }
      };
    });

    await NotificationStatus.bulkWrite(operations);
    res.json({ message: 'Notification status updated.' });
  } catch (error) {
    next(error);
  }
};

export default { getStatuses, updateStatuses };
