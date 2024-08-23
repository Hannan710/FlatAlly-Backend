const express = require('express');
const router = express.Router();
const User = require('../Models/Users/Users');
const Meeting = require('../Models/Meeting');
const axios = require('axios');
const nodemailer = require('nodemailer');
const getZoomToken = require('../middleWare/getZoomToken');



const { accessToken, userId } = process.env;

// Utility function to send emails
async function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'usamafaheemahmed80@gmail.com',
            pass: 'kfjv ogcu fypj bwlv' // Ensure this is stored securely
        }
    });

    const mailOptions = {
        from: 'usamafaheemahmed80@gmail.com',
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error; // Rethrow the error so that it can be handled later if necessary
    }
}

// POST route to schedule a meeting between two users
// router.post('/scheduleMeeting', async (req, res) => {
//     try {
//         console.log('Request body:', req.body);

//         const { user2Id } = req.body; // Corrected destructuring
//         const user1Id = req.id;
//         const meetingTime = new Date();

//         console.log(`user1Id: ${user1Id}, user2Id: ${user2Id}, meetingTime: ${meetingTime}`);

//         // Validate the input
//         if (!user1Id || !user2Id || !meetingTime) {
//             console.log('Missing required fields');
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         // Fetch the user data
//         const user1 = await User.findById(user1Id);
//         const user2 = await User.findById(user2Id);

//         if (!user1 || !user2) {
//             console.log('User not found');
//             return res.status(404).json({ message: 'User not found' });
//         }

//         console.log(`Fetched user1: ${user1.email}, user2: ${user2.email}`);

//         const meetingDetails = {
//             topic: "Test Meeting",
//             type: 2,
//             start_time: meetingTime,
//             duration: 30,
//             timezone: "UTC",
//             settings: {
//                 host_video: true,
//                 participant_video: true,
//                 join_before_host: true
//             }
//         };

//         // Get the base URL from the current request
//         const baseURL = `${req.protocol}://${req.get('host')}`;
//         console.log('Base URL:', baseURL);

//         // Construct the full URL for the API call
//         const apiUrl = `${baseURL}/api/zoomAPI/create-meeting`;
//         console.log('API URL:', apiUrl);

//         // Call the Zoom API to create a meeting
//         const apiResponse = await axios.post(apiUrl, {
//             accessToken,
//             userId,
//             meetingDetails
//         });

//         console.log('API Response:', apiResponse.data);

//         const responseData = apiResponse.data;

//         // Store the meeting information
//         const meeting = new Meeting({
//             user1: user1Id,
//             user2: user2Id,
//             meetingTime,
//             meetingLink: responseData.join_url // Replace with the actual meeting link from Zoom API response
//         });

//         await meeting.save();
//         console.log('Meeting saved to database:', meeting);

//         // Send emails to both users with the meeting details
//         const emailSubject = 'Your Meeting Details';
//         const emailText = `Your meeting has been scheduled. Details:\n\n${JSON.stringify(responseData, null, 2)}`;

//         await sendEmail(user1.email, emailSubject, emailText);
//         await sendEmail(user2.email, emailSubject, emailText);

//         res.json({ message: 'Meeting scheduled and emails sent', meeting, apiResponse: responseData });
//     } catch (error) {
//         console.error('Error scheduling meeting:', error.message);
//         res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
//     }
// });

router.post('/scheduleMeeting', getZoomToken, async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const { user2Id } = req.body;
        const user1Id = req.id;
        const meetingTime = new Date();

        if (!user1Id || !user2Id || !meetingTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user1 = await User.findById(user1Id);
        const user2 = await User.findById(user2Id);

        if (!user1 || !user2) {
            return res.status(404).json({ message: 'User not found' });
        }

        const meetingDetails = {
            topic: "Test Meeting",
            type: 2,
            start_time: meetingTime,
            duration: 30,
            timezone: "UTC",
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true
            }
        };


        const apiUrl = `${req.protocol}://${req.get('host')}/api/zoomAPI/create-meeting`;
        console.log('Request body:', apiUrl);
        console.log('User Id:', userId);

        const apiResponse = await axios.post(apiUrl, {
            accessToken: req.zoomAccessToken,
            userId: userId,
            meetingDetails
        });

        const responseData = apiResponse.data;

        const meeting = new Meeting({
            user1: user1Id,
            user2: user2Id,
            meetingTime,
            meetingLink: responseData.join_url
        });

        await meeting.save();

        res.json({ message: 'Meeting scheduled and emails sent', meeting, apiResponse: responseData });
    } catch (error) {
        console.error('Error scheduling meeting:', error.message);
        res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
    }
});


module.exports = router;
