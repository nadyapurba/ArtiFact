const { analyzeImage } = require('../services/visionService');
const { uploadToGCS } = require('../utils/uploadToGCS');

async function analyzeImageHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Upload file ke Google Cloud Storage
    const imageUrl = await uploadToGCS(req.file);

    // Analisis gambar menggunakan Vision API
    const analysisResult = await analyzeImage(imageUrl);

    res.status(200).json({
      message: 'Image analyzed successfully',
      analysisResult,
      imageUrl,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ message: 'Error analyzing image', error: error.message });
  }
}

module.exports = { analyzeImageHandler };
