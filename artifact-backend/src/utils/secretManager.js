// utils/secretManager.js

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

// Fungsi untuk mengambil secret dari Secret Manager
async function getSecret(secretName) {
    try {
        // Mengakses secret version terbaru
        const [version] = await client.accessSecretVersion({
            name: `projects/${process.env.PROJECT_ID}/secrets/${secretName}/versions/latest`,
        });

        // Mengonversi payload secret menjadi string
        const payload = version.payload.data.toString('utf8');
        return payload;
    } catch (err) {
        console.error('Error accessing secret:', err);
        throw new Error('Failed to access secret');
    }
}

module.exports = { getSecret };
