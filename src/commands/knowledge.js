const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../db/User');

// Make it visible to the rest of discord users
const  adventKnowledge = new SlashCommandBuilder()
    .setName('knowledge')
    .setDescription('Check your knowledge');

const adventKnowledgeJSON = adventKnowledge.toJSON();

const adventKnowledgeHandler = async (interaction) => {
    const { options } = interaction;

    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
        return interaction.reply({
            content: 'You have not registered for the advent calendar',
            ephemeral: true,
        });
    }

    return interaction.reply({
        content: `Your knowledge is ${user.knowledge}`,
    });
};

module.exports = {
    adventKnowledgeJSON,
    adventKnowledgeHandler,
}