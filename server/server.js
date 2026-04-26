console.log('=== SERVER STARTING ===');
console.log('Node:', process.version);
console.log('MONGO_URI set:', !!process.env.MONGO_URI);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
// ... rest of your file
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    process.exit(1);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const rosterRoutes = require('./routes/rosterRoutes');
const storyRoutes = require('./routes/storyRoutes');
const homeRoutes = require('./routes/homeRoutes');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()): ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked for origins: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());

app.use('/api/auth' , authRoutes);
app.use('/api/team' , teamRoutes);
app.use('/api/user' , userRoutes);
app.use('/api/project' , projectRoutes);
app.use('/api/roster' , rosterRoutes);
app.use('/api/story' , storyRoutes);
app.use('/api/home' , homeRoutes);

app.get('/', (req, res) => res.json({message: 'ICSI 418Y HW4 API is running'}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({message: err.message || 'Server Error'});
});

const PORT = process.env.PORT || 5000;
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});