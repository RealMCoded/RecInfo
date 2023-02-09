const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const project = require('../package.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('About the bot!'),
	async execute(interaction) {
		const cmd = interaction.options.getSubcommand()

        var revision = require('child_process')
                    .execSync('git rev-parse HEAD')
                    .toString().substring(0, 7);

		const embed = new EmbedBuilder()
			.setTitle(`About RecInfo`)
			.setDescription(`Version ${project.version} ([commit \`${revision}\`](https://github.com/RealMCoded/RecInfo/commit/${revision}))\n\nBot created by [stuartt#5679](https://discord.com/users/284804878604435476) // [@stuartt](https://rec.net/user/stuartt)`)
		interaction.editReply({ embeds: [embed] });
	},
};