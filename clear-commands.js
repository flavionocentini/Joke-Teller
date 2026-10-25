require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.TOKEN);
const scope = process.argv[2];

(async () => {
  if (scope === 'global') {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
    console.log('Global commands cleared');
  } else if (scope === 'guild') {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] },
    );
    console.log('Guild commands cleared');
  } else {
    console.log('Use: node clear-commands.js global|guild');
  }
})().catch(console.error);
