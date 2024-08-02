const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const Word = require('../db/Word');

const translateCommand = new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate a word ENG-KR!')
    .addStringOption(option =>
        option.setName('english_word')
            .setDescription('The English word'))
    .addStringOption(option =>
        option.setName('korean_word')
            .setDescription('The Korean word'));

const translateCommandJSON = translateCommand.toJSON();

const translateHandler = async (interaction) => {
    var englishWord = interaction.options.getString('english_word');
    var koreanWord = interaction.options.getString('korean_word');

    if (englishWord) {
        const word = await Word.findOne({ english: englishWord.toLowerCase() });

        if (!word) {
            return noTranslation(interaction, englishWord);
        }

        return translationReply(interaction, word);

    } else if (koreanWord) {
        const word = await Word.findOne({ korean: koreanWord.toLowerCase() });

        if (!word) {
            return noTranslation(interaction, koreanWord);
        }

        return translationReply(interaction, word);
    }

    return interaction.reply({
        content: 'Please provide an English or Korean word!',
    });
}

const noTranslation = async (interaction, word) => {
    return interaction.reply({
        content: `No translation found for ${word}!`,
    });
}

const translationReply = async (interaction, word) => {
    var embed = {
        color: 0xaa2222,
        title: 'Translation',
        fields: [
            {
                name: 'English',
                value: word.english,
            },
            {
                name: 'Korean',
                value: word.korean,
            },
        ],
    };

    if(word.meanings.length > 1) {
        var meanings = word.meanings.join(', ');
        embed.fields.push({
            name: 'Can also mean:',
            value: meanings,
        });
    }

    if(word.example_sentence_korean) {
        embed.fields.push({
            name: 'Example Sentence',
            value: `KR: ${word.example_sentence_korean} \n ENG: ${word.example_sentence_english}`,
        });

        embed.fields.push({
            name: 'Romanization',
            value: word.example_sentence_romanization,
        });
    }

    if(word.level) {
        embed.fields.push({
            name: 'Word difficulty',
            value: word.level,
        });
    }

    return interaction.reply({
        embeds: [embed],
    });
}

module.exports = {
    translateCommandJSON,
    translateHandler,
}