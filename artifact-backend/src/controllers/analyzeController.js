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

    // Proses hasil analisis untuk menentukan apakah gambar buatan AI atau manusia
    const isAI = determineAIorHuman(analysisResult);

    res.status(200).json({
      message: 'Image analyzed successfully',
      analysisResult,
      imageUrl,
      isAI: isAI ? 'AI-generated' : 'Human-generated',
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ message: 'Error analyzing image', error: error.message });
  }
}

// Fungsi untuk menentukan apakah gambar buatan AI atau manusia
function determineAIorHuman(analysisResult) {
  // Contoh logika sederhana berdasarkan label atau properti tertentu
  // Silakan sesuaikan logika ini sesuai kebutuhan proyek Anda
  const aiIndicators = ['neural network', 'GAN', 'CGI', 'artificial'];
  const humanIndicators = ['photo', 'real', 'natural', 'person'];

  let aiScore = 0;
  let humanScore = 0;

  if (analysisResult && analysisResult.labels) {
    for (const label of analysisResult.labels) {
      const labelDescription = label.description.toLowerCase();
      if (aiIndicators.some(indicator => labelDescription.includes(indicator))) {
        aiScore++;
      }
      if (humanIndicators.some(indicator => labelDescription.includes(indicator))) {
        humanScore++;
      }
    }
  }

  // Jika skor AI lebih tinggi, maka gambar kemungkinan besar dibuat oleh AI
  return aiScore > humanScore;
}

module.exports = { analyzeImageHandler };
