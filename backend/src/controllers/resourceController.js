// resourceController.js
const Resource = require('../models/Resource');

const getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    const normalized = resources.map((resource) => ({
      id: resource._id,
      title: resource.title,
      description: resource.description,
      category: resource.category,
      fileType: resource.fileType,
      fileSize: resource.fileSize,
      url: resource.url,
      downloadCount: resource.downloadCount,
      uploadedBy: resource.uploadedBy?.name || 'Unknown',
      createdAt: resource.createdAt
    }));

    res.json(normalized);
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const { title, description, category, fileType, fileSize, url } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description || '',
      category: category || '',
      fileType: fileType || '',
      fileSize: fileSize || '',
      url: url || '#',
      uploadedBy: req.user._id
    });

    const populated = await Resource.findById(resource._id).populate('uploadedBy', 'name');

    res.status(201).json({
      id: populated._id,
      title: populated.title,
      description: populated.description,
      category: populated.category,
      fileType: populated.fileType,
      fileSize: populated.fileSize,
      url: populated.url,
      downloadCount: populated.downloadCount,
      uploadedBy: populated.uploadedBy?.name || 'Unknown',
      createdAt: populated.createdAt
    });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      resource.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await Resource.findByIdAndDelete(resourceId);

    res.json({ message: 'Resource deleted successfully.', id: resourceId });
  } catch (error) {
    next(error);
  }
};

const incrementDownloads = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    resource.downloadCount += 1;
    await resource.save();

    res.json({
      id: resource._id,
      downloadCount: resource.downloadCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  createResource,
  deleteResource,
  incrementDownloads
};