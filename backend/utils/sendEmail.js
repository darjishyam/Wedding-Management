const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
// We use 'pool: true' to keep connections open and reduce overhead
const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 1, // Keep low for free tiers to avoid rate limiting
    rateLimit: 1, // 1 email per second max (approx)
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Optional: Verify connection configuration on startup
transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

// Handle idle connection errors to prevent crash
transporter.on('error', (err) => {
    console.error('SMTP Transport Error (Idle):', err.message);
});

const sendEmail = async (options) => {
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
