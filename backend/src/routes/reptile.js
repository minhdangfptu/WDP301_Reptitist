const express = require('express');
const router = express.Router();
const Reptile = require('../models/Reptiles');
const { successResponse } = require('../../utils/APIResponse');
const UserReptiles = require('../models/User_reptiles');
const LibraryContents = require('../models/Library_contents');
const Carts = require('../models/Carts');
// GET all reptiles
router.get('/get-all', async (req, res) => {
  try {
    const reptiles = await Reptile.find();
    res.json(successResponse(reptiles));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/get-reptile-by-id', async (req, res) => {
   try {
    const { reptile_id } = req.query;
    if (!reptile_id) {
      return res.status(400).json({ message: 'Missing reptile_id query parameter' });
    }
    const reptile = await Reptile.findOne({ reptile_id: reptile_id });
    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }
    res.json(successResponse(reptile));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/create-reptile', async (req, res) => {
  try {
    const lastReptile = await Reptile.findOne().sort({ reptile_id: -1 }).limit(1);
    const nextId = lastReptile ? lastReptile.reptile_id + 1 : 1;
    const newReptile = new Reptile({
      ...req.body,
      reptile_id: nextId
    });

    const savedReptile = await newReptile.save();
    res.json(successResponse(savedReptile, code));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/update-reptile-by-id', async (req, res) => {
  try {
    const { reptile_id } = req.query;

    if (!reptile_id) {
      return res.status(400).json({ message: 'Missing reptile_id query parameter' });
    }

    const updateData = req.body;

    const updatedReptile = await Reptile.findOneAndUpdate(
      { reptile_id: reptile_id },
      updateData,
      { new: true }
    );

    if (!updatedReptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }

    res.json(successResponse(updatedReptile));
  } catch (err) {
    console.error('Error updating reptile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delete-reptile-by-id', async (req, res) => {
  try {
    const { reptile_id } = req.query;

    if (!reptile_id) {
      return res.status(400).json({ message: 'Missing reptile_id query parameter' });
    }
    const deleted = await Reptile.findOneAndDelete({ reptile_id: reptile_id });

    if (!deleted) {
      return res.status(404).json({ message: 'Reptile not found' });
    }
    await Promise.all([
      UserReptiles.updateMany({ reptile_id }, { $set: { reptile_id: null } }),
      LibraryContents.updateMany({ reptile_id }, { $set: { reptile_id: null } }),
      Carts.updateMany({ reptile_id }, { $set: { reptile_id: null } })
    ]);

    res.json(successResponse({ deleted_id: reptile_id }));
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});``

module.exports = router;
