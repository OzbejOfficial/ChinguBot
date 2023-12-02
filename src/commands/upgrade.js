const User = require('../db/User');
const KnowledgeUpgrade = require('../db/KnowledgeUpgrade');

const { EmbedBuilder } = require('discord.js');

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

const calculateCost = (base_cost, level, cost_increase) => {
    let cost = base_cost;
    for (let i = 0; i < level; i++) {
        cost *= cost_increase;
    }
    return cost;
}

const upgradeJSON = {
    name: 'upgrade',
    description: 'Upgrade your resources',
    options: [
        {
            name: 'resource',
            type: 3,
            description: 'The resource you want to upgrade',
            required: false,
            choices: upgrades.map(upgrade => {
                return {
                    name: upgrade.resource,
                    value: upgrade.resource,
                };
            }),
        },
        {
            name: 'amount',
            type: 3,
            description: 'The amount of times you want to upgrade the resource',
            required: false,
        },
    ],
}

const upgradeHandler = async (interaction) => {
    const { options } = interaction;

    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
        return interaction.reply({
            content: 'You have not registered for the advent calendar',
            ephemeral: true,
        });
    }

    const resource = options.getString('resource');

    if (!resource) {
        const embed = new EmbedBuilder()
            .setTitle('Upgrades')
            .setDescription('Your current Knowledge: ' + (Math.round(user.knowledge * 100) / 100) + '\n\n');

        for (const upgrade of upgrades) {
            const knowledgeUpgrade = await KnowledgeUpgrade.findOne({ discordId: interaction.user.id, resource: upgrade.resource.toLowerCase() });
            const userLevel = knowledgeUpgrade.level || 1;
            const cost = calculateCost(upgrade.cost, userLevel, upgrade.cost_increase);
    
            embed.addFields({
                name: `${upgrade.resource} - Cost: ${cost.toFixed(2)} - Level: ${userLevel}`,
                value: upgrade.description,
            });
        }

        return interaction.reply({
            embeds: [embed],
        });
    }

    let amount;
    if (options.getString('amount')) {
        let option_value = options.getString('amount');
        if (option_value === 'max') {
            option_value = 1000000;
        }

        amount = parseInt(option_value);
        if (isNaN(amount)) {
            return interaction.reply({
                content: 'Invalid amount',
                ephemeral: true,
            });
        }
    } else {
        amount = 1;
    }

    const upgrade = upgrades.find(upgrade => upgrade.resource === resource);

    if (!upgrade) {
        return interaction.reply({
            content: 'Invalid resource',
            ephemeral: true,
        });
    }

    const knowledgeUpgrade = await KnowledgeUpgrade.findOne({ discordId: interaction.user.id, resource: resource.toLowerCase() });
    for(let i = 0; i < amount; i++) {
        const cost = calculateCost(upgrade.cost, knowledgeUpgrade.level, upgrade.cost_increase);
        if (user.knowledge < cost) {
            return interaction.reply({
                content: `You don't have enough knowledge to upgrade '${resource}'. Required knowledge: ${cost.toFixed(2)}`,
                ephemeral: true,
            });
        }

        user.knowledge -= cost;
        user.coding_speed += upgrade.increase;

        knowledgeUpgrade.level += 1;
        knowledgeUpgrade.add_speed += upgrade.increase;
    }

    await user.save();
    await knowledgeUpgrade.save();

    return interaction.reply({
        content: `You have successfully upgraded your ${resource} by ${amount} levels`,
    });
};

module.exports = {
    upgradeJSON,
    upgradeHandler,
};