const Reptile = require('../models/Reptiles');
const UserReptiles = require('../models/User_reptiles');
const LibraryContents = require('../models/Library_contents');
const Carts = require('../models/Carts');
const { successResponse } = require('../../utils/APIResponse');
const mongoose = require('mongoose');

exports.getAllReptiles = async (req, res) => {
  try {
    const reptiles = await Reptile.find();
    res.json(successResponse(reptiles));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReptileById = async (req, res) => {
  try {
    const { id } = req.query;  
    if (!id) {
      return res.status(400).json({ message: 'Missing id query parameter' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }
    const reptile = await Reptile.findById(id);
    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }
    res.json(successResponse(reptile));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createReptile = async (req, res) => {
  try {
    const newReptile = new Reptile({
      ...req.body,
      user_id: req.user._id
    });

    const savedReptile = await newReptile.save();
    res.json(successResponse(savedReptile));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateReptileById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Missing id query parameter' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const reptile = await Reptile.findById(id);
    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }

    if (reptile.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to update this reptile' });
    }

    const updateData = req.body;

    const updatedReptile = await Reptile.findByIdAndUpdate(id, updateData, { new: true });
    res.json(successResponse(updatedReptile));
  } catch (err) {
    console.error('Error updating reptile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReptileById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Missing id query parameter' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const reptile = await Reptile.findById(id);
    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }

    if (req.user.role !== 'admin' && reptile.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to delete this reptile' });
    }

    const deleted = await Reptile.findByIdAndDelete(id);
    await Promise.all([
      UserReptiles.updateMany({ reptile_id: deleted._id }, { $set: { reptile_id: null } }),
      LibraryContents.updateMany({ reptile_id: deleted._id }, { $set: { reptile_id: null } }),
      Carts.updateMany({ reptile_id: deleted._id }, { $set: { reptile_id: null } })
    ]);

    res.json(successResponse({ deleted_id: id }));
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getReptilesByUser = async (req, res) => {
  try {
    const userId = req.user._id; 

    const reptiles = await Reptile.find({ user_id: userId });

    res.json(successResponse(reptiles));
  } catch (err) {
    console.error('Error fetching user reptiles:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
