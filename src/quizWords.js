const mongoose = require('mongoose');

const User = require('./db/User');
const Word = require('./db/Word');
const Config = require('./db/Config');

const nodecron = require('node-cron');

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const quiz = new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Check your knowledge with a random word!');

const quizJSON = quiz.toJSON();

var randomWord = "";
var randomTranslation = "";

var last_interaction = null;

// Write an embed message with random word and let the user guess the translation
const newQuizWord = async (rest, client) => {
    try {
        

        const randomWords = await Word.aggregate([{ $sample: { size: 1 } }]);
        const word = randomWords[0];

        randomWord = word.english;
        randomTranslation = word.korean;

        const guess = new ButtonBuilder()
            .setCustomId('guess')
            .setLabel('Guess')
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder()
            .addComponents(guess);

        await buttonDisable();

        const config = await Config.findOne({});

        if (!config || !config.quiz_active) {
            return;
        }

        const channel = await client.channels.fetch(config.quiz_channel);
        if (!channel) {
            console.error(`Channel with ID ${config.quiz_channel} not found`);
            return;
        }

        const message = await channel.send({
            //embeds: [quizEmbed], // Uncomment and define quizEmbed if needed
            content: `What is the Korean translation of ${randomWord}?`,
            components: [actionRow],
        });

        last_interaction = message;

        quizCooldownJob(rest, client);

    } catch (error) {
        console.error('Error in newQuizWord:', error);
    }
};

const openGuessPrompt = async (interaction) => {
    // Create the modal
		const modal = new ModalBuilder()
        .setCustomId('guessPrompt')
        .setTitle('Korean Exam!');

    // Add components to modal

    // Create the text input components
    const guessInput= new TextInputBuilder()
        .setCustomId('guessInput')
        // The label is the prompt the user sees for this input
        .setLabel(`What is the translation of ${randomWord}?`)
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(guessInput);

    // Add inputs to the modal
    modal.addComponents(firstActionRow);
    
    // Show the modal to the user
    await interaction.showModal(modal);
};

const isCorrectGuess = async (interaction) => {
    if (interaction.user.bot) return;
    
    const guess = interaction.fields.fields.get('guessInput').value;
    const guessLower = guess.toLowerCase();
    const translation = await Word.find({ english: randomWord });

    for (let i = 0; i < translation.length; i++) {
        // check if it is english_word or in the array eng_allows
        if (guessLower === translation[i].korean.toLowerCase()) {
            var user = await User.findOne({ discordId: interaction.user.id });

            if (!user) {
                const newUser = new User({
                    discordId: interaction.user.id,
                    discordUsername: interaction.user.username,
                    koreanPoints: 1,
                });

                await newUser.save();

                user = newUser;
            } else {
                user.koreanPoints += 1;
                await user.save();
            }

            await buttonDisable();
            
            return interaction.reply({
                content: `${interaction.user} knows that ${randomWord} in Korean is ${randomTranslation} and now has ${user.koreanPoints} points!`,
            });
        }
    }

    return interaction.reply({
        content: `Your guess of ${guess} is incorrect. Try again!`,
        ephemeral: true,
    });

};

const buttonDisable = async () => {
    if(last_interaction != null) {
        try {
            last_interaction.edit({
                components: [],
            });

            return;
        } catch (error) {
            console.error('Was not able to edit the previous message');
        }

        try {
            last_interaction.editReply({
                components: [],
            });
        } catch (error) {
            console.error('Was not able to edit the previous reply');
        }
    }
}

// QUIZ ACTIVE / DISABLE

const qEnable = new SlashCommandBuilder()
    .setName('quiz-enable')
    .setDescription('Enable the quiz!');

const qEnableJSON = qEnable.toJSON();

const qDisable = new SlashCommandBuilder()
    .setName('quiz-disable')
    .setDescription('Disable the quiz!');

const qDisableJSON = qDisable.toJSON();

const quizActivateHandler = async (interaction) => {
    // Check if the user has the required permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({
            content: 'You do not have the required permissions to use this command.',
            ephemeral: true,
        });
    }

    const config = await Config.findOne({});

    if (!config) {
        const newConfig = new Config({
            quiz_active: true,
        });

        await newConfig.save();
    } else {
        config.quiz_active = true;
        await config.save();
    }

    return interaction.reply({
        content: 'Quiz enabled!',
        ephemeral: true,
    });
}

const quizDeactivateHandler = async (interaction) => {
    // Check if the user has the required permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({
            content: 'You do not have the required permissions to use this command.',
            ephemeral: true,
        });
    }

    const config = await Config.findOne({});

    if (!config) {
        const newConfig = new Config({
            quiz_active: false,
        });

        await newConfig.save();
    } else {
        config.quiz_active = false;
        await config.save();
    }
    
    return interaction.reply({
        content: 'Quiz disabled!',
        ephemeral: true,
    });
}

// QUIZ CHANNEL SET

const quizChannel = new SlashCommandBuilder()
    .setName('quiz-channel')
    .setDescription('Set the quiz channel.')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel for the quiz')
            .setRequired(true));

const quizChannelJSON = quizChannel.toJSON();

const quizChannelHandler = async (interaction) => {
    // Check if the user has the required permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({
            content: 'You do not have the required permissions to use this command.',
            ephemeral: true,
        });
    }

    const channel = interaction.options.getChannel('channel');

    const config = await Config.findOne({});

    if (!config) {
        const newConfig = new Config({
            quiz_channel: channel.id,
        });

        await newConfig.save();
    } else {
        config.quiz_channel = channel.id;
        await config.save();
    }
    
    return interaction.reply({
        content: `Quiz channel set to ${channel.name}`,
        ephemeral: true,
    });
}

// QUIZ COOLDOWN SET

const quizCooldown = new SlashCommandBuilder()
    .setName('quiz-cooldown')
    .setDescription('Set the quiz cooldown.')
    .addIntegerOption(option =>
        option.setName('min')
            .setDescription('The minimum cooldown time in seconds')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('max')
            .setDescription('The maximum cooldown time in seconds')
            .setRequired(true));

const quizCooldownJSON = quizCooldown.toJSON();

const quizCooldownHandler = async (interaction) => {
    // Check if the user has the required permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({
            content: 'You do not have the required permissions to use this command.',
            ephemeral: true,
        });
    }

    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');

    const config = await Config.findOne({});

    if (!config) {
        const newConfig = new Config({
            quiz_cooldown_min: min,
            quiz_cooldown_max: max,
        });

        await newConfig.save();
    } else {
        config.quiz_cooldown_min = min;
        config.quiz_cooldown_max = max;
        await config.save();
    }
    
    return interaction.reply({
        content: `Quiz cooldown set to ${min} - ${max} seconds`,
        ephemeral: true,
    });
}

// SCHEDULE NEXT QUIZ WITH A COOLDOWN

const quizCooldownJob = async (rest, client) => {
    const config = await Config.findOne({});
    if (!config || !config.quiz_active) return;

    const min = config.quiz_cooldown_min;
    const max = config.quiz_cooldown_max;

    const cooldown = Math.floor(Math.random() * (max - min + 1) + min);

    console.log(`Next quiz in ${cooldown} seconds`);

    setTimeout(async () => {
        await newQuizWord(rest, client);
    }, cooldown * 1000);

    return;
}


module.exports = {
    quizJSON,
    qEnableJSON,
    qDisableJSON,
    quizChannelJSON,
    quizCooldownJSON,
    quizActivateHandler,
    quizDeactivateHandler,
    quizChannelHandler,
    quizCooldownHandler,
    quizCooldownJob,
    newQuizWord,
    openGuessPrompt,
    isCorrectGuess,
}
