const express = require('express');
const router = express.Router();
const TeamRoster = require('../models/TeamRoster');
const Project = require('../models/Project');
const userStory = require('../models/UserStory');
const Team = require('../models/Team');
const { protect } = require('../middleware/authMiddleware');

router.get('/:userId', protect, async (req, res) => {
    try{
        const userId = req.params.userId;

        const rosterEntries = await TeamRoster.find({ member_id: userId});
        const teamIds = rosterEntries.map((r) => r.team_id);

        const teams = await Team.find({ _id: { $in: teamIds} }).sort({name: 1});

        const projects = await Project.find({ team_id: { $in: teamIds} })
            .populate('team_id', 'name')
            .sort({name: 1});
        const projectIds = projects.map((p) => p._id);

        const stories = await UserStory.find({ proj_id: {$in: projectIds} })
            .populate('proj_id', 'name')
            .sort({priority: -1, createdAt: -1});
        res.json({teams, projects, stories});
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;