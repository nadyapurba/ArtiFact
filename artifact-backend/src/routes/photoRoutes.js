// src/routes/photoRoutes.js
const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");

// Tambah data foto
router.post("/add", async (req, res) => {
    try {
        const { name, urlPhoto, title } = req.body;

        const newPhoto = new Photo({ name, urlPhoto, title });
        await newPhoto.save();

        res.status(201).json({ message: "Photo added successfully", photo: newPhoto });
    } catch (error) {
        console.error("Error adding photo:", error);
        res.status(500).json({ message: "Failed to add photo", error });
    }
});

// Lihat semua foto
router.get("/", async (req, res) => {
    try {
        const photos = await Photo.find();
        res.status(200).json(photos);
    } catch (error) {
        console.error("Error fetching photos:", error);
        res.status(500).json({ message: "Failed to fetch photos", error });
    }
});

module.exports = router;
