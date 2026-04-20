const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {protect} = require('../middleware/authMiddleware');

const generateToken = (id) =>
    jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRTE || '7d'});

router.post('/register', async (req, res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password)
        return res.status(400).json({message: 'All fields are required'});

    try{
        const exists = await User.findOne({ $or: [{email}, {username}] });
        if(exists) return res.status(409).json({message: 'Username or email already in use'});

        const user = await User.create({ username, email, password});
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password)
        return res.status(400).json({message: 'Email and password are required'});

    try {
        const user = await User.findOne({ email});
        if(!user || !(await user.matchPassword(password)))
            return res.status(401).json({message: 'Invalid credentials'});
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/logout', protect, (req, res) => {
    res.json({message: 'Logged out successfully'});
});

router.get('/me', protect, (req, res) => {
    res.json({_id: req.user._id, username: req.user.username, email: req.user.email});
});

module.exports = router;