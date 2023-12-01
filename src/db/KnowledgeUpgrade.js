const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KnowledgeUpgradeSchema = new Schema({
    discordId: {
        type: String,
        required: true,
    },
    resource: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    level: {
        type: Number,
        default: 1,
    },
    add_speed: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('KnowledgeUpgrade', KnowledgeUpgradeSchema);