const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For Render Free Tier / Serverless, it is better to create a FRESH connection
    // per email rather than pooling, because the server sleeps and kills idle connections.
    // Brevo / Standard SMTP Configuration
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        // Explicit timeouts to avoid hanging connections
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
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
