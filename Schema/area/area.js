const Joi = require("joi");

const areaSchema = (area) => {
    const schema = Joi.object({
        areaName: Joi.string(),
    });
    return schema.validate(area);
};

module.exports = areaSchema;
