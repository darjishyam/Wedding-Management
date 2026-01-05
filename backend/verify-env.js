const dotenv = require('dotenv');
dotenv.config();

console.log('--- ENV CHECK ---');
console.log('Loading .env file...');
if (process.env.BREVO_API_KEY) {
    console.log('SUCCESS: BREVO_API_KEY found!');
    console.log('Key starts with:', process.env.BREVO_API_KEY.substring(0, 5) + '...');
} else {
    console.log('ERROR: BREVO_API_KEY is missing!');
}
console.log('-----------------');
