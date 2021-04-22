const { prefix, token } = require("./config.json");

const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
    console.log("Snowplace bot has started!");
    client.user.setActivity(".snowplace <id1> <id2>")
});

client.on("message", (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
    const command = args.shift();

    if (command == "snowplace") {
        // If not enough args
        if (args.length < 2) {
            sendInvalidError(message.channel);
        }
        // If args are numbers
        else if (isNumeric(args[0]) && isNumeric(args[1]) && args[0].length > 8 && args[1].length > 8) {
            const id1 = args[0];
            const id2 = args[1];
            const service = args[2];

            const discordEpoch = 1420070400000;
            const hivenEpoch = 1562544000000;
            const twitterEpoch = 1288834974657;

            // check what service (by default discord, if input is incorrect or empty)
            switch (service) {
                case "hiven":
                    getResults(id1, id2, message, hivenEpoch);
                    break;
                case "twitter":
                    getResults(id1, id2, message, twitterEpoch);
                    break;
                default:
                    getResults(id1, id2, message, discordEpoch);
            }
        }
        else {
            sendInvalidError(message.channel);
        }
    }
});


function sendInvalidError(channel) {
    const embed = new Discord.MessageEmbed()
        .setColor("#48dff3")
        .setTitle("Invalid Usage")
        .addField("Usage", "To compare message ID timestamps, use:\n`" + prefix + "snowplace <id 1> <id 2> [service]`")
        .addField("Services", "discord, hiven, twitter (default discord)")
        .addField("Links", "*<:pepega:739989836592709684> [How do I find the message ID?](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)*\n[Invite Bot](https://discord.com/oauth2/authorize?client_id=834658971896774686&scope=bot&permissions=8) - [Website](https://snow.place) - [GitHub](https://github.com/smuke/)\n")
        .setFooter("Try Snow.place in your browser!", "https://cdn.glitch.com/0967da06-2ba6-4b43-b2a6-d4912fa3e754%2Ffavicon.png");

    channel.send(embed);
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

// Get and send results

function getResults(id1, id2, message, epoch) {
    // First id
    const timeLocal1 = makePretty(getDate(id1, epoch));
    const timeUTC1 = makePrettyUTC(getDate(id1, epoch));
    const timeUnix1 = getUnixTimestamp(getDate(id1, epoch));
    // Second id
    const timeLocal2 = makePretty(getDate(id2, epoch));
    const timeUTC2 = makePrettyUTC(getDate(id2, epoch));
    const timeUnix2 = getUnixTimestamp(getDate(id2, epoch));
    
    if (getDate(id1, epoch) < getDate(id2, epoch)) {
        let diffdate = formatDiff(
            getDiff(getDate(id1, epoch), getDate(id2, epoch))
        );
        message.channel.send("FIRST IS FASTER BY " + diffdate);
    }
    else if (getDate(id1, epoch) > getDate(id2, epoch)) {
        let diffdate = formatDiff(
            getDiff(getDate(id1, epoch), getDate(id2, epoch))
        );
        message.channel.send("SECOND IS FASTER BY " + diffdate);
    }
    else {
        message.channel.send("error");
    }

    message.channel.send(`**FIRST ID** Local time: ${timeLocal1} - UTC time: ${timeUTC1} - Unix time: ${timeUnix1}`);
    message.channel.send(`**SECOND ID** Local time: ${timeLocal2} - UTC time: ${timeUTC2} - Unix time: ${timeUnix2}`);
}


// Get results

function getDate(id, epoch) {
    const idint = BigInt.asUintN(64, id);
    const binarydate = Number(idint >> 22n);
    return new Date(binarydate + epoch);
}

function makePretty(date) {
    return (
        `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ` +
        date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",

            hour12: true
        })
    );
}

function makePrettyUTC(date) {
    return (
        `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ` +
        date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",

            hour12: true,
            timeZone: "UTC"
        })
    );
}

function getUnixTimestamp(date) {
    return date.getTime() / 1000;
}

function getDiff(date1, date2) {
    return Math.abs(date1 - date2);
}

function formatDiff(ms) {
    let seconds = ms / 1000;
    let minutes = seconds / 60;
    let hours = minutes / 60;
    let days = hours / 24;
    const msexcess = Math.floor(ms % 1000);

    const humanized = `${Math.floor(days)}d ${Math.floor(
        hours % 24
    )}h ${Math.floor(minutes % 60)}m ${Math.floor(seconds % 60)}s ${msexcess}ms`;

    return humanized;
}

client.login(token);