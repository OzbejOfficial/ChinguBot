const mongoose = require('mongoose');

const User = require('./db/User');

// Update the user's knowledge by coding_speed every minute
const updateKnowledge = async () => {
    const users = await User.find({ active: true });

    users.forEach(async (user) => {
        const { coding_speed } = user;

        await User.updateOne({ discordId: user.discordId, active: true }, {
            knowledge: user.knowledge + coding_speed,
        });
    });
};

module.exports = {
    updateKnowledge,
}
