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

		//Button builder for active buttons
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('skipToStart')
					.setLabel('⏪')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('back')
					.setLabel('◀️')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('blankSpacer')
					.setLabel('---')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('▶️')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('skipToEnd')
					.setLabel('⏩')
					.setStyle(ButtonStyle.Primary),
			);

		//Button builder - all disabled
		const row_stopped = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('skipToStart')
					.setLabel('⏪')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('back')
					.setLabel('◀️')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('blankSpacer')
					.setLabel('---')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('▶️')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('skipToEnd')
					.setLabel('⏩')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
			);

		let header, json, playerID, response;

		let arrayPosition = 0;

		try {
			switch(cmd) {
				case "top": {
					response = await fetch(`https://api.rec.net/api/images/v3/feed/global`)
				} break;
				case "by-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					response = await fetch(`https://api.rec.net/api/images/v4/player/${playerID}`)
				} break;
				case "of-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					response = await fetch(`https://api.rec.net/api/images/v3/feed/player/${playerID}`)
				} break;
			}

			response = await response.json();

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

			const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

			collector.on('collect', async i => {
				if (i.user.id === interaction.user.id) {
					switch (i.customId) {
						case "back": {if (arrayPosition > 0) arrayPosition-- } break;
						case "next": {if (arrayPosition < 62) arrayPosition++ } break;
						case "skipToStart": {arrayPosition = 0 } break;
						case "skipToEnd": {arrayPosition = 63} break;
					}

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
					await i.update({ embeds: [embed], components: [row] });
				} else {
					await  i.reply({content: "❌ **This isn't your carousel!**\n\nYou can make your own with </image-carousel top:1075581781841018960>, </image-carousel by-player:1075581781841018960>, or </image-carousel of-player:1075581781841018960>.", ephemeral: true})
				}
			});
			
			collector.on('end', async collected => {
				return await interaction.editReply({ components: [row_stopped] });
			});
		} catch(e) {
			console.log(e)
			interaction.editReply("❌ **There was an error with your request.\n\nEither the requested image is invalid, or there's an internal issue.**"); 
			return;
		}

		/***
		 * @param {int} arrayPos Array position
		 */
		async function getImage(arrayPos){
			var _json = response
			switch(cmd) {
				case "top": {
					_json = _json[arrayPos]
					playerID = _json.PlayerId
					header = `Top image of rec.net #${arrayPos+1}`
				} break;
				case "by-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					_json = _json[arrayPos]
					header = `Newest image created by ${await getPlayerNameFromID(playerID)} #${arrayPos+1}`
				} break;
				case "of-player": {
					playerID = await getPlayerIDFromName(interaction.options.getString("username"))
					_json = _json[arrayPos]
					header = `Newest image containing ${await getPlayerNameFromID(playerID)} #${arrayPos+1}`
				} break;
			}

			return _json;
		}
	},
};