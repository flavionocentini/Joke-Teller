require('dotenv').config();
const {
  ActionRowBuilder,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ComponentType,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
} = require('discord.js');

const YELLOW = 0xffd700;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  c.user.setPresence({
    activities: [{ name: '/help', type: ActivityType.Listening }],
    status: 'online',
  });
});

function buildRow(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('see_answer')
      .setLabel('See answer')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
  );
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'help') {
    const embed = new EmbedBuilder()
      .setColor(YELLOW)
      .setTitle('Joke Teller Help')
      .setDescription('Get a random joke and reveal the answer when you are ready.')
      .addFields(
        { name: '/joke', value: 'Sends a random joke with a **See answer** button underneath.' },
        {
          name: '/joke category:<choice>',
          value: 'Optional. Pick a category: Any, Programming, Misc, Pun, Spooky, Christmas, Dark.',
        }
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'joke') {
    await interaction.deferReply();
    const category = interaction.options.getString('category') ?? 'Any';

    let data;
    try {
      const url =
        `https://v2.jokeapi.dev/joke/${category}` +
        `?type=twopart&blacklistFlags=nsfw,religious,political,racist,sexist,explicit`;
      const res = await fetch(url);
      data = await res.json();
    } catch (err) {
      console.error(err);
      return interaction.editReply('Could not reach the joke API, try again.');
    }

    if (data.error) {
      return interaction.editReply('No joke found for that category, try another.');
    }

    const embed = new EmbedBuilder()
      .setColor(YELLOW)
      .setTitle(`${data.category} joke`)
      .setDescription(data.setup);

    const message = await interaction.editReply({
      embeds: [embed],
      components: [buildRow()],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', async (i) => {
      const revealed = EmbedBuilder.from(embed).addFields({
        name: 'Answer',
        value: data.delivery,
      });
      await i.update({ embeds: [revealed], components: [buildRow(true)] });
      collector.stop('answered');
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'answered') return;
      await message.edit({ components: [buildRow(true)] }).catch(() => {});
    });
  }
});

client.login(process.env.TOKEN);
