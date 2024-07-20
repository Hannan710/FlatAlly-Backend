const Joi = require('joi');

// Define Joi schema for preferences
const preferences = Joi.object({
    // user_FK: Joi.string().required(),
    Gender_Preferences: Joi.string().required(),
    Religion_Preferences: Joi.string().required(),
    Country_Preferences: Joi.array().items(Joi.string()).required(),
    Vegan_NonVegan_Preference: Joi.string().required(),
    GrocerySharing_Preferences: Joi.boolean().required(),
    WorkStatus_Preferences: Joi.array().items(Joi.string()).required(),
    Alcohol_Preferences: Joi.string().required(),
    Smoking_Preferences: Joi.boolean().required(),
    Noise_Preferences: Joi.string().required(),
    Pet_Preferences: Joi.array().items(Joi.string()).required(),
    Age_Preferences: Joi.object({
        min: Joi.number().required(),
        max: Joi.number().required()
    }).required()
});

module.exports = preferences;
