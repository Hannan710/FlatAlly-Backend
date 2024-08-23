// const express = require('express');
// const router = express.Router();
// const User = require('../Models/Users/Users');
// const Preferences = require('../Models/PreferencesModel');
// const Flat = require('../Models/FlatModel');

// // Function to calculate compatibility score
// function calculateCompatibilityScore(userPref1, userPref2, flat1, flat2) {
//     let score = 0;

//     // Compare preferences
//     if (userPref1.Gender_Preferences === userPref2.Gender_Preferences) score += 1;
//     if (userPref1.Religion_Preferences === userPref2.Religion_Preferences) score += 1;
//     if (userPref1.Country_Preferences.includes(userPref2.Country_Preferences)) score += 1;
//     if (userPref1.Vegan_nonVegan_Preference === userPref2.Vegan_nonVegan_Preference) score += 1;
//     if (userPref1.WorkStatus_Preferences.includes(userPref2.WorkStatus_Preferences)) score += 1;
//     if (userPref1.Alcohol_Preferences === userPref2.Alcohol_Preferences) score += 1;
//     if (userPref1.Smoking_Preferences === userPref2.Smoking_Preferences) score += 1;
//     if (userPref1.Noise_Preferences === userPref2.Noise_Preferences) score += 1;

//     // Check if Pet_Preferences is defined before using it
//     if (userPref1.Pet_Preferences && userPref2.Pet_Preferences &&
//         userPref1.Pet_Preferences.some(pet => userPref2.Pet_Preferences.includes(pet))) {
//         score += 1;
//     }

//     // Compare age preferences
//     const age1 = userPref1.age; // Assuming you have an age field in user schema
//     const age2 = userPref2.Age_Preferences;
//     if (age1 >= age2.min && age1 <= age2.max) score += 1;

//     // Compare flat details
//     if (flat1.numberRoom === flat2.numberRoom) score += 1;
//     if (flat1.washRoom === flat2.washRoom) score += 1;
//     if (flat1.kitchen === flat2.kitchen) score += 1;
//     if (flat1.bedRoom === flat2.bedRoom) score += 1;
//     if (flat1.Floor === flat2.Floor) score += 1;
//     if (flat1.bedType === flat2.bedType) score += 1;

//     return score;
// }


// // GET route to find matching users
// router.post('/findMatches', async (req, res) => {
//     try {
//         const inputPreferences = req.body; // Assuming you're passing preferences in query parameters
//         console.log('Input Preferences:', inputPreferences);

//         // Fetch all users, their preferences, and flat details
//         const users = await User.find({ softDelete: false }).populate('area_FK');
//         console.log('Users fetched:', users.length);

//         const preferences = await Preferences.find();
//         console.log('Preferences fetched:', preferences.length);

//         const flats = await Flat.find();
//         console.log('Flats fetched:', flats.length);

//         // Check if data is correctly fetched
//         if (!users || !preferences || !flats) {
//             console.error('Failed to fetch data');
//             throw new Error('Failed to fetch data');
//         }

//         // Map preferences and flat details by user ID for quick access
//         const userPreferences = preferences.reduce((acc, pref) => {
//             acc[pref.user_FK.toString()] = pref;
//             return acc;
//         }, {});
//         console.log('User Preferences mapped:', Object.keys(userPreferences).length);

//         const userFlats = flats.reduce((acc, flat) => {
//             acc[flat.user_FK.toString()] = flat;
//             return acc;
//         }, {});
//         console.log('User Flats mapped:', Object.keys(userFlats).length);


//         // Get the ID of the requesting user
//         const requestingUserId = req.id; // Replace this with the actual method to get the user's ID from the request



//         // Calculate compatibility scores for each user
//         const matches = users.filter(user => user._id.toString() !== requestingUserId) // Exclude the requesting user
//             .map(user => {
//                 const userId = user._id.toString();
//                 const userPref = userPreferences[userId];
//                 const userFlat = userFlats[userId];

//                 if (!userPref || !userFlat) {
//                     console.log(`Missing data for user ID: ${userId}`);
//                     return null; // Skip users with missing preferences or flats
//                 }

//                 const score = calculateCompatibilityScore(inputPreferences, userPref, inputPreferences, userFlat);
//                 console.log(`Score for user ID ${userId}:`, score);
//                 return {
//                     user,
//                     flat: userFlat,
//                     score
//                 };
//             }).filter(match => match !== null); // Filter out null values



//         // Sort users by score in descending order and get top 5
//         const topMatches = matches
//             .filter(match => match.score > 0)
//             .sort((a, b) => b.score - a.score)
//             .slice(0, 5);



//         console.log('Top Matches:', topMatches);
//         res.json({ matches: topMatches });
//     } catch (error) {
//         console.error('Error finding matches:', error.message);
//         res.status(500).json({ message: 'Error finding matches', error: error.message });
//     }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const User = require('../Models/Users/Users');
const Preferences = require('../Models/PreferencesModel');
const Flat = require('../Models/FlatModel');

// Function to calculate compatibility score
function calculateCompatibilityScore(userPref1, userPref2, flat1, flat2) {
    let score = 0;

    if (userPref1.Gender_Preferences === userPref2.Gender_Preferences) score += 1;
    if (userPref1.Religion_Preferences === userPref2.Religion_Preferences) score += 1;
    if (userPref1.Country_Preferences.includes(userPref2.Country_Preferences)) score += 1;
    if (userPref1.Vegan_nonVegan_Preference === userPref2.Vegan_nonVegan_Preference) score += 1;
    if (userPref1.WorkStatus_Preferences.includes(userPref2.WorkStatus_Preferences)) score += 1;
    if (userPref1.Alcohol_Preferences === userPref2.Alcohol_Preferences) score += 1;
    if (userPref1.Smoking_Preferences === userPref2.Smoking_Preferences) score += 1;
    if (userPref1.Noise_Preferences === userPref2.Noise_Preferences) score += 1;

    if (userPref1.Pet_Preferences && userPref2.Pet_Preferences &&
        userPref1.Pet_Preferences.some(pet => userPref2.Pet_Preferences.includes(pet))) {
        score += 1;
    }

    const age1 = userPref1.age;
    const age2 = userPref2.Age_Preferences;
    if (age1 >= age2.min && age1 <= age2.max) score += 1;

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
        console.log('Input Preferences:', inputPreferences);

        const users = await User.find({ softDelete: false }).populate('area_FK');
        const preferences = await Preferences.find();
        const flats = await Flat.find();

        if (!users || !preferences || !flats) {
            throw new Error('Failed to fetch data');
        }

        const userPreferences = preferences.reduce((acc, pref) => {
            acc[pref.user_FK.toString()] = pref;
            return acc;
        }, {});

        const userFlats = flats.reduce((acc, flat) => {
            acc[flat.user_FK.toString()] = flat;
            return acc;
        }, {});

        const requestingUserId = req.id;

        const matches = users.filter(user => user._id.toString() !== requestingUserId)
            .map(user => {
                const userId = user._id.toString();
                const userPref = userPreferences[userId];
                const userFlat = userFlats[userId];

                if (!userPref || !userFlat) {
                    console.log(`Skipping user ID ${userId}: Missing preferences or flat data`);
                    return null;
                }

                const score = calculateCompatibilityScore(inputPreferences, userPref, inputPreferences, userFlat);
                console.log(`Score for user ID ${userId}: ${score}`);

                return {
                    user,
                    flat: userFlat,
                    score
                };
            }).filter(match => match !== null && match.score > 0);

        const topMatches = matches.sort((a, b) => b.score - a.score).slice(0, 5);

        console.log('Top Matches:', topMatches);
        res.json({ matches: topMatches });
    } catch (error) {
        console.error('Error finding matches:', error.message);
        res.status(500).json({ message: 'Error finding matches', error: error.message });
    }
});

module.exports = router;
