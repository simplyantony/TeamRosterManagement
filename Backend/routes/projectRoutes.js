const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const {protect} = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try{
        const projects = await Project.find().populate('team_id', 'name').sort({name: 1});
        res.json(projects);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/', protect, async (req, res) => {
    const {name, description, team_id} = req.body;
    if(!name || !team_id) return res.status(400).json({message: 'Name and team_id are required'});
    try {
        const project = await Project.create({ name, description, team_id, created_by: req.user._id});
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;