// Memuat konfigurasi dari .env
require('dotenv').config(); // Pastikan file .env berada di root project

// Import library yang diperlukan
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision'); // Import Google Cloud Vision
const Joi = require('joi'); // Untuk validasi input
const winston = require('winston'); // Untuk logging terstruktur

// Import fungsi untuk mengambil secret dari Secret Manager
const { getSecret } = require('./utils/secretManager');

// Inisialisasi Express
const app = express();

// Model MongoDB untuk Item
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false },
});

const Item = mongoose.model('Item', itemSchema);

// Model MongoDB untuk Foto
const photoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    urlPhoto: { type: String, required: true },
    imageTitle: { type: String, required: true },
});

const Photo = mongoose.model('Photo', photoSchema);

// Model MongoDB untuk Juri
const jurySchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Menambahkan email
});

const Jury = mongoose.model('Jury', jurySchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Konfigurasi logger dengan Winston tanpa timestamp
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(), // Menggunakan format sederhana tanpa timestamp
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' }),
    ],
});

// Fungsi untuk log yang diinginkan
function logMessage(message) {
    logger.info(message);
}

// Mengambil port dan URI dari .env
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Koneksi ke MongoDB dengan mekanisme retry
const connectWithRetry = () => {
    mongoose
        .connect(MONGO_URI, { serverSelectionTimeoutMS: 60000 })
        .then(() => logMessage('MongoDB connection established successfully'))
        .catch((err) => {
            logMessage('Failed to connect to MongoDB, retrying in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        });
};
connectWithRetry();

// Middleware untuk logging setiap request
app.use((req, res, next) => {
    logMessage(`${req.method} request to ${req.originalUrl}`);
    next();
});

// Middleware untuk autentikasi menggunakan JWT
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Access Denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(403).json({ message: 'Invalid Token' });
        }
        req.user = user;
        next();
    });
}

// Mengambil dan memuat secrets dari Secret Manager
async function loadSecrets() {
    try {
        const jwtSecret = await getSecret('jwt-secret');
        const jwtRefreshSecret = await getSecret('jwt-refresh-secret');
        const googleCredentials = await getSecret('google-credentials-json');

        // Menyimpan secret ke environment variables
        process.env.JWT_SECRET = jwtSecret;
        process.env.JWT_REFRESH_SECRET = jwtRefreshSecret;
        process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCredentials;

        console.log('Secrets loaded successfully.');
    } catch (err) {
        console.error('Error loading secrets:', err);
        process.exit(1); // Exit the application if secrets can't be loaded
    }
}

// Memuat secrets sebelum server dijalankan
loadSecrets().then(() => {
    // Konfigurasi Google Cloud Storage
    const storage = new Storage({
        keyFilename: path.join(__dirname, 'google-credentials.json'),
    });
    const bucketName = 'artifact-ai-storage';

    // Konfigurasi multer untuk mengunggah file
    const multerStorage = multer.memoryStorage();
    const upload = multer({ storage: multerStorage });

    // Fungsi untuk mengunggah file ke Google Cloud Storage
    async function uploadToGCS(file) {
        const bucket = storage.bucket(bucketName);
        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: { contentType: file.mimetype },
        });

        return new Promise((resolve, reject) => {
            blobStream
                .on('finish', () => resolve(`https://storage.googleapis.com/${bucketName}/${file.originalname}`))
                .on('error', reject)
                .end(file.buffer);
        });
    }

   // Fungsi untuk menganalisis gambar menggunakan Vision API dan mendeteksi gambar buatan manusia atau AI
async function analyzeImage(imageUrl) {
    const client = new vision.ImageAnnotatorClient({
        keyFilename: path.join(__dirname, 'google-credentials.json'),
    });

    const [labelResult] = await client.labelDetection(imageUrl);
    const labels = labelResult.labelAnnotations;

    let category = "human"; // Default category as "human"

    // Fungsi untuk menentukan apakah gambar manusia atau AI
    function classifyImage(labels) {
        let isAI = false;

        // Periksa jika ada label yang cocok dengan AI
        labels.forEach(label => {
            if (label.description === "CG artwork" || label.description === "Animation") {
                isAI = true;
            }
        });

        // Kembali hasil klasifikasi
        return isAI ? 'AI Detected' : 'Human Detected';
    }

    // Hasil klasifikasi gambar
    category = classifyImage(labels);

    return {
        category, // "human" or "ai"
        labels: labels.length > 0 ? labels : "No labels detected",
        imageUrl,
    };
}


    // Menambahkan Route untuk `/`
    app.get('/', (req, res) => {
        res.send('Artifact AI Backend is running!');
    });

    // Route untuk mendapatkan semua Item
    app.get('/api/items', authenticateToken, async (req, res) => {
        try {
            const items = await Item.find();
            if (!items.length) return res.status(404).json({ message: 'No items found' });
            res.status(200).json(items);
        } catch (err) {
            logMessage('Error retrieving items:', err);
            res.status(500).json({ message: 'Error retrieving items', error: err });
        }
    });

    // Route untuk menambah Item baru
    const itemValidationSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
    });

    app.post('/api/items', authenticateToken, upload.single('image'), async (req, res) => {
        const { error } = itemValidationSchema.validate(req.body);
        if (error) return res.status(400).json({ message: 'Invalid input', details: error.details });

        const { name, description } = req.body;

        try {
            const imageUrl = req.file ? await uploadToGCS(req.file) : null;
            const newItem = new Item({ name, description, image: imageUrl });
            await newItem.save();
            res.status(201).json({ message: 'Item added successfully', item: newItem });
        } catch (err) {
            logMessage('Error adding item:', err);
            res.status(500).json({ message: 'Error adding item', error: err });
        }
    });

    // Route untuk menghapus Item berdasarkan ID
    app.delete('/api/items/:id', authenticateToken, async (req, res) => {
        try {
            const deletedItem = await Item.findByIdAndDelete(req.params.id);
            if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
            res.status(200).json({ message: 'Item deleted successfully', item: deletedItem });
        } catch (err) {
            logMessage('Error deleting item:', err);
            res.status(500).json({ message: 'Error deleting item', error: err });
        }
    });

    // Route untuk analisis gambar menggunakan Vision API (dengan 2 kategori: human/ai)
    app.post('/api/analyze', authenticateToken, upload.single('image'), async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });

            const imageUrl = await uploadToGCS(req.file);
            const analysisResults = await analyzeImage(imageUrl);

            res.status(200).json({
                message: 'Image analyzed successfully',
                analysisResults,
                imageUrl,
            });
        } catch (err) {
            logMessage('Error analyzing image:', err);
            res.status(500).json({ message: 'Error analyzing image', error: err });
        }
    });

    // Route untuk registrasi Juri
    app.post('/api/jury/register', async (req, res) => {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, password, and email are required' });
        }

        try {
            // Cek apakah juri sudah terdaftar
            const existingJury = await Jury.findOne({ username });
            if (existingJury) {
                return res.status(400).json({ message: 'Jury with this username already exists' });
            }

            // Membuat juri baru
            const newJury = new Jury({ username, password, email });
            await newJury.save();

            res.status(201).json({ message: 'Jury registered successfully', jury: newJury });
        } catch (err) {
            logMessage('Error registering jury:', err);
            res.status(500).json({ message: 'Error registering jury', error: err });
        }
    });

    // Route untuk login Juri
    app.post('/api/jury/login', async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        try {
            const jury = await Jury.findOne({ username });
            if (!jury) {
                return res.status(404).json({ message: 'Jury not found' });
            }

            // Validasi password (Anda harus mengganti ini dengan hashing password untuk produksi)
            if (jury.password !== password) {
                return res.status(403).json({ message: 'Invalid password' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: jury._id, username: jury.username }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.status(200).json({ message: 'Login successful', token });
        } catch (err) {
            logMessage('Error logging in jury:', err);
            res.status(500).json({ message: 'Error logging in jury', error: err });
        }
    });

    // Route untuk menambah foto
    app.post('/api/photos', authenticateToken, upload.single('image'), async (req, res) => {
        const { name, imageTitle } = req.body;
        if (!name || !imageTitle) {
            return res.status(400).json({ message: 'Name and image title are required' });
        }

        try {
            const imageUrl = req.file ? await uploadToGCS(req.file) : null;
            const newPhoto = new Photo({ name, urlPhoto: imageUrl, imageTitle });
            await newPhoto.save();
            res.status(201).json({ message: 'Photo added successfully', photo: newPhoto });
        } catch (err) {
            logMessage('Error adding photo:', err);
            res.status(500).json({ message: 'Error adding photo', error: err });
        }
    });
    
    // Route untuk mendapatkan semua Foto
app.get('/api/photos', authenticateToken, async (req, res) => {
    try {
        const photos = await Photo.find();
        if (!photos.length) return res.status(404).json({ message: 'No photos found' });
        res.status(200).json(photos);
    } catch (err) {
        logMessage('Error retrieving photos:', err);
        res.status(500).json({ message: 'Error retrieving photos', error: err });
    }
});

    // Menjalankan server
    app.listen(PORT, () => {
        logMessage(`Server is running on port ${PORT}`);
    });
});
