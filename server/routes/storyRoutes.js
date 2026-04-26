const express = require('express');
const router = express.Router();
const UserStory = require('../models/UserStory');
const {protect} = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const filter = req.query.proj_id ? {proj_id: req.query.proj_id} : {};
        const stories = await UserStory.find(filter)
            .populate('proj_id', 'name')
            .sort({priority: -1, createdAt: -1});
        res.json(stories);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/', protect, async (req, res) => {
    const { user_story, proj_id, priority} = req.body;

    if(!user_story || !user_story.trim())
        return res.status(400).json({message: 'user_story description is required'});
    if(!proj_id)
        return res.status(400).json({message: 'proj_id is required'});

    try {
        const story = await UserStory.create({
            user_story: user_story.trim(),
            proj_id,
            priority: priority !== undefined && priority !== '' ? Number(priority) : 0,
        });
        res.status(201).json(story);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        await UserStory.findByIdAndDelete(req.params.id);
        res.json({message: 'Story deleted'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;