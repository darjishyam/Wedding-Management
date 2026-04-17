const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/weddings', require('./routes/weddingRoutes'));
app.use('/api/guests', require('./routes/guestRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/shagun', require('./routes/shagunRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// API Root Route
app.get('/api', (req, res) => {
    res.json({ message: "Shagun API is running", version: "1.0.0" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Prevent crash on unhandled promise rejections (e.g. DB drop, Email fail)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // process.exit(1); // Don't crash for now, let it retry
});