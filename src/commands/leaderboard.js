const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../db/User');

const leaderboard = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Check the leaderboard');

const leaderboardJSON = leaderboard.toJSON();

const leaderboardHandler = async (interaction) => {
    const users = await User.find({ active: true }).sort({ knowledge: -1 });

    const leaderboard = users.map((user, index) => {
        return `${index + 1}. <@${user.discordId}> - ${user.knowledge}`;
    });

    return interaction.reply({
        content: leaderboard.join('\n'),
    });
}

module.exports = {
    leaderboardJSON,
    leaderboardHandler,
}