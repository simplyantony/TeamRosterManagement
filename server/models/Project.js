const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true},
        description: {type: String, default: ''},
        team_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true},
        created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    },
    {timestamps: true}
);

module.exports = mongoose.model('Project', projectSchema);