require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

axios.get(url)
    .then(response => {
        const geminiModels = response.data.models
            .filter(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace('models/', ''));

        console.log("AVAILABLE_MODELS:", geminiModels.join(', '));
    })
    .catch(err => console.error("ERROR"));
