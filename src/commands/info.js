const { MessageAttachment, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const User = require('../db/User');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(path.join(__dirname, '../../assets/Hezaedrus-Medium.ttf'), { family: 'Hezaedrus' });

async function generateIDCard(discord_user, db_user) {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext('2d');

    // Load background image
    const background = await loadImage(path.join(__dirname, '../../assets/idcardtemplate.png'));
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // User information
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Hezaedrus';
    ctx.fillText(`Name: ${discord_user.username}`, 20, 120);
    ctx.fillText(`Knowledge: ${Math.round(100 * db_user.knowledge) / 100}`, 20, 160);
    ctx.fillText(`Coding Speed: ${Math.round(100 * db_user.coding_speed) / 100}`, 20, 200);

    /*
    // Load and draw user's avatar
    const discord_avatar = await discord_user.displayAvatarURL({ format: 'png', dynamic: false, size: 64 });

    const response = await fetch(discord_avatar);
    const buffer = await response.buffer();
    const avatar = await loadImage(buffer);
    ctx.drawImage(avatar, 20, 20, 80, 80);
    */

    // Save the image
    fs.writeFileSync(path.join(__dirname, '../../assets/idcard.png'), canvas.toBuffer('image/png'));
    return;
}

const infoJSON = {
    name: 'info',
    description: 'Get your ID card',
    options: [
        {
            name: 'user',
            type: 6,
            description: 'The user to get the ID card for',
            required: false,
        },
    ],
};

const infoHandler = async (interaction) => {
    const { options } = interaction;

    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
        return interaction.reply({
            content: 'You have not registered for the advent calendar',
            ephemeral: true,
        });
    }

    const get_user = options.getUser('user');

    if (!get_user) {
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
    } else {
        const other_user = await User.findOne({ discordId: get_user.id });

        if (!other_user) {
            return interaction.reply({
                content: 'The specified user has not registered for the advent calendar',
                ephemeral: true,
            });
        }

        await generateIDCard(get_user, other_user);
        const attachment  = new AttachmentBuilder(path.join(__dirname, '../../assets/idcard.png'));
        const embed = new EmbedBuilder()
            .setTitle('ID Card')
            .setDescription(`Here is ${get_user.username}'s ID card!`)
            .setImage('attachment://idcard.png');

        return interaction.reply({
            embeds: [embed],
            files: [attachment],
        });
    }
};

module.exports = {
    infoJSON,
    infoHandler,
}