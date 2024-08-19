const Express = require("express");
const MyRouter = Express.Router();

const users = require("../Models/Users/Users");

const Flat = require('../Models/FlatModel');
const PreferencesModel = require("../Models/PreferencesModel");


//get one
MyRouter.get("/", async (req, res) => {
    const UserData = await users.findOne({ _id: req.id }).populate('area_FK');
    const FlatData = await Flat.findOne({ user_FK: req.id });
    const PreferencesModelData = await PreferencesModel.findOne({ user_FK: req.id });
    // const UserData = await users.findOne({ _id: req.id });  i want to add Meetings Here
    try {
        res.send({
            UserData,
            PreferencesModelData,
            FlatData,
        });
    } catch (err) {
        res.send("Error: " + err);
    }
});

module.exports = MyRouter;
