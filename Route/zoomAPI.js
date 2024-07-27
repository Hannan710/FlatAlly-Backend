const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const { ZOOM_API_KEY, ZOOM_API_SECRET, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, REDIRECT_URI } = process.env;

const Meeting = require('../Models/Meeting');  // Assuming you have a Meeting model

// Route to check Zoom API credentials
router.get("/", (req, res) => {
    res.send({
        ZOOM_API_KEY,
        ZOOM_API_SECRET,
        ZOOM_CLIENT_ID,
        ZOOM_CLIENT_SECRET,
        REDIRECT_URI
    });
});

// OAuth authorization route
router.get("/auth", (req, res) => {
    const redirectUri = REDIRECT_URI;
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
});

// OAuth callback route
router.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    const redirectUri = REDIRECT_URI;

    try {
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            },
            auth: {
                username: ZOOM_CLIENT_ID,
                password: ZOOM_CLIENT_SECRET,
            },
        });

        const { access_token } = response.data;
        // Save access_token securely (e.g., in a database or session)
        // Here you might want to associate the token with a user in your database

        res.json({ access_token });
    } catch (error) {
        console.error(error.response.data);
        res.status(500).send('Error getting access token');
    }
});

// Route to create a meeting
router.post("/create-meeting", async (req, res) => {
    const { accessToken, userId, meetingDetails } = req.body;

    try {
        const response = await axios.post(`https://api.zoom.us/v2/users/${userId}/meetings`, meetingDetails, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error(error.response.data);
        res.status(500).send('Error creating meeting');
    }
});

module.exports = router;
