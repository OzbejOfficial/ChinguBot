const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../db/User');

// Make it visible to the rest of discord users
const  adventRegister = new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register for the advent calendar');

const adventRegisterJSON = adventRegister.toJSON();

const adventRegisterHandler = async (interaction) => {
    const { options } = interaction;

    const user = await User.findOne({ discordId: interaction.user.id });

    if (user) {
        return interaction.reply({
            content: 'You have already registered for the advent calendar',
            ephemeral: true,
        });
    }

    const newUser = new User({
        discordId: interaction.user.id,
    });

    await newUser.save();

    return interaction.reply({
        content: 'You have successfully registered for the advent calendar',
    });
};

module.exports = {
    adventRegisterJSON,
    adventRegisterHandler,
}