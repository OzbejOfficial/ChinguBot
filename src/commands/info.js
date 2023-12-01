const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const User = require('../db/User');
const path = require('path');
const fs = require('fs');

const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(path.join(__dirname, '../../assets/Hezaedrus-Medium.ttf'), { family: 'Hezaedrus' });

async function generateIDCard(discord_user, db_user) {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext('2d');

    // Load background image
    const background = await loadImage(path.join(__dirname, '../../assets/idcardtemplate.png'));
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // User information
    ctx.fillStyle = '#000000';
    ctx.font = '20px Hezaedrus';
    ctx.fillText(`Name: ${discord_user.username}`, 120, 80);
    ctx.fillText(`Knowledge: ${Math.round(100 * db_user.knowledge) / 100}`, 120, 120);
    ctx.fillText(`Coding Speed: ${Math.round(100 * db_user.coding_speed) / 100}`, 120, 160);

    /*
    // Load and draw user's avatar
    const avatar = await loadImage(discord_user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 }));
    ctx.drawImage(avatar, 20, 20, 80, 80);
    */

    // Save the image
    fs.writeFileSync(path.join(__dirname, '../../assets/idcard.png'), canvas.toBuffer('image/png'));
    return;
}

const infoCommand = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Check user info')
    .addStringOption(option =>
        option.setName('resource')
        .setDescription('Give me a resource to upgrade')
        .setRequired(false));

const infoJSON = infoCommand.toJSON();

const infoHandler = async (interaction) => {
    const { options } = interaction;

    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
        return interaction.reply({
            content: 'You have not registered for the advent calendar',
            ephemeral: true,
        });
    }

    await generateIDCard(interaction.user, user);
    const attachment  = new AttachmentBuilder(path.join(__dirname, '../../assets/idcard.png'));
    const embed = new EmbedBuilder()
        .setTitle('ID Card')
        .setDescription('Here is your ID card!')
        .setImage('attachment://idcard.png');

    return interaction.reply({
        embeds: [embed],
        files: [attachment],
    });
};

module.exports = {
    infoJSON,
    infoHandler,
}