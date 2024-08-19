const Joi = require('joi');

// Define Joi schema for preferences
const preferences = Joi.object({
    // user_FK: Joi.string().required(),
    Gender_Preferences: Joi.string().required(),
    Religion_Preferences: Joi.string().required(),
    Country_Preferences: Joi.array().items(Joi.string()),
    Vegan_NonVegan_Preference: Joi.boolean().required(),
    GrocerySharing_Preferences: Joi.boolean(),
    WorkStatus_Preferences: Joi.array().items(Joi.string()).required(),
    Alcohol_Preferences: Joi.string().required(),
    Smoking_Preferences: Joi.boolean().required(),
    Noise_Preferences: Joi.string().required(),
    Pet_Preferences: Joi.array().items(Joi.string()),
    Age_Preferences: Joi.object({
        min: Joi.number().required(),
        max: Joi.number().required()
    }).required()
});

module.exports = preferences;
