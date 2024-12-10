const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../../google-credentials.json'), // Pastikan path sesuai
});
const bucketName = 'artifact-ai-storage'; // Nama bucket di Google Cloud Storage

// Fungsi untuk mengupload file ke Google Cloud Storage
async function uploadToGCS(file) {
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(file.originalname); // Nama file akan menggunakan originalname
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: { contentType: file.mimetype }, // Menyertakan metadata terkait jenis file
  });

  return new Promise((resolve, reject) => {
    blobStream
      .on('finish', () => {
        // Setelah file berhasil diupload, mengembalikan URL file di GCS
        resolve(`https://storage.googleapis.com/${bucketName}/${file.originalname}`);
      })
      .on('error', reject) // Jika terjadi error, reject promise
      .end(file.buffer); // Mengirimkan buffer file ke GCS
  });
}

module.exports = { uploadToGCS };
