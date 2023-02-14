<div align="center">
<img src="./readme/logoText.png" alt="A blurple Rec Room logo." width="512" height="205">
</div>

---

A Discord bot that shows User, Room, and Image info from rec.net! *Not affiliated with Rec Room Inc.*

[Invite the bot here!](https://discord.com/api/oauth2/authorize?client_id=519559308980256771&permissions=18432&scope=bot)

## Features

- Get user info!

- Get room info!

- Show images from rec.net!

## Screenshots

![](./readme/0.png)

![](./readme/1.png)

![](./readme/2.png)

## Building

Make sure you have [node.js](https://nodejs.org/en/) installed.

1. Fork the bot

```
git clone https://github.com/RealMCoded/RecInfo
cd RecInfo
```

2. Download dependencies

```
npm i
```

3. Clone and edit the config file

```
cp config.json.template config.json
$EDITOR config.json
```

4. Deploy the commands and start the bot

```
node deploy
node index
```