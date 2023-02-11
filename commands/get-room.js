const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { getPlayerNameFromID } = require("../util.js")

/*
	TODO: Rewrite ALL room GETs to use `https://rooms.rec.net/rooms/bulk?Id={{id}}`
*/

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-room')
		.setDescription('rec room')
		.addSubcommand(subcommand =>
			subcommand
			.setName("id")
			.setDescription("Get a Rec Room from its ID")
			.addStringOption(string =>
				string.setName("id")
					.setRequired(true)
					.setDescription("the ID of the room")))
		.addSubcommand(subcommand =>
			subcommand
			.setName("name")
			.setDescription("Get a Rec Room from its name")
			.addStringOption(string =>
				string.setName("name")
					.setRequired(true)
					.setDescription("The name of the room"))),
	async execute(interaction) {
		const cmd = interaction.options.getSubcommand()
		await interaction.deferReply()

		let id

		if(cmd == "id"){
			id = `?id=${interaction.options.getString("id")}`
		} else if(cmd == "name"){
			id = `?name=${interaction.options.getString("name")}`
		}

		try {
			const response = await fetch(`https://rooms.rec.net/rooms/bulk${id}`)
			const json = await response.json();

			//Error checking
			if (json.title) return interaction.editReply("❌ **Invalid room name/id!**");
			if (json.length == 0) return interaction.editReply("❌ **Invalid room name/id!**");

			const roomowner = await getPlayerNameFromID(json[0].CreatorAccountId)

			const embed = new EmbedBuilder()
				.setTitle(`^${json[0].Name} - ${json[0].RoomId}`)
				.setURL(`https://rec.net/room/${json[0].Name}`)
				.setImage(`https://img.rec.net/${json[0].ImageName}`)
				.setDescription(json[0].Description)
				.addFields(
					{ name: 'Room ID', value: `${json[0].RoomId}`, inline: true },
					{ name: 'Doom Room?', value: `${json[0].IsDorm}`, inline: true },
					{ name: 'Max Players', value: `${json[0].MaxPlayers}`, inline: true },
					{ name: 'Room Owner', value: `[${roomowner}](https://rec.net/user/${roomowner})`, inline: true },
				)
			interaction.editReply({ embeds: [embed] });
		} catch(e) {
			console.log(e)
			interaction.editReply("❌ **There was an error with your request.\n\nEither the requested room is invalid, or there's an internal issue.**"); 
			return;
		}
	},
};