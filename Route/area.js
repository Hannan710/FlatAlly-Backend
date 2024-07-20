const Express = require("express");
const MyRouter = Express.Router();

const area = require("../Models/area/area");
const areaSchema = require("../Schema/area/area");

//get All
MyRouter.get("/", async (req, res) => {
    const C = await area.find();
    try {
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

MyRouter.post("/Add", async (req, res) => {
    const areaObj = req.body;
    const { error } = areaSchema(areaObj);
    // if (error) return res.status(400).send(error.details[0].message);

    if (error) {
        res.status(404).send({ message: error.details[0].message });
    }
    else {

        let newAreaObj = new area(areaObj);
        newAreaObj = await newAreaObj.save();
        res.send(newAreaObj);
    }
});

MyRouter.patch("/Update/:id", async (req, res) => {
    const areaObj = await area.findOne({ _id: req.params.id });
    areaObj.areaName = req.body.areaName;
    try {
        const C = await areaObj.save();
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

// Delete Data
MyRouter.delete("/Delete/:id", async (req, res) => {
    const deleteUsers = area.findOne({ _id: req.params.id });
    try {
        const C = await deleteUsers.remove();
        res.send(C);
    } catch (Error) {
        res.send("Error: " + Error);
    }
});


module.exports = MyRouter;
