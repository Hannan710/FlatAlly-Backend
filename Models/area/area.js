const Mongoose = require("mongoose");

const area = new Mongoose.Schema({

    areaName: {
        type: String
    },

});

module.exports = Mongoose.model("area", area);