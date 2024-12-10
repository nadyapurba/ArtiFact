// controllers/detectionController.js

exports.detect = (req, res) => {
  const { imageUrl } = req.body;

  // Validasi input
  if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
  }

  // Log input untuk debugging
  console.log('Image URL received:', imageUrl);

  // Kirim respons sementara
  res.status(200).json({
      message: 'Detection route is working!',
      receivedImageUrl: imageUrl,
  });
};
