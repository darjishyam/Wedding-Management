require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const DEBUG_EMAIL = 'professorshyam123@gmail.com';

async function testEmail() {
    console.log('--- STARTING EMAIL DEBUG (POOL TEST) ---');
    console.log('Target:', DEBUG_EMAIL);

    try {
        console.log('Attempting to send Email 1 (Cold Start)...');
        const start1 = Date.now();
        await sendEmail({
            email: DEBUG_EMAIL,
            subject: 'Debug Test Email 1 (Cold)',
            message: 'This is the first email (handshake).'
        });
        console.log(`Email 1 sent in ${(Date.now() - start1) / 1000}s`);

        console.log('Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Attempting to send Email 2 (Warm)...');
        const start2 = Date.now();
        await sendEmail({
            email: DEBUG_EMAIL,
            subject: 'Debug Test Email 2 (Warm)',
            message: 'This is the second email (reused connection). Should be fast.'
        });
        console.log(`Email 2 sent in ${(Date.now() - start2) / 1000}s`);

    } catch (error) {
        console.error('FAILED TO SEND EMAIL:', error);
    }
    console.log('--- END DEBUG ---');
}

testEmail();
