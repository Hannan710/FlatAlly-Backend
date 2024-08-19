const express = require("express");
const MyRouter = express.Router();

const users = require("../Models/Users/Users");
const Flat = require('../Models/FlatModel');
const PreferencesModel = require("../Models/PreferencesModel");

MyRouter.get("/", async (req, res) => {
    try {
        // Fetch users with accountType "providing"
        const providingUsers = await users.find({ accountType: "providing" }).limit(3);

        // If no users are found, return an empty array
        if (providingUsers.length === 0) {
            return res.status(404).send({ message: "No users found with accountType 'providing'" });
        }

        // Prepare the response data
        const responseData = await Promise.all(providingUsers.map(async user => {
            // Fetch the user's flat details
            const userFlat = await Flat.findOne({ user_FK: user._id });

            // Fetch the user's preferences
            const userPreferences = await PreferencesModel.findOne({ user_FK: user._id });

            // Handle imageUrl paths
            const modifiedImageUrl = userFlat && userFlat.imgs_Url
                ? userFlat.imgs_Url.map(url => url.replace(/\\/g, '/'))
                : [];

            return {
                userName: user.userName,
                profilePic: user.imageUrl ? user.imageUrl.replace(/\\/g, '/') : null, // Check if profilePic exists
                address: user.address,
                preferences: userPreferences || {}, // Handle case where preferences might not exist
                flatDetails: {
                    ...userFlat?.toObject(), // Safely convert userFlat to object
                    imgs_Url: modifiedImageUrl
                }
            };
        }));

        // Send the response data
        res.status(200).send(responseData);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send({ message: "Internal server error" });
    }
});

module.exports = MyRouter;
