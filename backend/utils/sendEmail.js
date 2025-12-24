const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For Render Free Tier / Serverless, it is better to create a FRESH connection
    // per email rather than pooling, because the server sleeps and kills idle connections.
    // Use standard settings with explicit timeouts to debug latency
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        // Increase timeouts for slow shared hosting
        connectionTimeout: 20000, // 20 seconds
        greetingTimeout: 20000,
        socketTimeout: 20000,
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
