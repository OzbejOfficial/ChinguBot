const { Client, GatewayIntentBits, Routes } = require('discord.js');
const { config } = require('dotenv');
const { REST } = require('@discordjs/rest');

const { 
    koreanCommandJSON, 
    koreanHandler,
} = require('./src/commands/korean');

const {
    pointsCommandJSON,
    pointsHandler,
} = require('./src/commands/points');

const {
    leaderboardCommandJSON,
    leaderboardHandler,
    leaderboardPreviousPage,
    leaderboardNextPage,
} = require('./src/commands/leaderboard');

const {
    addWordJSON,
    removeWordJSON,
    editWordJSON,
    addWordHandler,
    removeWordHandler,
    editWordHandler,
} = require('./src/commands/words');

const {
    translateCommandJSON,
    translateHandler,
} = require('./src/commands/translate');

//

const {
    qEnableJSON,
    qDisableJSON,
    quizActivateHandler,
    quizDeactivateHandler,

    quizChannelJSON,
    quizChannelHandler,

    quizCooldownJSON,
    quizCooldownHandler,
    quizCooldownJob,

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

try {
    console.log('Bot is logging in');
    client.login(process.env.BOT_TOKEN);
} catch (err) {
    console.error(err);
}

client.on('ready', () => {
    console.log('Bot is ready');

    quizCooldownJob(rest, client);
});

client.on('disconnect', () => {
    console.log('Bot is disconnected');
    client.login(process.env.BOT_TOKEN);
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

        if (interaction.customId === 'leaderboard_previous') {
            return leaderboardPreviousPage(interaction);
        }

        if (interaction.customId === 'leaderboard_next') {
            return leaderboardNextPage(interaction);
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

    if (interaction.commandName === 'points') {
        return pointsHandler(interaction);
    }

    if (interaction.commandName === 'leaderboard') {
        return leaderboardHandler(interaction);
    }

    if (interaction.commandName === 'translate') {
        return translateHandler(interaction);
    }

    /*
    if (interaction.commandName === 'word-add') {
        return addWordHandler(interaction);
    }

    if (interaction.commandName === 'word-remove') {
        return removeWordHandler(interaction);
    }

    if (interaction.commandName === 'word-edit') {
        return editWordHandler(interaction);
    }
    */

    // This one for testing
    /*
    if (interaction.commandName === 'quiz') {
        return await newQuizWord(rest, client);
    }
    */

    if (interaction.commandName === 'quiz-enable') {
        return quizActivateHandler(interaction);
    }

    if (interaction.commandName === 'quiz-disable') {
        return quizDeactivateHandler(interaction);
    }

    if (interaction.commandName === 'quiz-channel') {
        return quizChannelHandler(interaction);
    }

    if (interaction.commandName === 'quiz-cooldown') {
        return quizCooldownHandler(interaction);
    }

});

async function main() {

    /*
        addWordJSON,
        removeWordJSON,
        editWordJSON,

        quizJSON,
    */

    const commands = [
        koreanCommandJSON,
        pointsCommandJSON,
        leaderboardCommandJSON,
        translateCommandJSON,

        qEnableJSON,
        qDisableJSON,
        quizChannelJSON,
        quizCooldownJSON,
    ];
    
    for(const serverId of process.env.SERVER_ID.split(',')) {
        try{
            await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, serverId), {
                body: commands,  
            })
        } catch (err) {
            console.error(err)
        }
    }
    
}

main();