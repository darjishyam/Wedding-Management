const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For Render Free Tier / Serverless, it is better to create a FRESH connection
    // per email rather than pooling, because the server sleeps and kills idle connections.
    // Use Port 587 with IPv4 forced (Fix for Render/Gmail IPv6 timeouts)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        },
        family: 4, // Force IPv4
        connectionTimeout: 10000,
    });

    // Define the email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Support'} <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    return info;
};

module.exports = sendEmail;
