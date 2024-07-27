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
    let obj = {
        "CLIENT_ID": CLIENT_ID,
        "CLIENT_SECRET": CLIENT_SECRET,
        "REDIRECT_URI": REDIRECT_URI,
        "JWT_SECRET": JWT_SECRET,
    }
    res.send(obj);

});

router.get('/oauth/redirect', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Missing code parameter');
    }
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
        console.log(response)
        const { access_token } = response.data;
        const token = jwt.sign({ access_token }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('zoom_access_token', token, { httpOnly: true });
        res.redirect('/'); // Redirect to the frontend
    } catch (error) {
        if (error.response) {
            console.error('Error during OAuth process:', error.response.data);
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            console.error('Error during OAuth process:', error.request);
            res.status(500).send('No response from Zoom OAuth server');
        } else {
            console.error('Error during OAuth process:', error.message);
            res.status(500).send(error.message);
        }
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
