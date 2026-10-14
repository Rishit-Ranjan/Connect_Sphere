// resourceController.js
import { access, unlink } from 'fs/promises';
import { basename, extname, join } from 'path';
import Resource from '../models/Resource.js';
import { UPLOADS_DIR } from '../config/uploads.js';

const serializeResource = (resource) => ({
  id: resource._id,
  title: resource.title,
  description: resource.description,
  category: resource.category,
  fileType: resource.fileType,
  fileSize: resource.fileSize,
  fileName: resource.originalName || '',
  fileAvailable: Boolean(resource.storageName),
  downloadCount: resource.downloadCount,
  uploadedBy: resource.uploadedBy?.name || 'Unknown',
  createdAt: resource.createdAt
});

const getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(resources.map(serializeResource));
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    if (!title?.trim() || !req.file || req.file.size === 0) {
      if (req.file) await unlink(req.file.path);
      return res.status(400).json({ message: 'A title and a non-empty uploaded file are required.' });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description?.trim() || '',
      category: category?.trim() || '',
      fileType: extname(req.file.originalname).slice(1).toUpperCase(),
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      originalName: basename(req.file.originalname.replace(/\\/g, '/')),
      storageName: req.file.filename,
      uploadedBy: req.user._id
    });

    const populated = await Resource.findById(resource._id).populate('uploadedBy', 'name');

    res.status(201).json(serializeResource(populated));
  } catch (error) {
    if (req.file) {
      await unlink(req.file.path);
    }
    next(error);
  }
};

const downloadResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }
    if (!resource.storageName) {
      return res.status(404).json({ message: 'This resource has no uploaded file.' });
    }

    const filePath = join(UPLOADS_DIR, resource.storageName);
    await access(filePath);
    const updatedResource = await Resource.findByIdAndUpdate(
      resource._id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!updatedResource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }
    res.set('X-Download-Count', String(updatedResource.downloadCount));
    res.download(filePath, resource.originalName);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'The uploaded file is no longer available.' });
    }
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

    if (resource.storageName) {
      try {
        await unlink(join(UPLOADS_DIR, resource.storageName));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    await Resource.findByIdAndDelete(resourceId);

    res.json({ message: 'Resource deleted successfully.', id: resourceId });
  } catch (error) {
    next(error);
  }
};

export default {
  getResources,
  createResource,
  downloadResource,
  deleteResource
};