const Express = require("express");
const MyRouter = Express.Router();
const nodemailer = require('nodemailer');
const users = require("../Models/Users/Users");
const usersSchema = require("../Schema/Users/Users");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'hannantahir14@gmail.com',
        pass: 'wbfs dihz waec xvws'
    },
    tls: {
        rejectUnauthorized: false
    }
});


// HTML email template
const generateHtmlTemplate = (myObj) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            margin: 20px;
        }
		.container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #4CAF50;
      border-radius: 5px;
    }

        h1 {
            color: #3498db;
        }

        p {
            color: #555;
        }

        .code-container {
            background-color: #ecf0f1;
            padding: 10px;
            margin: 20px;
            border-radius: 5px;
        }

        .code {
            font-size: 20px;
            color: #2c3e50;
        }
    </style>
</head>
<body>
	<div class="container">
    <h1>Password Reset</h1>
    <p>We received a request to reset your password. Use the following code to complete the process:</p>
    
    <div class="code-container">
        <p class="code">Your reset code: ${myObj.OTP}</p>
    </div>

    <p>If you did not request a password reset, please ignore this email.</p>
</div>
</body>
</html>

`;

// Email content

MyRouter.post("/", async (req, res) => {
    const myObj = req.body;
    const userEmail = req.body.email;

    // Find the existing adviser by ID
    const usersData = await users.findOne({ email: userEmail });

    if (usersData) {
        return res.status(404).send({ message: "User Already Exists" });
    }

    const mailOptions = {
        from: 'hannantahir14@gmail.com',
        to: userEmail,
        subject: 'OTP Flatally',
        html: generateHtmlTemplate(myObj) // Include the HTML content here
    };
    try {
        // Send email
        // console.log('Email sent:');

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.send("Email sent");
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Error sending email");
    }
});

MyRouter.post("/ForgetPassword", async (req, res) => {
    const myObj = req.body;
    const userEmail = req.body.email;

    // Find the existing adviser by ID
    const usersData = await users.findOne({ email: userEmail });

    if (!usersData) {
        return res.status(404).send({ message: "User Nod Found" });
    }

    const mailOptions = {
        from: 'hannantahir14@gmail.com',
        to: userEmail,
        subject: 'OTP Flatally',
        html: generateHtmlTemplate(myObj) // Include the HTML content here
    };
    try {
        // Send email
        // console.log('Email sent:');

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.send("Email sent");
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Error sending email");
    }
});


module.exports = MyRouter;
