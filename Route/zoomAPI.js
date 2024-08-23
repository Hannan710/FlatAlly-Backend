const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

const Token = require('../Models/Token'); // Your Token model


dotenv.config();

const router = express.Router();
const { ZOOM_API_KEY,
    ZOOM_API_SECRET,
    ZOOM_CLIENT_ID,
    ZOOM_CLIENT_SECRET,
    REDIRECT_URI,
    REDIRECT_URI_Old } = process.env;

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
    const redirectUri = REDIRECT_URI_Old;
    // const redirectUri = REDIRECT_URI;
    // console.log(redirectUri)
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
});

router.get("/auth/callbackOld",
    async (req, res) => {
        const { code } = req.query;
        const redirectUri = REDIRECT_URI; // Ensure this matches the redirect URI set in your Zoom app settings

        // console.log('Basic ' + Buffer.from(ZOOM_CLIENT_ID + ':' + ZOOM_CLIENT_SECRET).toString('base64'))

        try {
            const response = await axios.post('https://zoom.us/oauth/token', null, {
                params: {
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: redirectUri,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(ZOOM_CLIENT_ID + ':' + ZOOM_CLIENT_SECRET).toString('base64')
                },
            });

            const { access_token } = response.data;
            // Save access_token securely, e.g., in a database or session
            res.json({ access_token });
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            res.status(500).send('Error getting access token');
        }
    }
);

router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing' });
    }

    try {
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                // redirect_uri: REDIRECT_URI
                redirect_uri: REDIRECT_URI_Old
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        // Save tokens to the database
        const token = new Token({
            access_token,
            refresh_token,
            expires_in,
            created_at: new Date()
        });

        await token.save();

        res.json({ message: 'Token saved successfully', access_token });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
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


router.get("/get-user", async (req, res) => {
    console.log(res.body);
    const { accessToken } = req.body;
    console.log(accessToken);

    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error(error.response.data);
        res.status(500).send('Error fetching user information');
    }
});


module.exports = router;
