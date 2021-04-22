const { prefix, token } = require("./config.json");

const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
    console.log("Snowplace has started!");
    client.user.setActivity(".snowplace <id1> <id2>")
});

client.on("message", (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

    if (command == "snowplace") {
        if (args.length < 2) {
            const embed = new Discord.MessageEmbed()
                .setColor("#5c6773")
                .setTitle("Invalid Usage")
                .addField("Usage", "To compare message ID timestamps, use:\n`" + prefix +"snowplace <message id 1> <message id 2>`")
                .addField("Links", "*[<:pepega:739989836592709684> How do I find the message ID?](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)*\n[Invite Bot](https://discord.com/oauth2/authorize?client_id=834658971896774686&scope=bot&permissions=8) - [Website](https://snow.place) - [GitHub](https://github.com/smuke/)\n")
                .setFooter("Try Snow.place in your browser!", "https://cdn.glitch.com/0967da06-2ba6-4b43-b2a6-d4912fa3e754%2Ffavicon.png")
            
            message.channel.send(embed);
        }
        else if (isNaN(args[0]) == false && isNaN(args[1]) == false) {
            message.channel.send("valid")
        }
        else {
            message.channel.send("invalid")
        }
    }
});

client.login(token);