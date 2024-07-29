const { SlashCommandBuilder} = require('@discordjs/builders');

const User = require('../db/User');

const pointsCommand = new SlashCommandBuilder()
    .setName('points')
    .setDescription('Check how many points you have!');

const pointsCommandJSON = pointsCommand.toJSON();

const pointsHandler = async (interaction) => {
    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
        return interaction.reply({
            content: 'You have 0 points!',
        });
    } else {
        return interaction.reply({
            content: `You have ${user.koreanPoints} points!`,
        });
    }
}

module.exports = {
    pointsCommandJSON,
    pointsHandler,
}