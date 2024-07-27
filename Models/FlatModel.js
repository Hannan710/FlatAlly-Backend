const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
    vocationFilled: { type: Boolean, default: true },

    user_FK: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Preference_Fk: { type: mongoose.Schema.Types.ObjectId, ref: 'Preference', required: true },

    numberRoom: { type: Number, required: true },
    washRoom: { type: Number, required: true },
    kitchen: { type: Boolean, required: true },
    bedRoom: { type: Number, required: true },
    bedType: { type: String, required: true },
    Floor: { type: Number, required: true },

    imgs_Url: [{ type: String, required: true }] // Array of image paths
    
}, { timestamps: true });

const Flat = mongoose.model('Flat', flatSchema);

module.exports = Flat;
