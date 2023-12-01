const { Client, GatewayIntentBits, Routes } = require('discord.js');
const { config } = require('dotenv');
const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder } = require('@discordjs/builders');
const nodecron = require('node-cron');

const { 
    adventRegisterJSON, 
    adventRegisterHandler,
} = require('./src/commands/register');

const {
    adventUnregisterJSON,
    adventUnregisterHandler,
} = require('./src/commands/unregister');

const {
    adventKnowledgeJSON,
    adventKnowledgeHandler,
} = require('./src/commands/knowledge');

const {
    leaderboardJSON,
    leaderboardHandler,
} = require('./src/commands/leaderboard');

const {
    upgradeJSON,
    upgradeHandler,
} = require('./src/commands/upgrade');

const {
    dailyClaimJSON,
    dailyClaimHandler,
} = require('./src/commands/daily');

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
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'register') {
        return adventRegisterHandler(interaction);
    }

    if (interaction.commandName === 'unregister') {
        return adventUnregisterHandler(interaction);
    }

    if (interaction.commandName === 'knowledge') {
        return adventKnowledgeHandler(interaction);
    }

    if (interaction.commandName === 'leaderboard') {
        return leaderboardHandler(interaction);
    }

    if (interaction.commandName === 'upgrade') {
        return upgradeHandler(interaction);
    }

    if (interaction.commandName === 'daily') {
        return dailyClaimHandler(interaction);
    }
});

async function main() {
    
    const commands = [
        adventRegisterJSON,
        adventUnregisterJSON,
        adventKnowledgeJSON,
        leaderboardJSON,
        upgradeJSON,
        dailyClaimJSON,
    ];
    
    try{
        await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID), {
            body: commands,  
        })
        await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.SYSTEMATTIC_ID), {
            body: commands,  
        })
    } catch (err) {
        console.error(err)
    }
}

main();

//Schedule a cron job for every minute
const increment = require('./src/increment');
nodecron.schedule('* * * * *', async () => {
    console.log('Updating knowledge')
    await increment.updateKnowledge();
});