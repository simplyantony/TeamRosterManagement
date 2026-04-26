const mongoose = require('mongoose');
const teamRosterSchema = new mongoose.Schema(
    {
        team_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true},
        member_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', reuqired: true},
    },
    {timestamps: true}
);

teamRosterSchema.index({team_id: 1, member_id: 1}, {unique: true});

module.exports = mongoose.model('TeamRoster', teamRosterSchema);