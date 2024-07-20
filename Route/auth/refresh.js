const express = require('express');
const router = express.Router();

const userDB = require("../../Models/Users/Users");

const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {

    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.status(400).json({ "message": "you don't have cookies" });
    }
    // console.log(cookies.jwt);

    const refreshToken = cookies.jwt;

    const foundUser = await userDB.findOne({ refreshToken: refreshToken }).exec();
    // console.log("ma error hun",foundUser);

    if (!foundUser) return res.status(400).json({ "message": "User does't exist" });
    // console.log("kunjum kunjum");

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {

            console.log(foundUser._id, decoded.id);

            if (err || foundUser._id != decoded.id) return res.sendStatus(403);



            const accessToken = jwt.sign(
                {
                    "Userinfo": foundUser
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '2h' }
            );
            res.json({ accessToken })
        }
    )
}





router.get('/', handleRefreshToken);

module.exports = router;