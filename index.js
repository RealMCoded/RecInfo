const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType  } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(`✅ Signed in as ${client.user.tag}! \n`);
	client.user.setActivity('Rec Room', { type: ActivityType.Playing });
});

client.on('interactionCreate', async interaction => {
	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(`❌ uh oh! ${error}`);
		await interaction.reply({ content: `⚠️ **Something bad happened while executing that command. [Open an issue on GitHub](https://github.com/RealMCoded/RecInfo/issues/new) with the error below.**\n\n${codeBlock(js, error)}`, ephemeral: true });
	}
});

client.login(token);