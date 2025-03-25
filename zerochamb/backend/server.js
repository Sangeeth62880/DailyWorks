const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Add this line
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
// Update the static file serving to use absolute path
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.set('strictQuery', false);

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';
const formattedURI = mongoURI.startsWith('mongodb://') || mongoURI.startsWith('mongodb+srv://') 
    ? mongoURI 
    : `mongodb://${mongoURI}`;

mongoose.connect(formattedURI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});