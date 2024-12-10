const vision = require('@google-cloud/vision');
const path = require('path'); // Menggunakan path untuk mengelola jalur file

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../google-credentials.json'), // Sesuaikan dengan lokasi file google-credentials.json
});

async function analyzeImage(imagePath) {
  try {
    // Menggunakan faceDetection untuk mendeteksi wajah dalam gambar
    const [faceResult] = await client.faceDetection(imagePath);
    const faces = faceResult.faceAnnotations || [];

    // Menggunakan textDetection untuk mendeteksi teks dalam gambar
    const [textResult] = await client.textDetection(imagePath);
    const texts = textResult.textAnnotations || [];

    // Menggunakan objectLocalization untuk mendeteksi objek dalam gambar
    const [objectResult] = await client.objectLocalization(imagePath);
    const objects = objectResult.localizedObjectAnnotations || [];

    // Menambahkan analisis label dengan labelDetection
    const [labelResult] = await client.labelDetection(imagePath);
    console.log("Label Detection Result:", labelResult); // Log hasil label detection
    const labels = labelResult.labelAnnotations || [];

    return {
      faces: faces.map(face => ({ boundingBox: face.boundingPoly })), // Wajah dan bounding box
      texts: texts.map(text => text.description), // Teks yang terdeteksi
      objects: objects.map(obj => ({
        name: obj.name,
        score: obj.score,
        boundingBox: obj.boundingPoly, // Objek dan lokasi
      })),
      labels: labels.map(label => label.description), // Hasil label detection
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Image analysis failed');
  }
}

module.exports = { analyzeImage };
