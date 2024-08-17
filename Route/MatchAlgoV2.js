const express = require('express');
const router = express.Router();
const User = require('../Models/Users/Users');
const Preferences = require('../Models/PreferencesModel');
const Flat = require('../Models/FlatModel'); // Adjust the path as needed

// Function to calculate compatibility score
function calculateCompatibilityScore(userPref1, userPref2, flat1, flat2) {
    let score = 0;

    // Compare preferences
    if (userPref1.Gender_Preferences === userPref2.Gender_Preferences) score += 1;
    if (userPref1.Religion_Preferences === userPref2.Religion_Preferences) score += 1;
    if (userPref1.Country_Preferences.includes(userPref2.Country_Preferences)) score += 1;
    if (userPref1.Vegan_nonVegan_Preference === userPref2.Vegan_nonVegan_Preference) score += 1;
    if (userPref1.WorkStatus_Preferences.includes(userPref2.WorkStatus_Preferences)) score += 1;
    if (userPref1.Alcohol_Preferences === userPref2.Alcohol_Preferences) score += 1;
    if (userPref1.Smoking_Preferences === userPref2.Smoking_Preferences) score += 1;
    if (userPref1.Noise_Preferences === userPref2.Noise_Preferences) score += 1;
    if (userPref1.Pet_Preferences.some(pet => userPref2.Pet_Preferences.includes(pet))) score += 1;

    // Compare age preferences
    const age1 = userPref1.age; // Assuming you have age field in user schema
    const age2 = userPref2.Age_Preferences;
    if (age1 >= age2.min && age1 <= age2.max) score += 1;

    // Compare flat details
    if (flat1.numberRoom === flat2.numberRoom) score += 1;
    if (flat1.washRoom === flat2.washRoom) score += 1;
    if (flat1.kitchen === flat2.kitchen) score += 1;
    if (flat1.bedRoom === flat2.bedRoom) score += 1;
    if (flat1.Floor === flat2.Floor) score += 1;
    if (flat1.bedType === flat2.bedType) score += 1;

    return score;
}

// POST route to find matching users
router.post('/findMatches', async (req, res) => {
    try {
        const inputPreferences = req.body;

        // Fetch all users, their preferences, and flat details
        const users = await User.find({ softDelete: false });
        const preferences = await Preferences.find();
        const flats = await Flat.find();

        // Map preferences and flat details by user ID for quick access
        const userPreferences = preferences.reduce((acc, pref) => {
            acc[pref.user_FK.toString()] = pref;
            return acc;
        }, {});

        const userFlats = flats.reduce((acc, flat) => {
            acc[flat.user_FK.toString()] = flat;
            return acc;
        }, {});

        // Calculate compatibility scores for each user
        const matches = users.map(user => {
            const userId = user._id.toString();
            const userPref = userPreferences[userId];
            const userFlat = userFlats[userId];
            const score = calculateCompatibilityScore(inputPreferences, userPref, inputPreferences, userFlat);
            return {
                user,
                flat: userFlat,
                score
            };
        });

        // Sort users by score in descending order and get top 5
        const topMatches = matches
            .filter(match => match.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        res.json({ matches: topMatches });
    } catch (error) {
        res.status(500).json({ message: 'Error finding matches', error });
    }
});

module.exports = router;
