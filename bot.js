const { prefix, token } = require("./config.json");

const { Client, Intents, MessageEmbed, MessageAttachment } = require("discord.js");
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
const client = new Client({ intents: myIntents });

const { createCanvas, registerFont, loadImage } = require("canvas")
registerFont("Poppins-Regular.ttf", { family: "Poppins Regular" })
registerFont("Poppins-Medium.ttf", { family: "Poppins Medium" })

client.once("ready", () => {
    console.log("Snowplace bot has started!");
    client.user.setActivity(`snow.place | ${prefix}help`)
});

client.on("messageCreate", (message) => {
    console.log("message received");

    if (message.author.bot || !message.content.startsWith(prefix)) return;
    const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
    const command = args.shift();



    if (command == "compare") {
        // If not enough args
        if (args.length < 1 || args.length > 3) {
            sendInvalidError(message.channel);
        }
        // If args are numbers
        else if (isNumeric(args[0]) && isNumeric(args[1])) {
            const id1 = args[0];
            const id2 = args[1];
            const service = args[2];

            const discordEpoch = 1420070400000;
            const hivenEpoch = 1562544000000;
            const twitterEpoch = 1288834974657;

            // check what service (by default discord, if input is incorrect or empty)
            switch (service) {
                case "hiven":
                    getResults(id1, id2, message, hivenEpoch, "Hiven");
                    break;
                case "twitter":
                    getResults(id1, id2, message, twitterEpoch, "Twitter");
                    break;
                default:
                    getResults(id1, id2, message, discordEpoch, "Discord");
            }
        }
        else {
            sendInvalidError(message.channel);
        }
    }
    if (command == "help") {
        sendInvalidError(message.channel);
    }
});


function sendInvalidError(channel) {
    const embed = new MessageEmbed()
        .setColor("#48dff3")
        .addField("Usage", "To compare message ID timestamps, use:\n`" + prefix + "compare <id 1> <id 2> [service]`")
        .addField("Services (optional)", "discord (default), twitter, hiven")
        .addField("Links", "*<:pepega:739989836592709684> [How do I find the message ID?](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)*\n[Invite Bot](https://discord.com/oauth2/authorize?client_id=834658971896774686&scope=bot&permissions=363520) - [Website](https://snow.place) - [GitHub](https://github.com/smuke/)\n")
        .setFooter("Try Snow.place in your browser!", "https://cdn.glitch.com/0967da06-2ba6-4b43-b2a6-d4912fa3e754%2Ffavicon.png");

    channel.send({ embeds: [embed] });
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

// Get results

function getResults(id1, id2, message, epoch, service) {
    // First ID
    const timeLocal1 = makePretty(getDate(id1, epoch));
    const timeUTC1 = makePrettyUTC(getDate(id1, epoch));
    const timeUnix1 = getUnixTimestamp(getDate(id1, epoch));
    // Second ID
    const timeLocal2 = makePretty(getDate(id2, epoch));
    const timeUTC2 = makePrettyUTC(getDate(id2, epoch));
    const timeUnix2 = getUnixTimestamp(getDate(id2, epoch));
    
    // If first ID is faster
    if (getDate(id1, epoch) < getDate(id2, epoch)) {
        let diffdate = formatDiff(
            getDiff(getDate(id1, epoch), getDate(id2, epoch))
        );
        createImage({ id1, id2, timeLocal1, timeUTC1, timeUnix1, timeLocal2, timeUTC2, timeUnix2, diffdate, service }, message, 1);
    }
    // If second ID is faster
    else if (getDate(id1, epoch) > getDate(id2, epoch)) {
        let diffdate = formatDiff(
            getDiff(getDate(id1, epoch), getDate(id2, epoch))
        );
        createImage({ id1, id2, timeLocal1, timeUTC1, timeUnix1, timeLocal2, timeUTC2, timeUnix2, diffdate, service }, message, 2);
    }
    // Error
    else {
        message.channel.send("An error occured, please try again.");
    }

}

// Create image and send results

function createImage(data, message, faster) {
    const canvas = createCanvas(700, 850)
    const ctx = canvas.getContext("2d")
    
    // Background
    ctx.fillStyle = "#0e1011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Heading
    ctx.fillStyle = "#5C6773";
    ctx.font = "20px Poppins Regular";
    ctx.fillText(`${data.service} Timestamp Comparison`, 285, 62); // Unix

    // IDs
    ctx.fillStyle = "white";
    ctx.fillText(data.id1, 75, 150); // 1
    ctx.fillText(data.id2, 75, 520); // 2

    // Winner
    ctx.fillStyle = "#f3b948";
    ctx.textAlign = "right";
    switch (faster) {
        case 1:
            ctx.fillText("-" + data.diffdate, 625, 150); // 1
            break;
        case 2:
            ctx.fillText("-" + data.diffdate, 625, 520); // 2
            break;
        default:
            message.channel.send("Error occured, please try again.");
    }

    // Line 1
    ctx.strokeStyle = "#1F2328";
    ctx.beginPath();
    ctx.moveTo(75, 170);
    ctx.lineTo(625, 170);
    ctx.stroke();

    // Line 2
    ctx.strokeStyle = "#1F2328";
    ctx.beginPath();
    ctx.moveTo(75, 540);
    ctx.lineTo(625, 540);
    ctx.stroke();

    // Time titles 1
    ctx.fillStyle = "#5C6773";
    ctx.textAlign = "start";
    ctx.fillText("EASTERN STANDARD TIME", 75, 210); // LOCAL TIME
    ctx.fillText("COORDINATED UNIVERSAL TIME", 75, 300); // UTC
    ctx.fillText("UNIX TIME", 75, 390); // Unix

    // Time titles 2
    ctx.fillStyle = "#5C6773";
    ctx.fillText("EASTERN STANDARD TIME", 75, 580); // LOCAL TIME
    ctx.fillText("COORDINATED UNIVERSAL TIME", 75, 670); // UTC
    ctx.fillText("UNIX TIME", 75, 760); // Unix

    // Times 1
    ctx.fillStyle = "#48DFF3";
    ctx.font = "500 25px Poppins Medium";
    ctx.fillText(data.timeLocal1, 75, 250); // LOCAL TIME
    ctx.fillText(data.timeUTC1, 75, 340); // UTC
    ctx.fillText(data.timeUnix1, 75, 430); // Unix

    // Times 2
    ctx.fillStyle = "#48DFF3";
    ctx.font = "25px Poppins Medium";
    ctx.fillText(data.timeLocal2, 75, 620); // LOCAL TIME
    ctx.fillText(data.timeUTC2, 75, 710); // UTC
    ctx.fillText(data.timeUnix2, 75, 800); // Unix

    // Logo
    loadImage("./snowplace_logo.png")
        .then((image) => {
            ctx.drawImage(image, 75, 40, 185, 30);

            const attachment = new MessageAttachment(canvas.toBuffer(), "snowplace.png");
            // Send message
            message.channel.send({ files: [attachment], reply: { messageReference: message.id }});
        })
        .catch((err) => {
            console.log(`Error loading image! ${err}`);
        });
}

// Calculate data

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

            hour12: true,
            timeZone: "America/New_York"
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