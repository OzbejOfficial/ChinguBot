const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConfigSchema = new Schema({
    quiz_channel: {
        type: String,
    },
    quiz_active: {
        type: Boolean,
        default: false,
    },
    quiz_cooldown_min: {
        type: Number,
        default: 60,
    },
    quiz_cooldown_max: {
        type: Number,
        default: 120,
    },
});

module.exports = mongoose.model('Config', ConfigSchema);