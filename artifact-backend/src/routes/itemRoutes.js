const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item'); // Mengimpor model dari folder models

const router = express.Router();

// Route: GET /items - Mengambil semua item
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find(); // Mengambil semua item dari database
    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Error fetching items', error: err });
  }
});

// Route: POST /add - Menambahkan item baru
router.post(
  '/add',
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
  ],
  async (req, res) => {
    // Validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description } = req.body;

      // Membuat item baru menggunakan model
      const newItem = new Item({ name, description });
      await newItem.save();

      res.status(201).json({ message: 'Item added successfully', item: newItem });
    } catch (err) {
      console.error('Error adding item:', err);
      res.status(500).json({ message: 'Error adding item', error: err });
    }
  }
);

// Route: GET /items/:id - Mengambil item berdasarkan ID
router.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id); // Mencari item berdasarkan ID
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({ message: 'Error fetching item', error: err });
  }
});

// Route: PUT /items/:id - Memperbarui item berdasarkan ID
router.put('/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body, // Data yang akan diperbarui
      { new: true, runValidators: true } // Mengembalikan item yang sudah diperbarui
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ message: 'Error updating item', error: err });
  }
});

// Route: DELETE /items/:id - Menghapus item berdasarkan ID
router.delete('/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id); // Menghapus item
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Error deleting item', error: err });
  }
});

module.exports = router;
