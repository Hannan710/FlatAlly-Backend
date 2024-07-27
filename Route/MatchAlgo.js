const express = require('express');
const router = express.Router();
const User = require('../Models/Users/Users');
const Preferences = require('../Models/PreferencesModel');

// Function to get all users and their preferences
async function getAllUsersAndPreferences() {
    const users = await User.find({ softDelete: false });
    const preferences = await Preferences.find();

    const userPreferences = preferences.reduce((acc, pref) => {
        acc[pref.user_FK.toString()] = pref;
        return acc;
    }, {});

    return { users, userPreferences };
}

// Function to calculate compatibility score
function calculateCompatibilityScore(userPref1, userPref2) {
    let score = 0;

    if (userPref1.Gender_Preferences === userPref2.gender) score += 1;
    if (userPref1.Religion_Preferences === userPref2.Religion_Preferences) score += 1;
    if (userPref1.Country_Preferences.includes(userPref2.Country_Preferences)) score += 1;
    if (userPref1.Vegan_nonVegan_Preference === userPref2.Vegan_nonVegan_Preference) score += 1;
    if (userPref1.GrocerySharing_Preferences === userPref2.GrocerySharing_Preferences) score += 1;
    if (userPref1.WorkStatus_Preferences.includes(userPref2.WorkStatus_Preferences)) score += 1;
    if (userPref1.Alcohol_Preferences === userPref2.Alcohol_Preferences) score += 1;
    if (userPref1.Smoking_Preferences === userPref2.Smoking_Preferences) score += 1;
    if (userPref1.Noise_Preferences === userPref2.Noise_Preferences) score += 1;
    if (userPref1.Pet_Preferences.some(pet => userPref2.Pet_Preferences.includes(pet))) score += 1;

    const age1 = userPref2.age; // Assuming you have age field in user schema
    const age2 = userPref1.Age_Preferences;
    if (age1 >= age2.min && age1 <= age2.max) score += 1;

    return score;
}

// POST route to match users
router.post('/', async (req, res) => {
    try {
        const userId = req.id;  // id is Extracted from JWT which basically provides id which is logged in System
        const { users, userPreferences } = await getAllUsersAndPreferences();

        const user1 = users.find(user => user._id.toString() === userId);
        if (!user1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const pref1 = userPreferences[userId];
        if (!pref1) {
            return res.status(404).json({ message: 'Preferences not found for user' });
        }

        const matches = users.filter(user2 => user1._id.toString() !== user2._id.toString())
            .map(user2 => ({
                user: user2,
                score: calculateCompatibilityScore(pref1, userPreferences[user2._id.toString()])
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Return top 5 matches

        res.json({ matches });
    } catch (error) {
        res.status(500).json({ message: 'Error matching users', error });
    }
});

module.exports = router;
