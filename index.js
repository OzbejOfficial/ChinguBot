const { Client, GatewayIntentBits, Routes } = require('discord.js');
const { config } = require('dotenv');
const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder } = require('@discordjs/builders');
const nodecron = require('node-cron');

const { 
    koreanCommandJSON, 
    koreanHandler,
} = require('./src/commands/korean');

const {
    pointsCommandJSON,
    pointsHandler,
} = require('./src/commands/points');

const {
    addWordJSON,
    removeWordJSON,
    editWordJSON,
    addWordHandler,
    removeWordHandler,
    editWordHandler,
} = require('./src/commands/words');

//

const {
    quizJSON,
    newQuizWord,
    openGuessPrompt,
    isCorrectGuess,
} = require('./src/quizWords');

//

config();

const database = require('./src/db/database');
database.connect();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
    console.log('Bot is ready');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'guess') {
            return await openGuessPrompt(interaction);
        }
    }

    if(interaction.isModalSubmit()) {
        if (interaction.customId === 'guessPrompt') {
            return await isCorrectGuess(interaction);
        }
    }

    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'korean') {
        return koreanHandler(interaction);
    }

    if (interaction.commandName === 'quiz') {
        return await newQuizWord(interaction);
    }

    if (interaction.commandName === 'points') {
        return pointsHandler(interaction);
    }

    if (interaction.commandName === 'word-add') {
        return addWordHandler(interaction);
    }

    if (interaction.commandName === 'word-remove') {
        return removeWordHandler(interaction);
    }

    if (interaction.commandName === 'word-edit') {
        return editWordHandler(interaction);
    }

});

async function main() {
    
    const commands = [
        koreanCommandJSON,
        pointsCommandJSON,
        
        addWordJSON,
        removeWordJSON,
        editWordJSON,

        quizJSON,
    ];
    
    try{
        await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID), {
            body: commands,  
        })
        await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.SERVER_ID), {
            body: commands,  
        })
    } catch (err) {
        console.error(err)
    }
}

main();

//Schedule a cron job for every minute
/*
const increment = require('./src/increment');
nodecron.schedule('* * * * *', async () => {
    var date = new Date();
    console.log('Running an upgrade of knowledge at ' + date);
    await increment.updateKnowledge();
});
*/