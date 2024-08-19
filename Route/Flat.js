const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const Flat = require('../Models/FlatModel');
const FlatSchema = require('../Schema/FlatSchema');

const { findOne } = require('../Models/Meeting');
const users = require("../Models/Users/Users");
const PreferencesModel = require("../Models/PreferencesModel");

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/'); // Directory to store files
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG files are allowed.'));
    }
};

// Initialize multer
const upload = multer({ storage, fileFilter });

// Route to create a new flat
router.post('/add', upload.array('imageUrl', 10), async (req, res) => {
    console.log('Files:', req.files); // This should log an array of files
    console.log('Body:', req.body);   // This should include form fields
    console.log('Body:', req.id);   // This should include form fields

    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ message: "No images provided" });
    }

    let findUser;
    try {
        findUser = await PreferencesModel.findOne({ user_FK: req.id }); // Use req.id directly
    } catch (error) {
        return res.status(400).send({ message: "Invalid user ID" });
    }

    if (!findUser) {
        return res.status(409).send({ message: "Preference Not Found" });
    }

    const flatData = {
        user_FK: req.id,
        Preference_Fk: findUser._id.toString(),
        numberRoom: parseInt(req.body.numberRoom), // Convert to number
        washRoom: parseInt(req.body.washRoom), // Convert to number
        kitchen: req.body.kitchen === 'true', // Convert to boolean
        bedRoom: parseInt(req.body.bedRoom), // Convert to number
        bedType: req.body.bedType,
        Floor: parseInt(req.body.Floor), // Convert to number
        imgs_Url: req.files.map(file => file.path) // Map file paths
    };

    const { error } = FlatSchema(flatData);
    if (error) return res.status(400).send({ message: error.details[0].message });

    try {
        const newFlat = new Flat(flatData);
        await newFlat.save();
        res.status(201).send(newFlat);
    } catch (err) {
        console.error("Error saving new flat:", err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Route to get all flats
router.get('/', async (req, res) => {
    try {
        const flats = await Flat.find();
        res.status(200).send(flats);
    } catch (err) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Route to get a single flat by ID
router.get('/:id', async (req, res) => {
    try {
        const flat = await Flat.findById(req.params.id);
        if (!flat) return res.status(404).send({ message: 'Flat not found' });
        res.status(200).send(flat);
    } catch (err) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Route to update a flat by ID
router.put('/:id', upload.array('imgs_Url', 10), async (req, res) => {
    const updatedData = {
        id: req.body.id,
        vocationFilled: req.body.vocationFilled,
        user_FK: req.body.user_FK,
        Preference_Fk: req.body.Preference_Fk,
        numberRoom: req.body.numberRoom,
        washRoom: req.body.washRoom,
        kitchen: req.body.kitchen,
        bedRoom: req.body.bedRoom,
        bedType: req.body.bedType,
        Floor: req.body.Floor,
        imgs_Url: req.files.length ? req.files.map(file => file.path) : undefined
    };

    const { error } = FlatSchema(updatedData);
    if (error) return res.status(400).send({ message: error.details[0].message });

    try {
        const flat = await Flat.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!flat) return res.status(404).send({ message: 'Flat not found' });
        res.status(200).send(flat);
    } catch (err) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Route to delete a flat by ID
router.delete('/:id', async (req, res) => {
    try {
        const flat = await Flat.findByIdAndDelete(req.params.id);
        if (!flat) return res.status(404).send({ message: 'Flat not found' });
        res.status(200).send({ message: 'Flat deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
