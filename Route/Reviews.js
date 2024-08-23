const Express = require("express");
const MyRouter = Express.Router();

const ReviewsModel = require("../Models/ReviewsModel");
const ReviewsSchema = require("../Schema/ReviewsSchema");

const users = require("../Models/Users/Users");

//get All for User
MyRouter.get("/", async (req, res) => {
    const C = await ReviewsModel.find({ softDelete: false }).populate("user_FK", "userName imageUrl");
    try {
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

//get one
MyRouter.get("/:id", async (req, res) => {
    const C = await ReviewsModel.find({ user_FK: req.params.id, softDelete: false }).populate("user_FK", "userName imageUrl");
    try {
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

MyRouter.post("/Add", async (req, res) => {
    console.log("Ma chala")
    const reviewsObj = req.body;
    reviewsObj.user_FK = req.id;
    const { error } = ReviewsSchema(reviewsObj);
    // if (error) return res.status(400).send(error.details[0].message);

    if (error) {
        res.status(404).send({ message: error.details[0].message });
    }
    else {
        const existingUser = await users.findOne({ _id: reviewsObj.user_FK });
        if (!existingUser) {
            return res.status(409).send({ message: "User not found" });
        }

        let newAreaObj = new ReviewsModel(reviewsObj);
        newAreaObj = await newAreaObj.save();
        res.send(newAreaObj);
    }
});

MyRouter.patch("/Update/:id", async (req, res) => {
    const reviewsObj = await ReviewsModel.findOne({ _id: req.params.id });
    reviewsObj.reviewsName = req.body.reviewsName;
    try {
        const C = await reviewsObj.save();
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

// Delete Data
MyRouter.delete("/Delete/:id", async (req, res) => {
    const deleteUsers = ReviewsModel.findOne({ _id: req.params.id });
    try {
        const C = await deleteUsers.remove();
        res.send(C);
    } catch (Error) {
        res.send("Error: " + Error);
    }
});


module.exports = MyRouter;
