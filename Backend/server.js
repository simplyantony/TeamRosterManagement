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

app.use(cors({origin: 'http://localhost:3000', credentials: true}));
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
mongosse
.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});