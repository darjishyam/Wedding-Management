const { GoogleGenerativeAI } = require("@google/generative-ai");
const Wedding = require('../models/Wedding');
const Expense = require('../models/Expense');
const Event = require('../models/Event');
const Vendor = require('../models/Vendor');
const Guest = require('../models/Guest');
const Shagun = require('../models/Shagun');
const axios = require('axios');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to find the best available model
async function getBestModelName() {
    let modelNames = ["gemini-1.5-flash", "gemini-1.5-pro"];
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
            console.log(`\n[AI] Attempting ${logPrefix} with model: ${name}`);
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

const chatWithAI = async (req, res) => {
    try {
        const { message, weddingId } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        await ChatHistory.create({
            wedding: weddingId,
            sender: 'user',
            message: message,
        });

        // Fetch Context
        const wedding = await Wedding.findById(weddingId);
        let context = "";

        if (wedding) {
            const expenses = await Expense.find({ wedding: weddingId });
            const totalSpent = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

            // Fetch Events
            const eventList = await Event.find({ wedding: weddingId }).sort({ date: 1 });
            const eventContext = eventList.map(e => `- ${e.name} on ${new Date(e.date).toDateString()} at ${e.time || 'Time TBD'}`).join('\n');

            // Fetch Vendors
            const vendors = await Vendor.find({ wedding: weddingId });
            const vendorContext = vendors.length > 0
                ? vendors.map(v => `- ${v.name} (${v.category}): Total ₹${v.totalAmount}, Paid ₹${v.paidAmount}, Status: ${v.status}`).join('\n')
                : "No vendors added yet.";

            // Fetch Guests
            const guestList = await Guest.find({ wedding: weddingId });
            const guestStats = {
                total: guestList.reduce((sum, g) => sum + (g.familyCount || 1), 0),
                invited: guestList.filter(g => g.status === 'Invited').length,
                pending: guestList.filter(g => g.status === 'Pending').length,
                confirmed: guestList.filter(g => g.status === 'Confirmed').length,
            };

            // Fetch Shagun
            const shagunList = await Shagun.find({ wedding: weddingId });
            const totalShagun = shagunList.reduce((sum, s) => sum + (s.amount || 0), 0);

            context = `
            Context: Indian Wedding Planning.
            Wedding Details:
            - Couple: ${wedding.groomName} & ${wedding.brideName}
            - Date: ${new Date(wedding.date).toDateString()}
            - Location: ${wedding.location}
            - Type: ${wedding.type}
            - Budget: ₹${wedding.totalBudget} (Spent so far: ₹${totalSpent})
            
            Current Event Schedule:
            ${eventContext || "No events planned yet."}

            Vendor Payment Status:
            ${vendorContext}

            Guest Statistics:
            - Total Headcount: ${guestStats.total}
            - Invited: ${guestStats.invited}
            - Pending RSVPs: ${guestStats.pending}
            - Confirmed: ${guestStats.confirmed}

            Shagun (Chandlo) Collection:
            - Total Amount Collected: ₹${totalShagun}
            - Number of Entries: ${shagunList.length}
            `;
        }

        console.log("--- AI CHAT DEBUG ---");
        console.log("Wedding ID:", weddingId);
        console.log("Context:\n", context);
        console.log("-----------------------");

        const prompt = `
        ${context}
        
        User Query: "${message}"
        
        Role: You are a versatile AI Assistant integrated into a Wedding Management app. 
        While your primary expertise is as an expert Indian Wedding Planner, you should also be helpful with general queries or casual conversation from the user.
        
        CRITICAL: If the user asks about vendor payments, use the "Vendor Payment Status" section above. 
        List the specific vendors that are "Pending" or "Partial" if they ask which ones are not done yet.
        
        Answer professionally, concisely, and helpfully.
        Keep answers short (under 120 words) unless asked for a list.
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

const generateTimeline = async (req, res) => {
    console.log("AI Timeline Generation Request");
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        const { date, daysCount = 3, type = "Indian" } = req.body;
        const weddingDate = new Date(date);

        const prompt = `
        Act as an expert Indian Wedding Scheduler.
        The wedding is on: ${weddingDate.toDateString()} (${type} style).
        
        Generate a detailed ${daysCount}-day timeline leading up to the wedding.
        Include traditional events like Haldi, Mehendi, Sangeet/Garba, Mandap Muhurat, and the Wedding Ceremony itself.
        
        Rules:
        1. Haldi: Usually Morning, 1 day before wedding.
        2. Mehendi: Afternoon/Evening, 1-2 days before.
        3. Sangeet/Garba: Night, 1 day before.
        4. Mandap Muhurat / Grah Shanti: Morning, 1 day before OR same day early morning.
        5. Wedding: The main event.

        Output strictly valid JSON array format WITHOUT markdown blocks. 
        Each object must have:
        - "name" (Event Title)
        - "date" (ISO String YYYY-MM-DD)
        - "time" (e.g. "10:00 AM")
        - "venue" (Generic suggestion like "Home", "Banquet Hall")
        - "description" (Short 1-line description)

        Example structure:
        [
            {"name": "Haldi Ceremony", "date": "2024-01-01", "time": "10:00 AM", "venue": "Home Courtyard", "description": "Applying turmeric paste."}
        ]
        `;

        const text = await generateWithFallback(prompt, "AI Timeline");

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const events = JSON.parse(jsonString);

        res.json({ timeline: events });

    } catch (error) {
        console.error("AI Timeline Error:", error);
        res.status(500).json({ message: "Failed to generate timeline", error: error.message });
    }
};

const askAI = async (req, res) => {
    try {
        const { prompt, context } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        const fullPrompt = `
        Context: ${context || "General"}
        request: ${prompt}
        
        Keep it concise and creative.
        `;

        const text = await generateWithFallback(fullPrompt, "AI Ask");
        res.json({ response: text });

    } catch (error) {
        console.error("AI Ask Error:", error);
        res.status(500).json({ message: "Failed to generate response", error: error.message });
    }
};

const generateBudgetBreakdown = async (req, res) => {
    try {
        const { totalBudget, weddingId } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        const wedding = await Wedding.findById(weddingId);
        const weddingType = wedding ? wedding.type : "Indian";

        const prompt = `
        Act as a professional Indian Wedding Financial Planner.
        The user wants to plan a wedding with a total budget of ₹${totalBudget}.
        The wedding type is: ${weddingType}.
        
        Generate a detailed cost breakdown for this budget.
        Use these categories strictly: Catering, Decoration, Photography, Venue, Makeup, Music, Other.
        
        Rules:
        1. Venue should be around 25-30% of total.
        2. Catering should be around 35-40%.
        3. Ensure the total sum of "amount" fields exactly equals ₹${totalBudget}.
        
        Output strictly valid JSON array format WITHOUT markdown blocks.
        Each object must have:
        - "title" (e.g. "Premium Catering Services")
        - "amount" (Number)
        - "category" (Must be one of: Catering, Decoration, Photography, Venue, Makeup, Music, Other)
        - "description" (Short 1-line reason why this amount was allocated)

        Example:
        [
            {"title": "Grand Venue Booking", "amount": 250000, "category": "Venue", "description": "Includes hall and basic lighting."}
        ]
        `;

        const text = await generateWithFallback(prompt, "AI Budget Suggestion");
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const suggestions = JSON.parse(jsonString);

        res.json({ suggestions });

    } catch (error) {
        console.error("AI Budget Suggestion Error:", error);
        res.status(500).json({ message: "Failed to generate budget breakdown", error: error.message });
    }
};

const applyBudgetBreakdown = async (req, res) => {
    console.log("[AI] Applying Budget. Wedding ID:", req.body.weddingId);
    try {
        const { weddingId, suggestions, totalBudget } = req.body;

        if (!weddingId || !suggestions || !Array.isArray(suggestions)) {
            console.error("[AI] Invalid apply-budget data:", { weddingId, totalBudget, suggestionCount: suggestions?.length });
            return res.status(400).json({ message: "Invalid request data" });
        }

        // 1. Update Wedding Total Budget
        const wedding = await Wedding.findById(weddingId);
        if (!wedding) {
            return res.status(404).json({ message: "Wedding not found" });
        }
        wedding.totalBudget = totalBudget;
        await wedding.save();

        // 2. Prepare Expenses
        const expenseDocs = suggestions.map(s => ({
            wedding: weddingId,
            title: `AI: ${s.title}`,
            amount: s.amount,
            category: s.category,
            date: new Date()
        }));

        // 3. Insert in Bulk
        const results = await Expense.insertMany(expenseDocs);

        res.json({
            message: "Budget applied successfully!",
            expensesAdded: results.length,
            newTotalBudget: wedding.totalBudget
        });

    } catch (error) {
        console.error("AI Budget Application Error:", error);
        res.status(500).json({ message: "Failed to apply budget", error: error.message });
    }
};

module.exports = { 
    getWeddingAdvice, 
    generatePackageDescription, 
    chatWithAI, 
    getChatHistory, 
    generateTimeline, 
    askAI,
    generateBudgetBreakdown,
    applyBudgetBreakdown
};
