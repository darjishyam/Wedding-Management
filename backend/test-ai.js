require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

console.log("Checking API Key:", apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting Model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log(`✅ SUCCESS with ${modelName}:`, response.text());
        return true;
    } catch (error) {
        console.error(`❌ FAILED with ${modelName}:`, error.message);
        return false;
    }
}

async function run() {
    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro-latest"];

    for (const m of models) {
        await testModel(m);
    }
}

run();
