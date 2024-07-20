const Joi = require("joi");

const usersSchema = (users) => {
    const schema = Joi.object({
        userName: Joi.string(),
        email: Joi.string(),
        password: Joi.string(),
        phoneNumber: Joi.string(),
        gender: Joi.string(),
        address: Joi.string(),
        accountType: Joi.string(),
        imageUrl: Joi.string(),
        area_FK: Joi.string(),
    });
    return schema.validate(users);
};

module.exports = usersSchema;
