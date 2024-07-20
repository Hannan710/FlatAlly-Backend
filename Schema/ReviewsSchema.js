const Joi = require("joi");

const ReviewsSchema = (Reviews) => {
    const schema = Joi.object({
        softDelete: Joi.string(),
        user_FK: Joi.string(),
        ReviewsDescription: Joi.string(),
    });
    return schema.validate(Reviews);
};

module.exports = ReviewsSchema;
