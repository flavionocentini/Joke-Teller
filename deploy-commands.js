require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('Pick a joke category (default: Any)')
        .setRequired(false)
        .addChoices(
          { name: 'Any', value: 'Any' },
          { name: 'Programming', value: 'Programming' },
          { name: 'Misc', value: 'Misc' },
          { name: 'Pun', value: 'Pun' },
          { name: 'Spooky', value: 'Spooky' },
          { name: 'Christmas', value: 'Christmas' },
          { name: 'Dark', value: 'Dark' },
        ),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('How to use the /joke command')
    .toJSON(),
];

const rest = new REST().setToken(process.env.TOKEN);
const isGlobal = process.argv[2] === 'global';

(async () => {
  const route = isGlobal
    ? Routes.applicationCommands(process.env.CLIENT_ID)
    : Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);

  await rest.put(route, { body: commands });
  console.log(`Commands registered (${isGlobal ? 'global' : 'guild'})`);
})().catch(console.error);
