const mongoose = require('mongoose');

const User = require('./db/User');
const Word = require('./db/Word');

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const quiz = new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Check your knowledge with a random word!');

const quizJSON = quiz.toJSON();

var randomWord = "";
var randomTranslation = "";

var last_interaction = null;

// Write an embed message with random word and let the user guess the translation
const newQuizWord = async (interaction) => {
    const randomWords = await Word.aggregate([{ $sample: { size: 1 } }]);
    const word = randomWords[0];

    randomWord = word.korean_word;
    randomTranslation = word.english_word;

    const guess = new ButtonBuilder()
        .setCustomId('guess')
        .setLabel('Guess')
        .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder()
        .addComponents(guess);

    if(last_interaction != null) {
        last_interaction.editReply({
            components: [],
        });
    }

    last_interaction = interaction;

    await interaction.reply({
        //embeds: [quizEmbed],
        content: `What is the Korean translation of ${randomWord}?`,
        components: [actionRow],
    });
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
        .setLabel(`What is the Korean translation of ${randomWord}?`)
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
    if (guess.toLowerCase() !== randomTranslation.toLowerCase()) {
        // reply privately to the user
        return interaction.reply({
            content: `Your guess of ${guess} is incorrect. Try again!`,
            ephemeral: true,
        });
    } else {
        const user = await User.findOne({ discordId: interaction.user.id });

        if (!user) {
            const newUser = new User({
                discordId: interaction.user.id,
                discordUsername: interaction.user.username,
                koreanPoints: 1,
            });

            await newUser.save();
        } else {
            user.koreanPoints += 1;
            await user.save();
        }

        if(last_interaction != null) {
            last_interaction.editReply({
                components: [],
            });
        }
        
        return interaction.reply({
            content: `${interaction.user} knows that ${randomWord} means ${randomTranslation} and now has ${user.koreanPoints} points!`,
        });
    }

};

module.exports = {
    quizJSON,
    newQuizWord,
    openGuessPrompt,
    isCorrectGuess,
}
