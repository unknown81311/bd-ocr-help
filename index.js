const Tesseract = require('tesseract.js');
const {
    Client,
    Intents
} = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const messagesRegexes = {
    "crash": /BetterDiscord seems to have crashed your Discord client/g,
    "assets": /Cannot read property (|.)assets(|.) of undefined/g,
    "awkward": /well. this is awkward/g,//|you died
    "PFL": /Try removing all your plugins then restarting Discord/g,
    "links": /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g
};

function getTextFromImage(url) {
    return Tesseract.recognize(url)
        .then(({
            data: {
                text
            }
        }) => {
            console.log(text)
            return text.toLowerCase();
        })
}

function checkUrl(u) {
    let r = true
    try {
        let x = new URL(u);
    } catch (e) {
        r = false
    }
    return r;
}
async function getReply(message, regex) {
    const fixes = {
        assets: `<@${message.author.id}> If you are running into an Cannot read property 'assets' of undefined error while trying to install BetterDiscord you are using an outdated version of the installer. Please download the current version from https://betterdiscord.app/`,
        crash: `<@${message.author.id}> Go to your plugins folder (look below) and replace ZeresPluginLibrary (file name is 0PluginLibrary) -> https://betterdiscord.app/Download?id=9\nIf that does not work, replace BDFDB (file name is 0BDFDB) -> https://betterdiscord.app/Download?id=59`,
        PFL: `<@${message.author.id}> Windows: Press win + r and paste in %appdata%/betterdiscord/plugins\nMac: Go to finder, press cmd + shift + G and paste in ~/Library/Application Support/betterdiscord/plugins\nLinux: Go to your command line and type cd ~/.config/BetterDiscord/plugins`,
        awkward: `<@${message.author.id}> There are a number of plugins that are crashing Discord. Please :check_the_pins: READ THE PINS :check_the_pins: for more information.`
    };
    // if (messagesRegexes[regex].test(message.content)) {
    //     return fixes[regex];
    // }
    if (!message.attachments) return;

    if (message.attachments.first()) {
        const ImageText = await getTextFromImage(message.attachments.first().attachment);
        if (messagesRegexes[regex].test(ImageText)) {
            return fixes[regex];
        }
    } else {
        const isLinks = messagesRegexes.links.test(message.content);
        if (!isLinks) return;
        const links = message.content.match(messagesRegexes.links);
        let sent = false;
        for (let i = 0; i < links.length || (!sent); i++) {
            if (checkUrl(message.content)) {
                sent = true;
                const ImageText = await getTextFromImage(links[i]);
                if (messagesRegexes[regex].test(ImageText)) {
                    return fixes[regex];
                }
            }
        }
    }
}

client.on('messageCreate', async message => {
    try {
        if (message.author.bot) return;
        if (message.channel.name != 'bot-testing') return;
        const msg = message;
        const reply = await getReply(msg, 'crash') || await getReply(msg, 'assets') || await getReply(msg, 'awkward') || await getReply(msg, 'PFL');
        if (reply) message.reply(reply);
    } catch (err) {
        console.error(err);
    }
});

client.login('BOT-TOKEN');
