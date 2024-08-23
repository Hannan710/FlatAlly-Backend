const Express = require("express");
const MyRouter = Express.Router();

const bcrypt = require('bcrypt');

const multer = require("multer");
const path = require("path");
const fs = require("fs").promises; // Import the fs module


const users = require("../Models/Users/Users");
const usersSchema = require("../Schema/Users/Users");

const area = require("../Models/area/area");
const areaSchema = require("../Schema/area/area");

const jwt = require('jsonwebtoken');
require('dotenv').config();


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/");
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Invalid file type. Only JPEG, PNG, and JPG files are allowed.")
        );
    }
};

var upload = multer({

    storage: storage,
    fileFilter: fileFilter,
    // fileFilter: function(req, file, callback)
});

MyRouter.post("/Add", upload.single("imageUrl"), async (req, res) => {
    const NewUser = {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        gender: req.body.gender,
        address: req.body.address,
        accountType: req.body.accountType,
        // imageUrl: req.body.imageUrl,
    };

    let areaValue = req.body.area;
    // NewUser.area = undefined;

    const { error } = usersSchema(NewUser); // Assuming usersSchema is a Joi schema
    if (error) {
        return res.status(400).send({ message: error.details[0].message });
    }

    try {
        const existingUser = await users.findOne({ email: NewUser.email });
        if (existingUser) {
            return res.status(409).send({ message: "User Already Exists" });
        }

        const hashedPwd = await bcrypt.hash(req.body.password, 10);
        NewUser.password = hashedPwd;

        let areaDoc = await area.findOne({ areaName: areaValue });
        if (!areaDoc) {
            const newArea = new area({ areaName: areaValue });
            areaDoc = await newArea.save();
        }

        NewUser.area_FK = areaDoc._id;

        let AddUser = new users(NewUser);

        if (req.file) {
            AddUser.imageUrl = req.file.path;
        }

        AddUser = await AddUser.save();

        const accessToken = jwt.sign(
            {
                "Userinfo": AddUser
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "2h"  // in production make it 5 min or 10min 
            }

        );


        res.status(201).json({ accessToken, account_type: AddUser.accountType });


        // res.send(AddUser);

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// Update Data 
MyRouter.patch("/Update/:id", async (req, res) => {
    try {

        const UpdateUsers = await users.findOne({ _id: req.params.id });
        // console.log(UpdateUsers);

        if (!UpdateUsers) {
            return res.status(404).send("User not found");
        }

        // Store the previous image path for deletion
        const previousImagePath = UpdateUsers.imageUrl;
        console.log(previousImagePath)


        let areaDoc = await area.findOne({ areaName: req.body.area });
        if (!areaDoc) {
            const newArea = new area({ areaName: req.body.area });
            areaDoc = await newArea.save();
        }

        let areaFk = areaDoc._id;

        Object.assign(UpdateUsers, {
            userName: req.body.userName || UpdateUsers.userName,
            email: req.body.email || UpdateUsers.email,
            password: req.body.password || UpdateUsers.password,
            phoneNumber: req.body.phoneNumber || UpdateUsers.phoneNumber,
            gender: req.body.gender || UpdateUsers.gender,
            address: req.body.address || UpdateUsers.address,
            accountType: req.body.accountType || UpdateUsers.accountType,
            area_FK: areaFk || UpdateUsers.area_FK,
        });

        console.log("UpdateUsers.ImageUrl= ", UpdateUsers);

        const C = await UpdateUsers.save();


        const UpdateUsers2 = await users.findOne({ _id: req.params.id }).populate('area_FK');

        res.send(UpdateUsers2);


    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }

});

//get All
MyRouter.get("/", async (req, res) => {
    const C = await users.find();
    try {
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

//get one
MyRouter.get("/:id", async (req, res) => {
    const C = await users.find({ _id: req.params.id }).populate('area_FK');
    try {
        res.send(C);
    } catch (err) {
        res.send("Error: " + err);
    }
});

// Delete Data
MyRouter.delete("/Delete/:id", async (req, res) => {
    const deleteUsers = users.findOne({ _id: req.params.id });
    try {
        const C = await deleteUsers.remove();
        res.send(C);
    } catch (Error) {
        res.send("Error: " + Error);
    }
});

// update Password

MyRouter.patch("/UpdatePassword", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await users.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        res.send("Password updated successfully");
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).send("Error: " + error.message);
    }
});


module.exports = MyRouter;
