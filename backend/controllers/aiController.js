const { GoogleGenerativeAI } = require("@google/generative-ai");
const Wedding = require('../models/Wedding');
const Expense = require('../models/Expense');
const axios = require('axios');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to find the best available model
async function getBestModelName() {
    let modelNames = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    try {
        const fetch = global.fetch || require('node-fetch');
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const listResp = await fetch(listUrl);
        if (listResp.ok) {
            const listData = await listResp.json();
            const available = listData.models
                .filter(m => m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));

            if (available.length > 0) {
                const flash = available.find(m => m.includes("flash"));
                const pro = available.find(m => m.includes("pro"));
                modelNames = [flash || pro || available[0], ...modelNames];
            }
        }
    } catch (e) {
        console.warn("Failed to fetch model list dynamically, using fallback:", e.message);
    }
    // Dedup and return
    return [...new Set(modelNames)].filter(Boolean);
}

// Helper: Attempt generation with fallback
async function generateWithFallback(promptParts, logPrefix = "AI") {
    const modelNames = await getBestModelName();
    let lastError = null;

    for (const name of modelNames) {
        try {
            console.log(`${logPrefix}: Attempting to generate with model: ${name}`);
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent(promptParts);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.warn(`${logPrefix}: Model ${name} failed:`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error("All AI models failed to respond.");
}

const getWeddingAdvice = async (req, res) => {
    console.log("AI Advice Request Received for:", req.body.weddingId);
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in environment variables");
        }

        const { weddingId } = req.body;

        // Fetch Context
        const wedding = await Wedding.findById(weddingId);
        if (!wedding) {
            console.error("Wedding not found for ID:", weddingId);
            return res.status(404).json({ message: 'Wedding not found' });
        }

        const expenses = await Expense.find({ wedding: weddingId });
        const totalSpent = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

        // Construct Prompt
        const prompt = `
        Act as an expert Wedding Planner AI for an Indian Wedding.
        Here are the details of the wedding:
        - Type: ${wedding.type}
        - Groom: ${wedding.groomName}
        - Bride: ${wedding.brideName}
        - Date: ${new Date(wedding.date).toDateString()}
        - Total Budget: ₹${wedding.totalBudget}
        - Currently Spent: ₹${totalSpent}
        - Location: ${wedding.location}

        Please provide a concise 3-point advice summary:
        1. Budget Status (Are they on track? Any warnings?)
        2. Timeline Tip (Based on the date, what is the #1 priority right now?)
        3. A creative idea for this specific location/type.

        Keep the tone professional yet warm. Keep it under 150 words.
        `;

        const text = await generateWithFallback(prompt, "AI Advice");
        console.log("AI Advice Generated Successfully");
        res.json({ advice: text });

    } catch (error) {
        console.error("AI Error generating advice:", error);
        res.status(500).json({
            message: "Failed to generate AI advice",
            error: error.message,
            details: error.toString()
        });
    }
};

// Helper to convert URL to Gemini-compatible part
async function urlToGenerativePart(url) {
    console.log("Fetching image from URL:", url);
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        const base64Data = Buffer.from(response.data).toString('base64');

        console.log(`Image fetched. MIME: ${mimeType}, Size: ${base64Data.length} chars`);

        return {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };
    } catch (error) {
        console.error("Error fetching image for AI:", error.message);
        throw new Error("Failed to download image for analysis");
    }
}

const generatePackageDescription = async (req, res) => {
    console.log("AI Package Description Request Received");
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        const { imageUrl, name, type } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const imagePart = await urlToGenerativePart(imageUrl);

        const prompt = `
        You are an elite wedding planner creating a marketing description for a wedding package.
        
        Package Name: ${name || "Wedding Package"}
        Type: ${type || "General"}

        Look at the uploaded image of the venue/decor. 
        Describe the visual style, atmosphere, and key details (colors, lighting, seating, floral arrangements) seen in the photo.
        
        Write a captivating, professional 2-3 sentence description that would sell this package to a couple. 
        Focus on the "vibe" and "elegance".
        `;

        const text = await generateWithFallback([prompt, imagePart], "AI Description");
        res.json({ description: text });

    } catch (error) {
        console.error("AI Description Error:", error);
        res.status(500).json({ message: "Failed to generate description", error: error.message });
    }
};

const ChatHistory = require('../models/ChatHistory');

// ... existing code ...

const chatWithAI = async (req, res) => {
    try {
        const { message, weddingId } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        // Save User Message
        // We might not have userId directly in body, but can get from req.user if protected. 
        // For now, assume protected route or just store weddingId.
        // Ideally this route should be protected.

        await ChatHistory.create({
            wedding: weddingId,
            sender: 'user',
            message: message,
            // user: req.user?._id // If available
        });

        // Fetch Context
        const wedding = await Wedding.findById(weddingId);
        let context = "";

        if (wedding) {
            const expenses = await Expense.find({ wedding: weddingId });
            const totalSpent = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

            context = `
            Context: Indian Wedding Planning.
            Wedding Details:
            - Couple: ${wedding.groomName} & ${wedding.brideName}
            - Date: ${new Date(wedding.date).toDateString()}
            - Location: ${wedding.location}
            - Type: ${wedding.type}
            - Budget: ₹${wedding.totalBudget} (Spent: ₹${totalSpent})
            `;
        }

        const prompt = `
        ${context}
        
        User Query: "${message}"
        
        Role: You are an expert Indian Wedding Planner Assistant. 
        Answer the user's query professionally, concisely, and helpfully.
        If the query is about budget, use the provided financial context.
        If the query is generic, provide general expert advice.
        Keep answers short (under 100 words) unless asked for a list.
        `;

        const text = await generateWithFallback(prompt, "AI Chat");

        // Save AI Response
        await ChatHistory.create({
            wedding: weddingId,
            sender: 'ai',
            message: text
        });

        res.json({ response: text });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ message: "Failed to process chat", error: error.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const { weddingId } = req.params;
        const history = await ChatHistory.find({ wedding: weddingId }).sort({ createdAt: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWeddingAdvice, generatePackageDescription, chatWithAI, getChatHistory };
