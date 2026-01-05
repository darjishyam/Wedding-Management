require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching models from:", url.replace(apiKey, "HIDDEN_KEY"));

axios.get(url)
    .then(response => {
        console.log("✅ Models found:");
        response.data.models.forEach(m => console.log(` - ${m.name}`));
    })
    .catch(error => {
        console.error("❌ API Request Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    });
