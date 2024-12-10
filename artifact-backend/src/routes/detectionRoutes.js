const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/detectionController');

// Middleware untuk logging (opsional, untuk debugging)
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`);
    next();
});

// Endpoint untuk deteksi seni
router.post('/detect', (req, res, next) => {
    console.log('Request received at /detect with body:', req.body); // Debugging log
    next();
}, detectionController.detect);

// Default handler untuk rute yang tidak ditemukan
router.all('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
