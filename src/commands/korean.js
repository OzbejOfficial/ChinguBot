const { SlashCommandBuilder} = require('@discordjs/builders');

const koreanCommand = new SlashCommandBuilder()
    .setName('korean')
    .setDescription('Check how Korean you are!');

const koreanCommandJSON = koreanCommand.toJSON();

const koreanHandler = async (interaction) => {
    const randomPercentage = Math.floor(Math.random() * 101);

    return interaction.reply({
        content: `You are ${randomPercentage}% Korean!`,
    });
}

module.exports = {
    koreanCommandJSON,
    koreanHandler,
}