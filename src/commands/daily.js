const { SlashCommandBuilder} = require('@discordjs/builders');
const User = require('../db/User');

const dailyClaimCommand = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward');

const dailyClaimJSON = dailyClaimCommand.toJSON();

const dailyClaimHandler = async (interaction) => {
    // Get the user from the database and check if they have already claimed their from user.last_contribution

    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
        return interaction.reply({
            content: 'You have not registered for the advent calendar',
            ephemeral: true,
        });
    }

    // Get time for UTC+1
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const lastClaim = user.last_contribution;

    if (lastClaim.getDate() === now.getDate() && lastClaim.getMonth() === now.getMonth() && lastClaim.getFullYear() === now.getFullYear()) {
        return interaction.reply({
            content: 'You have already claimed your daily reward',
            ephemeral: true,
        });
    }

    // Give the user their reward
    if(now.getDate() === 1 && now.getMonth() === 11) {
        user.knowledge += 50;
    } else if(now.getDate() === 2 && now.getMonth() === 11) {
        user.knowledge += 200;
    } else if(now.getDate() === 3 && now.getMonth() === 11) {
        user.knowledge += 500;
    } else if(now.getDate() === 4 && now.getMonth() === 11) {
        user.knowledge += 1000;
    } else if(now.getDate() === 5 && now.getMonth() === 11) {
        user.knowledge += 2000;
    }

    user.days_contributed += 1;
    user.last_contribution = now;
    await user.save();

    return interaction.reply({
        content: 'You have successfully claimed your daily reward and now have ' + user.knowledge + ' knowledge!',
    });
}

module.exports = {
    dailyClaimJSON,
    dailyClaimHandler,
}