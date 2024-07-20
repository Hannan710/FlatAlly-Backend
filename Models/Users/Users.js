
const Mongoose = require("mongoose");

const User = new Mongoose.Schema({
    userName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    gender: {
        type: String
    },
    address: {
        type: String
    },
    accountType: {
        type: String
    },
    imageUrl: {
        type: String
    },
    softDelete: {
        type: Boolean, // Use 'Boolean' instead of 'boolean' and import it from Mongoose
        default: false,
    },
    area_FK: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'area'
    },
    refreshToken: {
        type: String,
        default: "no token"
    }
});

module.exports = Mongoose.model("User", User);