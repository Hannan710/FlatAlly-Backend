const Express = require("express");
const MyRouter = Express.Router();

const UserDetails = require("../../Models/Users/Users");
const UserSchema = require("../../Schema/Users/Users");


const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleAuth = async (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const pwd = req.body.password;

    if (!email || !pwd) {
        return res.status(404).json({ "message": "User Email and Password is required" });
    }

    const foundUser = await UserDetails.findOne({ email: email }).exec();
    // console.log("ma error hun",foundUser);

    // if (!foundUser) return res.status(401).json({ "message": "User does't exist" });
    if (!foundUser) return res.status(404).json({ "message": "User does't exist" });
    // console.log("kunjum kunjum");

    const match = await bcrypt.compare(pwd, foundUser.password);

    if (match) {

        // console.log(foundUser)
        // const roles = Object.values(foundUser.roles)

        //saving token
        const accessToken = jwt.sign(
            {
                "Userinfo": foundUser
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "2h"  // in production make it 5 min or 10min 
            }

        );


        const refreshToken = jwt.sign(
            { "id": foundUser._id },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "5d"  // in production make it 5 min or 10min 
            }
        );

        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        // console.log(result);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            // maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({ accessToken, account_type: result.accountType });
    } else {
        res.status(401).json({ "message": "Unauthorized: Password does not match" });
    };

}


MyRouter.post("/", handleAuth);


module.exports = MyRouter;


// module.exports={handleAuth}