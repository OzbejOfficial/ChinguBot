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
    koreanPoints: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('User', UserSchema);