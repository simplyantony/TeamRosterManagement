const mongoose = require('mongoose');

const userStorySchema = new mongoose.Schema(
    {
        user_story: {type: String, required: true, trim: true},
        proj_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true},
        priority: {type: Number, default: 0},
    },
    {timestamps: true}
);
module.exports = mongoose.model('UserStory', userStorySchema);