const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../db/User');

const  adventUnregister = new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Unregister for the advent calendar');
    
const adventUnregisterJSON = adventUnregister.toJSON();

const adventUnregisterHandler = async (interaction) => {
    const { options } = interaction;

    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
        return interaction.reply({
            content: 'You have not registered for the advent calendar',
            ephemeral: true,
        });
    }

    await User.updateOne({ discordId: interaction.user.id }, {
        $set: {
            active: false,
        }
    });

    return interaction.reply({
        content: 'You have successfully unregistered for the advent calendar',
    });
};

module.exports = {
    adventUnregisterJSON,
    adventUnregisterHandler,
}