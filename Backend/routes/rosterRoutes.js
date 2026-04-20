const express = require('express');
const router = express.Router();
const TeamRoster = require('../models/TeamRoster');
const {protect} = require('../middleware/authMiddleware');

router.get('/:teamId', protect, async (req, res) => {
    try{
        const entries = await TeamRoster.find({team_id: req.params.teamId})
            .populate('member_id', 'username email');
        res.json(entries);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/', protect, async (req, res) => {
    const {team_id, member_ids} = req.body;

    if(!team_id) return res.status(400).json({message: 'team_id is required'});
    if(!member_ids || !Array.isArray(member_ids) || member_ids.length === 0)
        return res.status(400).json({message: 'member_ids is required'});

    try {
        const added = [];
        const skipped = [];

        for(const member_id of member_ids){
            const existing = await TeamRoster.findOne({team_id, member_id});
            if(existing) {
                skipped.push(member_id);
            } else {
                const entry = await TeamRoster.create({ team_id, member_id});
                added.push(entry);
            }
        }
        res.status(201).json({added, skipped});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.delete('/', protect, async (req, res) => {
    const {team_id, member_ids} = req.body;

    if(!team_id) return res.status(400).json({message: 'team_id is required'});
    if(!member_ids || !Array.isArray(member_ids) || member_ids.length === 0)
        return res.status(400).json({ message: 'member_ids are required'});
    try {
        const result = await TeamRoster.deleteMany({
            team_id,
            member_id: {$in: member_ids},
        });
        res.json({message: `${result.deletedCount} member(s) removed`});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

module.exports = router;