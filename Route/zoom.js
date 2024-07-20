const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const Meeting = require('../Models/Meeting');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, JWT_SECRET } = process.env;

//get All for User
router.get("/", async (req, res) => {

    console.log(req)
    res.send("what the hell");

});

router.get('/oauth/redirect', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
            },
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET,
            },
        });

        const { access_token } = response.data;
        const token = jwt.sign({ access_token }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('zoom_access_token', token, { httpOnly: true });
        res.redirect('/'); // Redirect to the frontend
    } catch (error) {
        res.status(500).send('Error during OAuth process');
    }
});

const authenticate = (req, res, next) => {
    const token = req.cookies.zoom_access_token;
    if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Forbidden');
        req.access_token = decoded.access_token;
        next();
    });
};

router.post('/create-meeting', authenticate, async (req, res) => {
    const { topic } = req.body;
    const { userId } = req.id;

    try {
        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic,
                type: 1,
                settings: {
                    host_video: true,
                    participant_video: true,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${req.access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const meeting = new Meeting({
            topic: response.data.topic,
            start_url: response.data.start_url,
            join_url: response.data.join_url,
            created_at: response.data.created_at,
            createdBy: userId,
        });

        await meeting.save();
        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
