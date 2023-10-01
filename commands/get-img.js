const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { getPlayerNameFromID, getRoomNameFromID, getPlayerIDFromName, randomColor } = require("../util.js")

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
				string.setName("username")
					.setRequired(true)
					.setDescription("The players username")))
		.addSubcommand(subcommand =>
			subcommand
			.setName("of-player")
			.setDescription("Get images taken of a single player!")
			.addStringOption(string =>
				string.setName("username")
					.setRequired(true)
					.setDescription("The players username")))
		.addSubcommand(subcommand =>
			subcommand
			.setName("id")
			.setDescription("Get an image by it's ID")
			.addStringOption(string =>
				string.setName("id")
					.setRequired(true)
					.setDescription("The image ID"))),
	async execute(interaction) {
		const cmd = interaction.options.getSubcommand()
		await interaction.deferReply()

		let header, json, playerID;

		try {
			switch(cmd) {
				case "top": {
					const response = await fetch(`https://apim.rec.net/apis/api/images/v3/feed/global`)
					json = await response.json();
					json = json[0]
					playerID = json.PlayerId
					header = "Top image of rec.net"
				} break;
				case "by-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					const response = await fetch(`https://apim.rec.net/apis/api/images/v4/player/${playerID}`)
					json = await response.json();
					json = json[0]
					header = `Newest image created by ${await getPlayerNameFromID(playerID)}`
				} break;
				case "of-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					const response = await fetch(`https://apim.rec.net/apis/api/images/v3/feed/player/${playerID}`)
					json = await response.json();
					json = json[0]
					var __playerID = playerID
					playerID = json.PlayerId
					header = `Newest image containing ${await getPlayerNameFromID(__playerID)}`
				} break;
				case "id": {
					const params = new URLSearchParams();
					params.append('IDs', interaction.options.getString("id"));
					const response = await fetch(`https://api.rec.net/api/images/v3/bulk`, {method: 'POST', body: params})
					json = await response.json();
					json = json[0]
					playerID = json.PlayerId
					header = `Image uploaded by ${await getPlayerNameFromID(playerID)}`
				} break;
			}

			let uname = await getPlayerNameFromID(playerID)
			let room = await getRoomNameFromID(json.RoomId)

			if (room == null) {room = "*(unknown)*"} else {room = `[${room}](https://rec.net/room/${room})`}

			const embed = new EmbedBuilder()
				.setTitle(`${header} - \`${json.Id}\``)
				.setURL(`https://rec.net/image/${json.Id}`)
				.setImage(`https://img.rec.net/${json.ImageName}`)
				.setDescription(`*\"${json.Description ?? "( no description provided )"}\"*`)
				.setColor(randomColor())
				.addFields(
					{ name: 'Taken by', value: `[${uname}](https://rec.net/user/${uname})`, inline: true },
					{ name: 'Room', value: room, inline: true },
					{ name: 'Cheers', value: `${json.CheerCount.toLocaleString("en-US")}`, inline: true },
					{ name: 'Comments', value: `${json.CommentCount.toLocaleString("en-US")}`, inline: true },
			)
			interaction.editReply({ embeds: [embed] });
		} catch(e) {
			console.log(e)
			interaction.editReply("❌ **There was an error with your request.\n\nEither the requested image is invalid, or there's an internal issue.**"); 
			return;
		}
	},
};