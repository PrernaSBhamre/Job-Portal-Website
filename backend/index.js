// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env file
dotenv.config();

// Connect to the Database
const connectDB = require('./config/db');

// Initialize the express application
const app = express();

// Automatically provision fixed admin credentials in the separate Admin table
const Admin = require('./models/Admin');
const provisionAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
        if (!existingAdmin) {
            // Remove old admin if exists to prevent duplicates
            await Admin.deleteOne({ email: 'admin@jobportal.com' }).catch(()=>{});
            
            await Admin.create({
                email: 'admin@gmail.com',
                password: 'admin@31',
                role: 'admin',
                fullname: 'Tools & Jobs Admin'
            });
            console.log('Fixed Admin Credential Provisioned in Dedicated Admin Table.');
        }
    } catch (e) {
        console.error('Failed to provision admin:', e);
    }
};
connectDB().then(() => {
    provisionAdmin();
});

// --- Middleware ---
// Enable CORS to allow requests from the frontend
// Enable Permissive CORS to allow requests from the frontend and admin portal
app.use(cors({
    origin: true, // Dynamically allow the requester's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

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
const adminRoutes = require('./routes/adminRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Basic Route ---
// Serve the main frontend index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- Error Handling Middleware ---
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
// If it's not an API call and not a file, send the main index.html for SPA-like behavior in main site
// --- SPA Support ---
// If it's not an API call, serve the main frontend index.html
// Using * wildcard for Express 5 compatibility, but only if the URL doesn't look like a file or sub-page
app.get('*splat', (req, res, next) => {
    const isApi = req.originalUrl.startsWith('/api');
    const isAdmin = req.originalUrl.startsWith('/admin-portal');
    const isFile = req.originalUrl.includes('.') || req.originalUrl.includes('/pages/');

    if (isApi || isAdmin || isFile) {
        return next();
    }
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

// --- Start the Server ---
// Define the port (defaults to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// Tell the server to listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
