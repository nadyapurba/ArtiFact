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

// Fungsi untuk registrasi juri
exports.registerJury = (req, res) => {
  const { name, email, photoUrl } = req.body;

  // Validasi input
  if (!name || !email || !photoUrl) {
      return res.status(400).json({ error: 'Name, email, and photo URL are required' });
  }

  // Log input untuk debugging
  console.log('Jury registration details:', { name, email, photoUrl });

  // Simulasikan penyimpanan data juri (misalnya dalam database)
  // Untuk tujuan contoh, kita hanya kirimkan data yang diterima
  res.status(200).json({
      message: 'Jury registered successfully!',
      jury: { name, email, photoUrl },
  });
};
