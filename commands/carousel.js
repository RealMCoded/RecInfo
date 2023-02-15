const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const fetch = require('node-fetch');
const { getPlayerNameFromID, getRoomNameFromID, getPlayerIDFromName, randomColor } = require("../util.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('image-carousel')
		.setDescription('rec room')
		.addSubcommand(subcommand =>
			subcommand
			.setName("top")
			.setDescription("Get the top 64 images from rec.net!"))
		.addSubcommand(subcommand =>
			subcommand
			.setName("by-player")
			.setDescription("Get the first 64 images taken by a player!")
			.addStringOption(string =>
				string.setName("username")
					.setRequired(true)
					.setDescription("The players username")))
		.addSubcommand(subcommand =>
			subcommand
			.setName("of-player")
			.setDescription("Get the first 64 images taken of a player!")
			.addStringOption(string =>
				string.setName("username")
					.setRequired(true)
					.setDescription("The players username"))),
	async execute(interaction) {
		const cmd = interaction.options.getSubcommand()
		await interaction.deferReply()

		//Button builder
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('back')
					.setLabel('prev')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('stop')
					.setLabel('stop')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('next')
					.setStyle(ButtonStyle.Primary),
			);

		let header, json, playerID;

		let arrayPosition = 0;

		try {
			json = await getImage(arrayPosition)

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
			interaction.editReply({ embeds: [embed], components: [row], fetchReply: true });

			const collector = interaction.channel.createMessageComponentCollector({ time: 15000 });

			collector.on('collect', async i => {
				arrayPosition++
				json = await getImage(arrayPosition)

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
				await i.update({ embeds: [embed], components: [row], fetchReply: true });
			});
			
			collector.on('end', collected => console.log(`Collected ${collected.size} items`));
		} catch(e) {
			console.log(e)
			interaction.editReply("❌ **There was an error with your request.\n\nEither the requested image is invalid, or there's an internal issue.**"); 
			return;
		}

		/***
		 * @param {int} arrayPos Array position
		 */
		async function getImage(arrayPos){
			var _json;
			switch(cmd) {
				case "top": {
					const response = await fetch(`https://api.rec.net/api/images/v3/feed/global`)
					_json = await response.json();
					_json = _json[arrayPos]
					playerID = _json.PlayerId
					header = "Top image of rec.net"
				} break;
				case "by-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					const response = await fetch(`https://api.rec.net/api/images/v4/player/${playerID}`)
					_json = await response.json();
					_json = _json[arrayPos]
					header = `Newest image created by ${await getPlayerNameFromID(playerID)}`
				} break;
				case "of-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					const response = await fetch(`https://api.rec.net/api/images/v3/feed/player/${playerID}`)
					_json = await response.json();
					_json = _json[arrayPos]
					playerID = _json.PlayerId
					header = `Newest image containing ${await getPlayerNameFromID(playerID)}`
				} break;
			}

			return _json;
		}
	},
};