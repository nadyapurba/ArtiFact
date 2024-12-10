const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file menggunakan multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tentukan folder tujuan untuk menyimpan file
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Tentukan nama file yang akan disimpan di server
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Validasi file (contohnya hanya gambar PNG, JPG, JPEG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only .jpg, .jpeg, and .png files are allowed'), false);
  }
  cb(null, true);
};

// Inisialisasi multer dengan konfigurasi penyimpanan dan validasi
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Batasi ukuran file hingga 5MB
});

// Ekspor middleware upload
module.exports = upload;
