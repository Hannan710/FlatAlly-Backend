const express = require("express");
const router = express.Router();
const PreferencesModel = require("../Models/PreferencesModel");
const PreferencesSchema = require("../Schema/PreferencesSchema");
// const Users = require("../models/Users/User");
const Users = require("../Models/Users/Users");
// GET all preferences
router.get("/", async (req, res) => {
    try {
        const preferences = await PreferencesModel.find();
        res.send(preferences);
    } catch (err) {
        res.status(500).send("Error fetching preferences: " + err);
    }
});

// GET preferences by user ID
router.get("/:id", async (req, res) => {
    try {
        const preferences = await PreferencesModel.find({ user_FK: req.params.id, softDelete: false })
            .populate({
                path: "user_FK",
                select: "userName imageUrl email gender address accountType area_FK",
                populate: {
                    path: "area_FK",
                    select: "name otherFields", // Select the fields you want from the area_FK document
                },
            });
        res.send(preferences);
    } catch (err) {
        res.status(500).send("Error fetching preferences: " + err);
    }
});


// POST add new preferences
router.post("/Add", async (req, res) => {
    const preferencesObj = req.body;
    console.log(preferencesObj)

    try {
        const { error } = PreferencesSchema.validate(preferencesObj);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const existingUser = await PreferencesModel.findOne({ user_FK: req.id });
        // console.log(existingUser)
        if (existingUser) {
            return res.status(404).send({ message: "Your Preference already Exists" });
        }

        preferencesObj.user_FK = req.id;

        const newPreferences = new PreferencesModel(preferencesObj);
        const savedPreferences = await newPreferences.save();
        res.send(savedPreferences);
    } catch (err) {
        res.status(500).send("Error adding preferences: " + err);
    }
});

// PATCH update preferences by ID
router.patch("/Update/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedPreferences = await PreferencesModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedPreferences) {
            return res.status(404).send({ message: "Preferences not found" });
        }
        res.send(updatedPreferences);
    } catch (err) {
        res.status(500).send("Error updating preferences: " + err);
    }
});

// DELETE preferences by ID
router.delete("/Delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPreferences = await PreferencesModel.findByIdAndDelete(id);
        if (!deletedPreferences) {
            return res.status(404).send({ message: "Preferences not found" });
        }
        res.send(deletedPreferences);
    } catch (err) {
        res.status(500).send("Error deleting preferences: " + err);
    }
});

module.exports = router;
