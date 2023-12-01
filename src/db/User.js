const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    discordId: {
        type: String,
        required: true,
        unique: true,
    },
    discordUsername: {
        type: String,
    },
    knowledge: {
        type: Number,
        default: 0,
    },
    days_contributed: {
        type: Number,
        default: 0,
    },
    last_contribution: {
        type: Date,
        default: Date.UTC(2023, 10, 20, 0, 0, 0, 0),
    },
    coding_speed: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('User', UserSchema);