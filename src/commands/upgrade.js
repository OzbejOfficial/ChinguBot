const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../db/User');
const KnowledgeUpgrade = require('../db/KnowledgeUpgrade');

const upgrades = [
    {
        resource: 'Intuition',
        description: 'Increases your knowledge by 0.1 line of code per minute',
        cost: 10,
        increase: 0.1,
        cost_increase: 1.1,
    },
    {
        resource: 'Wikipedia',
        description: 'Increases your knowledge by 0.2 lines of code per minute',
        cost: 100,
        increase: 0.2,
        cost_increase: 1.2,
    },
    {
        resource: 'W3Schools',
        description: 'Increases your knowledge by 0.5 lines of code per minute',
        cost: 1000,
        increase: 0.5,
        cost_increase: 1.5,
    },
    {
        resource: 'GeeksforGeeks',
        description: 'Increases your knowledge by 0.8 lines of code per minute',
        cost: 10000,
        increase: 0.8,
        cost_increase: 1.8,
    },
    {
        resource: 'Stack Overflow',
        description: 'Increases your knowledge by 1 line of code per minute',
        cost: 100000,
        increase: 1,
        cost_increase: 2,
    },
    {
        resource: 'YouTube Tutorials',
        description: 'Increases your knowledge by 2 lines of code per minute',
        cost: 1000000,
        increase: 2,
        cost_increase: 3,
    },
    {
        resource: 'Udemy',
        description: 'Increases your knowledge by 5 lines of code per minute',
        cost: 10000000,
        increase: 5,
        cost_increase: 4,
    },
    {
        resource: 'Just Google It',
        description: 'Increases your knowledge by 10 lines of code per minute',
        cost: 100000000,
        increase: 10,
        cost_increase: 5,
    },
    {
        resource: 'ChatGPT',
        description: 'Increases your knowledge by 20 lines of code per minute',
        cost: 1000000000,
        increase: 20,
        cost_increase: 6,
    },
    {
        resource: 'GitHub Copilot',
        description: 'Increases your knowledge by 50 lines of code per minute',
        cost: 10000000000,
        increase: 50,
        cost_increase: 7,
    },
];

const upgrade = new SlashCommandBuilder()
    .setName('upgrade')
    .setDescription('Upgrade your knowledge')
    .addStringOption(option =>
        option.setName('resource')
        .setDescription('Give me a resource to upgrade')
        .setRequired(false));

const upgradeJSON = upgrade.toJSON();

const calculateCost = (baseCost, level, costIncrease) => {
    return baseCost * Math.pow(costIncrease, level - 1);
};

const upgradeHandler = async (interaction) => {
    const resource = interaction.options.getString('resource');
    const discordId = interaction.user.id;

    if (!resource) {
        const user = await User.findOne({ discordId });
        if (!user) {
            await interaction.reply('User not found in the database.');
            return;
        }

        // Fetch or create KnowledgeUpgrade documents for each upgrade
        const knowledgeUpgrades = {};
        for (const upgrade of upgrades) {
            let knowledgeUpgrade = await KnowledgeUpgrade.findOne({ discordId, resource: upgrade.resource.toLowerCase() });
            if (!knowledgeUpgrade) {
                knowledgeUpgrade = await KnowledgeUpgrade.create({ discordId, resource: upgrade.resource.toLowerCase() });
            }
            knowledgeUpgrades[upgrade.resource.toLowerCase()] = knowledgeUpgrade;
        }

        const upgradeList = upgrades.map((upgrade) => {
            const knowledgeUpgrade = knowledgeUpgrades[upgrade.resource.toLowerCase()];
            const userLevel = knowledgeUpgrade.level || 1;
            const cost = calculateCost(upgrade.cost, userLevel, upgrade.cost_increase);

            return `**${upgrade.resource} - Cost: ${cost.toFixed(2)} - Level: ${userLevel}**\n${upgrade.description}`;
        });

        await interaction.reply(`### Available upgrades (Your Knowledge -> ${user.knowledge}):\n${upgradeList.join('\n')}`);
    } else {
        const selectedUpgrade = upgrades.find((upgrade) => upgrade.resource.toLowerCase() === resource.toLowerCase());

        if (!selectedUpgrade) {
            await interaction.reply(`The specified resource '${resource}' is not valid.`);
            return;
        }

        const user = await User.findOne({ discordId });
        if (!user) {
            await interaction.reply('User not found in the database.');
            return;
        }

        // Fetch or create KnowledgeUpgrade document for the specified upgrade
        let knowledgeUpgrade = await KnowledgeUpgrade.findOne({ discordId, resource: resource.toLowerCase() });
        if (!knowledgeUpgrade) {
            knowledgeUpgrade = await KnowledgeUpgrade.create({ discordId, resource: resource.toLowerCase() });
        }

        const userLevel = knowledgeUpgrade.level || 1;
        const cost = calculateCost(selectedUpgrade.cost, userLevel, selectedUpgrade.cost_increase);

        if (user.knowledge < cost) {
            await interaction.reply(`You don't have enough knowledge to upgrade '${resource}'. Required knowledge: ${cost.toFixed(2)}`);
            return;
        }

        user.knowledge -= cost;
        user.coding_speed += selectedUpgrade.increase;
        user.save();

        // Update user's knowledge upgrade level
        knowledgeUpgrade.level = (knowledgeUpgrade.level || 1) + 1;
        knowledgeUpgrade.add_speed = knowledgeUpgrade.add_speed + selectedUpgrade.increase;
        knowledgeUpgrade.save();

        await interaction.reply(`Successfully upgraded '${resource}'! Your new knowledge level: ${knowledgeUpgrade.level}`);
    }
}

module.exports = {
    upgradeJSON,
    upgradeHandler,
};