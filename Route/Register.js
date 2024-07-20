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
        res.send(AddUser);

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// Update Data 
MyRouter.patch("/Update/:id", upload.single("imageUrl"), async (req, res) => {
    try {

        const UpdateUsers = await users.findOne({ _id: req.params.id });
        // console.log(UpdateUsers);

        if (!UpdateUsers) {
            return res.status(404).send("User not found");
        }

        // Store the previous image path for deletion
        const previousImagePath = UpdateUsers.imageUrl;
        console.log(previousImagePath)
        // Update fields
        // UpdateUsers.set({
        //     userName: req.body.userName ? req.body.userName : UpdateUsers.userName,
        //     email: req.body.email ? req.body.email : UpdateUsers.email,
        //     password: req.body.password ? req.body.password : UpdateUsers.password,
        //     phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : UpdateUsers.phoneNumber,
        //     gender: req.body.gender ? req.body.gender : UpdateUsers.gender,
        //     address: req.body.address ? req.body.address : UpdateUsers.address,
        //     accountType: req.body.accountType ? req.body.accountType : UpdateUsers.accountType,
        //     imageUrl: req.body.imageUrl ? req.body.imageUrl : UpdateUsers.imageUrl,
        //     area_FK: req.body.area_FK ? req.body.area_FK : UpdateUsers.area_FK,
        // });
        // Update fields
        Object.assign(UpdateUsers, {
            userName: req.body.userName || UpdateUsers.userName,
            email: req.body.email || UpdateUsers.email,
            password: req.body.password || UpdateUsers.password,
            phoneNumber: req.body.phoneNumber || UpdateUsers.phoneNumber,
            gender: req.body.gender || UpdateUsers.gender,
            address: req.body.address || UpdateUsers.address,
            accountType: req.body.accountType || UpdateUsers.accountType,
            area_FK: req.body.area_FK || UpdateUsers.area_FK,
        });


        // // Update the image if a new one is provided
        // if (req.file) {
        //     // Check if the file with the same name already exists
        //     const existingFilePath = path.join("images", req.file.filename);
        //     if (await fs.access(existingFilePath).then(() => true).catch(() => false)) {
        //         // File with the same name exists, generate a new unique filename
        //         const newFileName = Date.now() + path.extname(req.file.originalname);
        //         UpdateUsers.imageUrl = path.join("images", newFileName);
        //         await fs.rename(existingFilePath, path.join("images", newFileName));
        //     } else {
        //         // File doesn't exist, use the provided filename
        //         UpdateUsers.imageUrl = req.file.path;
        //     }
        // } else {
        //     let url = req.body.imageUrl;
        //     let desiredPart = url.split("/images/")[1];
        //     console.log(desiredPart, url)
        //     UpdateUsers.imageUrl = desiredPart;
        // }


        // Update the image if a new one is provided
        if (req.file) {
            UpdateUsers.imageUrl = req.file.path;
        } else if (req.body.imageUrl) {
            let url = req.body.imageUrl;
            let desiredPart = url.split("/images/")[1];
            UpdateUsers.imageUrl = path.join("images", desiredPart);
        }

        console.log("UpdateUsers.ImageUrl= ", UpdateUsers);

        const C = await UpdateUsers.save();
        res.send(C);


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


module.exports = MyRouter;
