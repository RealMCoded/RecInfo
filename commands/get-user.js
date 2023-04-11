const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { randomColor, random } = require("../util.js")
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-user')
		.setDescription('rec room')
		.addSubcommand(subcommand =>
			subcommand
			.setName("id")
			.setDescription("Get a Rec Room user from their ID")
			.addStringOption(string =>
				string.setName("id")
					.setRequired(true)
					.setDescription("the ID of the user")))
		.addSubcommand(subcommand =>
			subcommand
			.setName("random")
			.setDescription("Get a random Rec Room user"))
		.addSubcommand(subcommand =>
			subcommand
			.setName("username")
			.setDescription("Get a Rec Room user from their username")
			.addStringOption(string =>
				string.setName("username")
					.setRequired(true)
					.setDescription("The username of the user"))),
	async execute(interaction) {
		const cmd = interaction.options.getSubcommand()
		await interaction.deferReply()

		let id

		if(cmd == "id"){
			id = `/${interaction.options.getString("id")}`
		} else if(cmd == "username"){
			id = `?username=${interaction.options.getString("username")}`
		} else if(cmd == "random"){
			id = `/${random(1903833159)}` //A user from March 29, 2023 3:43 PM. TODO: Find a way to get the newest rec room user!
		}

		try {
			const response = await fetch(`https://accounts.rec.net/account${id}`)
			const json = await response.json();

			if (json.errors) {
				interaction.editReply("❌ **User ID must be greater than 0!**"); 
				return;
			}

			const response2 = await fetch(`https://accounts.rec.net/account/${json.accountId}/bio`)
			const jsonbio = await response2.json();

			const joinDate = Math.round(Date.parse(json.createdAt)/1000)

			const embed = new EmbedBuilder()
				.setTitle(`${json.displayName} ${json.displayEmoji ?? ""} (@${json.username}) - \`${json.accountId}\``)
				.setURL(`https://rec.net/user/${json.username}`)
				.setThumbnail(`https://img.rec.net/${json.profileImage}?cropSquare=true&width=192&height=192`)
				.setDescription(jsonbio.bio == "" ? null : jsonbio.bio )
				.setColor(randomColor())
				.addFields(
					{ name: 'Account ID', value: `\`${json.accountId}\``, inline: true },
					{ name: 'Username', value: `${json.username}`, inline: true },
					{ name: 'Display Name', value: `${json.displayName}`, inline: true },
					//{ name: '\u200B', value: '\u200B' },
					{ name: 'Profile Image', value: `[here](https://img.rec.net/${json.profileImage})`, inline: true },
					{ name: 'Banner Image', value: `[here](https://img.rec.net/${json.bannerImage})`, inline: true },
					//{ name: '\u200B', value: '\u200B' },
					{ name: 'Junior?', value: `${json.isJunior}`, inline: true },
					{ name: 'Platforms', value: `${json.platforms}`, inline: true },
					{ name: 'Pronouns', value: `${json.personalPronouns}`, inline: true },
					{ name: 'Identity Flags', value: `${json.identityFlags}`, inline: true },
					{ name: 'Joined', value: `<t:${joinDate}:f> (<t:${joinDate}:R>)`, inline: true },
				)
			interaction.editReply({ embeds: [embed] });
		} catch(e) {
			console.log(e)
			interaction.editReply("❌ **There was an error with your request.\n\nEither the requested user is invalid, or there's an internal issue.**"); 
			return;
		}
	},
};