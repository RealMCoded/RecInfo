const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

//TODO: IMAGE ID GETTING

/*
	Make a POST request to https://api.rec.net/api/images/v3/bulk

	Ids%5B%5D=YOUR_ID_HERE
*/

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-image')
		.setDescription('rec room')
		.addSubcommand(subcommand =>
			subcommand
			.setName("top")
			.setDescription("Get the top image from rec.net!"))
		.addSubcommand(subcommand =>
			subcommand
			.setName("by-player")
			.setDescription("Get images taken by a single player!")
			.addStringOption(string =>
				string.setName("id")
					.setRequired(true)
					.setDescription("The players ID")))
		.addSubcommand(subcommand =>
			subcommand
			.setName("of-player")
			.setDescription("Get images taken of a single player!")
			.addStringOption(string =>
				string.setName("id")
					.setRequired(true)
					.setDescription("The players ID"))),
	async execute(interaction) {
		const cmd = interaction.options.getSubcommand()
		await interaction.deferReply()

		let header, json

		try {
			switch(cmd) {
				case "top": {
					const response = await fetch(`https://api.rec.net/api/images/v3/feed/global`)
					json = await response.json();
					json = json[0]
					header = "Top image of rec.net"
				} break;
				case "by-player": {
					const response = await fetch(`https://api.rec.net/api/images/v4/player/${interaction.options.getString("id")}`)
					json = await response.json();
					json = json[0]
					header = `Newest image created by ${interaction.options.getString("id")}`
				} break;
				case "of-player": {
					const response = await fetch(`https://api.rec.net/api/images/v3/feed/player/${interaction.options.getString("id")}`)
					json = await response.json();
					json = json[0]
					header = `Newest image containing ${interaction.options.getString("id")}`
				} break;
			}

			const embed = new EmbedBuilder()
				.setTitle(`${header} - ${json.Id}`)
				.setURL(`https://rec.net/image/${json.Id}`)
				.setImage(`https://img.rec.net/${json.ImageName}`)
				.setDescription(`*\"${json.Description ?? "( no description provided )"}\"*`)
				.addFields(
					{ name: 'Taken by (Player ID)', value: `${json.PlayerId}`, inline: true },
					{ name: 'Room ID', value: `${json.RoomId}`, inline: true },
					{ name: 'Cheers', value: `${json.CheerCount}`, inline: true },
					{ name: 'Comments', value: `${json.CommentCount}`, inline: true },
			)
			interaction.editReply({ embeds: [embed] });
		} catch(e) {
			console.log(e)
			interaction.editReply("❌ **There was an error with your request.\n\nEither the requested image is invalid, or there's an internal issue.**"); 
			return;
		}
	},
};