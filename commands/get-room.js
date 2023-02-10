const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { getNameFromID } = require("../util.js")

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
			id = `/${interaction.options.getString("id")}`
		} else if(cmd == "name"){
			id = `?name=${interaction.options.getString("name")}`
		}

		try {
			const response = await fetch(`https://rooms.rec.net/rooms${id}`)
			const json = await response.json();

			if (json.title) return interaction.editReply("❌ **Invalid room name/id!**"); //Error checking

			const roomowner = await getNameFromID(json.CreatorAccountId)

			const embed = new EmbedBuilder()
				.setTitle(`^${json.Name} - ${json.RoomId}`)
				.setURL(`https://rec.net/room/${json.Name}`)
				.setImage(`https://img.rec.net/${json.ImageName}`)
				.setDescription(json.Description)
				.addFields(
					{ name: 'Room ID (deprecated)', value: `${json.RoomId}`, inline: true },
					{ name: 'Doom Room?', value: `${json.IsDorm}`, inline: true },
					{ name: 'Max Players', value: `${json.MaxPlayers}`, inline: true },
					{ name: 'Room Owner', value: `[${roomowner}](https://rec.net/user/${roomowner})`, inline: true },
				)
			if(cmd == "id"){interaction.editReply({ content:"⚠️ **Room IDs are no longer supported by the Rec Room API.**", embeds: [embed] });} else {interaction.editReply({ embeds: [embed] });}
		} catch(e) {
			console.log(e)
			interaction.editReply("❌ **There was an error with your request.\n\nEither the requested room is invalid, or there's an internal issue.**"); 
			return;
		}
	},
};