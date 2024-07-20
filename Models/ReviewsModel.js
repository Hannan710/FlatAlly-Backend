const mongoose = require('mongoose'); // Correct import for Mongoose

const ReviewsSchema = new mongoose.Schema({
    softDelete: {
        type: Boolean,
        default: false,
    },
    user_FK: {
        type: mongoose.Schema.Types.ObjectId, // Use 'mongoose' instead of 'Mongoose'
        ref: 'User',
        required: true, // Ensure this field is required
    },
    ReviewsDescription: { // Field names should be in camelCase
        type: String,
        required: true, // Ensure this field is required
    },
});

module.exports = mongoose.model("Reviews", ReviewsSchema);