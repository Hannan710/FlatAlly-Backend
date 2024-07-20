const express = require('express');
const router = express.Router();

//  remember you must change 400 status to 204 in deployment here 


const userDB = require("../../Models/Users/Users");
const UserSchema = require("../../Schema/Users/Users");

const handleLogout = async (req, res) => {
    // when client also delete the accessToken or want to log out
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.status(400).json({ "message": "No Cookies found" });
    }
    console.log(cookies.jwt);

    const refreshToken = cookies.jwt;

    const foundUser = await userDB.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true });
        return res.status(400).json({ "message": "User does't exist" });
    }

    foundUser.refreshToken = "";
    const result = await foundUser.save();
    console.log(result);
    

    res.clearCookie('jwt', { httpOnly: true, sameSite:"None", secure:true }); //secure :true -only server on https!
    res.status(400).json({"massage":"logged out"});

}


router.get('/', handleLogout);

module.exports = router;