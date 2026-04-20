const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const {protect} = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const teams = await Team.find().sort({name: 1});
        res.json(teams);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/', protect, async (req, res) => {
    const { name, description} = req.body;
    if (!name) return res.status(400).json({message: 'Team name is required'});
    try {
        const team = await Team.create({name, description, created_by: req.user._id});
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

module.exports = router;