const { SlashCommandBuilder} = require('@discordjs/builders');

const Word = require('../db/Word');

// ADDING NEW WORD TO THE DATABASE

const addWord = new SlashCommandBuilder()
    .setName('word-add')
    .setDescription('Adds a new word to the database')
    .addStringOption(option => 
        option.setName('english_word')
            .setDescription('The English word')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('korean_word')
            .setDescription('The Korean word')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('eng_allows')
            .setDescription('English words that the Korean word allows (separated by commas)')
            .setRequired(false));

const addWordJSON = addWord.toJSON();

const addWordHandler = async (interaction) => {
    const englishWord = interaction.options.getString('english_word');
    const koreanWord = interaction.options.getString('korean_word');
    const engAllows = interaction.options.getString('eng_allows');

    const exists = await Word.findOne({ english_word: englishWord });
    if (exists) {
        return interaction.reply({
            content: `${englishWord} already exists in the database!`,
        });
    }

    const newWord = new Word({
        english_word: englishWord,
        korean_word: koreanWord,
        eng_allows: engAllows ? engAllows.split(',') : [],
    });

    await newWord.save();

    const extra = engAllows ? ` with English words ${engAllows}` : '';

    return interaction.reply({
        content: `Added ${englishWord} - ${koreanWord} to the database!` + extra,
    });
}

// REMOVING WORD FROM THE DATABASE

const removeWord = new SlashCommandBuilder()
    .setName('word-remove')
    .setDescription('Removes a word from the database')
    .addStringOption(option =>
        option.setName('english_word')
            .setDescription('The English word')
            .setRequired(true));

const removeWordJSON = removeWord.toJSON();

const removeWordHandler = async (interaction) => {
    const englishWord = interaction.options.getString('english_word');

    const word = await Word.findOne({ english_word: englishWord });

    if (!word) {
        return interaction.reply({
            content: `Could not find ${englishWord} in the database!`,
        });
    }

    await Word.deleteOne({ english_word: englishWord });

    return interaction.reply({
        content: `Removed ${englishWord} from the database!`,
    });
}

// EDITING WORD IN THE DATABASE

const editWord = new SlashCommandBuilder()
    .setName('word-edit')
    .setDescription('Edits a word in the database')
    .addStringOption(option =>
        option.setName('english_word')
            .setDescription('The English word')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('korean_word')
            .setDescription('The Korean word')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('eng_allows')
            .setDescription('English words that the Korean word allows (separated by commas)')
            .setRequired(false));

const editWordJSON = editWord.toJSON();

const editWordHandler = async (interaction) => {
    const englishWord = interaction.options.getString('english_word');
    const koreanWord = interaction.options.getString('korean_word');
    const engAllows = interaction.options.getString('eng_allows');

    const word = await Word.findOne({ english_word: englishWord });

    if (!word) {
        return interaction.reply({
            content: `Could not find ${englishWord} in the database!`,
        });
    }

    await Word.updateOne({ english_word: englishWord }, { korean_word: koreanWord }, { eng_allows: engAllows ? engAllows.split(',') : [] });

    return interaction.reply({
        content: `Updated ${englishWord} to ${koreanWord} in the database!`,
    });
}

module.exports = {
    addWordJSON,
    removeWordJSON,
    editWordJSON,
    addWordHandler,
    removeWordHandler,
    editWordHandler,
}