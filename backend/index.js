// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();

// Connect to the Database
const connectDB = require('./config/db');
connectDB();

// Initialize the express application
const app = express();

// --- Middleware ---
// Enable CORS to allow requests from the frontend
app.use(cors());
// Parse incoming JSON payloads in the request body
app.use(express.json());
// Parse incoming URL-encoded data
app.use(express.urlencoded({ extended: false }));

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const adminRoutes = require('./routes/adminRoutes');

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/admin', adminRoutes);

// --- Basic Route ---
// A simple test route to verify the server is running
app.get('/', (req, res) => {
    res.send('Job Portal Backend Running');
});

// --- Error Handling Middleware ---
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// --- Start the Server ---
// Define the port (defaults to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// Tell the server to listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
