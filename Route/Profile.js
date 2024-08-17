const Express = require("express");
const MyRouter = Express.Router();

const users = require("../Models/Users/Users");
const usersSchema = require("../Schema/Users/Users");

//get one
MyRouter.get("/", async (req, res) => {
    const C = await users.find({ _id: req.id }).populate('area_FK');
    try {
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

module.exports = MyRouter;
