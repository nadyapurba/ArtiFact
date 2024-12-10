// src/models/Photo.js
const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Nama pengunggah
    urlPhoto: { type: String, required: true }, // URL gambar
    title: { type: String, required: true }, // Judul gambar
    createdAt: { type: Date, default: Date.now }, // Waktu upload
});

module.exports = mongoose.model("Photo", PhotoSchema);
