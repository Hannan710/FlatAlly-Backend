// /Models/Token.js
const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    expires_in: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', TokenSchema);
