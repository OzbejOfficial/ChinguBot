const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const User = require('../db/User');

const leaderboardCommand = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Check the leaderboard!');

const leaderboardCommandJSON = leaderboardCommand.toJSON();

const leaderboardHandler = async (interaction) => {
    const users = await getUsersForPage(1);

    // Embedded message
    const embed = {
        color: 0xaa2222,
        title: 'Leaderboard - Page 1',
        fields: [],
    };

    users.forEach((user, index) => {
        embed.fields.push({
            name: `${index + 1}. ${user.discordUsername}`,
            value: `${user.koreanPoints} points`,
        });
    });

    // Buttons
    const previousButton = new ButtonBuilder()
        .setCustomId('leaderboard_previous')
        .setLabel('Previous Page')
        .setStyle(ButtonStyle.Primary);

    const nextButton = new ButtonBuilder()
        .setCustomId('leaderboard_next')
        .setLabel('Next Page')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()

    if (users.length === 0) {
        return interaction.reply({
            content: 'No users found!',
        });
    }

    if (users.length === 10) {
        //row.addComponents(previousButton);
        row.addComponents(nextButton);
    } else {
        //row.addComponents(previousButton);
    }

    return interaction.reply({
        embeds: [embed],
        components: [row],
    });
}

const leaderboardPreviousPage = (interaction) => {
    const page = parseInt(interaction.message.embeds[0].title.split(' ')[3]) - 1;
    changePage(interaction, page);
}

const leaderboardNextPage = (interaction) => {
    const page = parseInt(interaction.message.embeds[0].title.split(' ')[3]) + 1;
    changePage(interaction, page);
}

const changePage = async (interaction, page) => {
    const users = await getUsersForPage(page);

    const embed = {
        color: 0xaa2222,
        title: `Leaderboard - Page ${page}`,
        fields: [],
    };

    users.forEach((user, index) => {
        embed.fields.push({
            name: `${(page - 1) * 10 + index + 1}. ${user.discordUsername}`,
            value: `${user.koreanPoints} points`,
        });
    });

    const previousButton = new ButtonBuilder()
        .setCustomId('leaderboard_previous')
        .setLabel('Previous Page')
        .setStyle(ButtonStyle.Primary);

    const nextButton = new ButtonBuilder()
        .setCustomId('leaderboard_next')
        .setLabel('Next Page')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder();
    
    if (page !== 1) {
        row.addComponents(previousButton);
    }

    if(users.length >= 10) {
        row.addComponents(nextButton);
    }

    return interaction.update({
        embeds: [embed],
        components: [row],
    });
}

const getUsersForPage = async (page) => {
    const start = (page - 1) * 10;

    const users = await User.find().sort({ koreanPoints: -1 }).skip(start).limit(10);

    if (!users) {
        return [];
    }

    return users;
}

module.exports = {
    leaderboardCommandJSON,
    leaderboardHandler,
    leaderboardPreviousPage,
    leaderboardNextPage,
}