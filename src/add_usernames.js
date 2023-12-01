const mongoose = require('mongoose');
const User = require('./db/User');

const addUsernameIfUserDoesntHaveOne = async (interaction) => {
    const { user } = interaction;

    const dbUser = await User.findOne({ discordId: user.id });

    if (!dbUser) {
        return;
    }

    if (!dbUser.discordUsername) {
        dbUser.discordUsername = user.username;
        await dbUser.save();
    }
}

module.exports = {
    addUsernameIfUserDoesntHaveOne,
}