const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferencesSchema = new Schema({
    user_FK: {
        type: mongoose.Schema.Types.ObjectId, // Use 'mongoose' instead of 'Mongoose'
        ref: 'User',
        required: true, // Ensure this field is required
    },
    Gender_Preferences: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    Religion_Preferences: {
        type: String,
        default: ''
    },
    Country_Preferences: {
        type: [String],
        default: ''
    },
    Vegan_nonVegan_Preference: {
        // type: String,
        // enum: ['Vegan', 'Non-Vegan'],
        // default: 'Non-Vegan'
        type: Boolean,
        default: false
    },
    GrocerySharing_Preferences: {
        type: Boolean,
        default: false
    },
    WorkStatus_Preferences: {
        type: [String],
        enum: ['Student', 'Employed fullTime', 'Employed PartTime', 'Unemployed', 'Other'],
        default: 'Other'
    },
    Alcohol_Preferences: {
        type: String,
        enum: ['No Preference', 'Social Drinker', 'Non-Drinker', "Occasional"],
        default: 'No Preference'
    },
    Smoking_Preferences: {
        type: Boolean,
        default: false
    },
    Noise_Preferences: {
        type: String,
        enum: ['Quiet', 'Moderate', 'Loud'],
        default: 'Moderate'
    },
    Pet_Preferences: {
        type: [String],
        default: []
    },
    Age_Preferences: {
        min: {
            type: Number,
            default: 18
        },
        max: {
            type: Number,
            default: 99
        }
    }
});

const Preferences = mongoose.model('Preferences', preferencesSchema);

module.exports = Preferences;
