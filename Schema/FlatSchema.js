const Joi = require('joi');

const FlatSchema = (flat) => {
    const schema = Joi.object({
        // id: Joi.string().required(),
        // vocationFilled: Joi.boolean().required(),
        user_FK: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        Preference_Fk: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        numberRoom: Joi.number().integer().min(1).required(),
        washRoom: Joi.number().integer().min(1).required(),
        kitchen: Joi.boolean().required(),
        bedRoom: Joi.number().integer().min(1).required(),
        bedType: Joi.string().required(),
        Floor: Joi.number().integer().min(1).required(),
        imgs_Url: Joi.array().items(Joi.string().required())
    });

    return schema.validate(flat);
};

module.exports = FlatSchema;
