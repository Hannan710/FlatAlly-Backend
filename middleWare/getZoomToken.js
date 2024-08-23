// /middlewares/getZoomToken.js
const Token = require('../Models/Token');
const axios = require('axios');

module.exports = async (req, res, next) => {
    try {

        console.log("Middle Ware Ran")

        // Retrieve the latest token
        let token = await Token.findOne().sort({ created_at: -1 });

        // Check if the token exists
        if (!token) {
            return res.status(500).json({ message: 'No Zoom token found in the database' });
        }

        // Calculate the token expiry time
        const currentTime = Date.now();
        const tokenExpiryTime = new Date(token.created_at).getTime() + token.expires_in * 1000;

        console.log(token.refresh_token);

        // Check if the token has expired
        if (currentTime > tokenExpiryTime) {
            try {
                // Token has expired, attempt to refresh it
                const response = await axios.post('https://zoom.us/oauth/token', null, {
                    params: {
                        grant_type: 'refresh_token',
                        refresh_token: token.refresh_token
                    },
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
                    }
                });

                // Extract new tokens from the response
                const { access_token, refresh_token, expires_in } = response.data;

                // Update the token in the database
                token.access_token = access_token;
                token.refresh_token = refresh_token;
                token.expires_in = expires_in;
                token.created_at = new Date();

                await token.save();
            } catch (refreshError) {
                console.error('Error refreshing Zoom token:', refreshError.message);
                return res.status(500).json({ message: 'Error refreshing Zoom token', error: refreshError.message });
            }
        }

        // Assign the access token to the request object
        req.zoomAccessToken = token.access_token;
        next();
    } catch (error) {
        console.error('Error getting Zoom token:', error.message);
        res.status(500).json({ message: 'Error getting Zoom token', error: error.message });
    }
};
