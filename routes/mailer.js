require("dotenv").config();
const express = require("express");
const emailrouter = express.Router();
const nodemailer = require("nodemailer");

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com", // Adjust for your SMTP provider
            port: 465, 
            secure: true, 
            auth: {
                user: process.env.MailId,
                pass: process.env.MailPassword,
            },
        });

        const mailOptions = {
            from: process.env.MailId,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return { success: true, message: "Email sent successfully" };
    } catch (err) {
        console.error("Error sending email:", err);
        return { success: false, message: "Error sending email" };
    }
};

// Email API Endpoint
emailrouter.post("/send-email", async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !text || !html) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const result = await sendEmail(to, subject, text, html);
    if (result.success) {
        return res.status(200).json({ message: "Email sent successfully" });
    } else {
        return res.status(500).json({ error: "Error sending email" });
    }
});

module.exports = { emailrouter, sendEmail };
