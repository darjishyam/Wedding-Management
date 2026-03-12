const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let weddingIdToDelete = '';

const loginAdmin = async () => {
    try {
        // Assuming there is a known admin user or create one. 
        // For this test, I'll assume usage of an existing admin or I'll register one.
        // Actually, let's just try to login with a known admin.
        // If not, we might need to create one first.
        // Let's assume standard admin credentials or create a new user and make them admin manually if needed.
        // For simplicity, I'll register a new user and force update them to admin if I could, 
        // but since I don't have direct DB access here, I will assume the user has a way to get a token 
        // OR I will just use the login endpoint if I know the creds.

        // BETTER APPROACH: Use the existing auth flow.
        // I will Register a new user, then manually update their role in DB (mocking this part or assuming it works).
        // Wait, I can't update DB directly from this script without mongoose.

        // Let's rely on the fact that I can login as an existing user.
        // I'll try to login as 'admin@example.com' / '123456'.
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'password123'
        });
        adminToken = res.data.token;
        console.log('Admin logged in.');
    } catch (error) {
        console.log('Login failed (expected if admin not exists):', error.message);
        // Fallback: This script might fail if no admin exists.
        // I will skip login and assume I have a token if I could...
        // Let's exit if login fails.
        process.exit(1);
    }
};

const testStats = async () => {
    try {
        const res = await axios.get(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Stats fetched:', res.data);
        if (res.data.revenue !== undefined) {
            console.log('✅ Revenue field present');
        } else {
            console.error('❌ Revenue field MISSING');
        }
    } catch (error) {
        console.error('Stats fetch failed:', error.message);
    }
};

const testWeddings = async () => {
    try {
        const res = await axios.get(`${API_URL}/admin/weddings`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`Weddings fetched: ${res.data.length}`);

        if (res.data.length > 0) {
            weddingIdToDelete = res.data[0]._id;
            console.log('Selected wedding to delete:', weddingIdToDelete);
        }
    } catch (error) {
        console.error('Weddings fetch failed:', error.message);
    }
};

// Start
const run = async () => {
    // Note: This script requires a running backend and a valid admin account.
    // I am writing it but not running it automatically because I don't know the admin credentials.
    // The user can run it or I can try to run it if I knew the creds.

    // Actually, I'll just print instructions.
    console.log("This script is a template. Please update with valid Admin credentials.");
};

run();
