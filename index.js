const Tesseract = require("tesseract.js");
const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function getTextFromImage(url) {
  //using Tesseract to find text in images
  return Tesseract.recognize(url).then(({ data: { text } }) => {
    return text.toLowerCase();
  });
}

function checkUrl(u) {
  let r = true;
  try {
    let x = new URL(u);
  } catch (e) {
    r = false;
  }
  return r;
}

const messagesRegexes = {//regexs for error messages
  crash: /betterdiscord seems to have crashed your discord client/g,
  assets: /cannot read property (|.)assets(|.) of undefined/g,
  awkward: /well. this is awkward|error level 9000/g, //|you died
  PFL: /Try removing all your plugins then restarting discord/g,
};

const fixes = {//messages for replying to errors
  assets: `If you are running into an Cannot read property 'assets' of undefined error while trying to install BetterDiscord you are using an outdated version of the installer. Please download the current version from https://betterdiscord.app/`,
  crash: `Go to your plugins folder (look below) and replace ZeresPluginLibrary (file name is 0PluginLibrary) -> https://betterdiscord.app/Download?id=9\nIf that does not work, replace BDFDB (file name is 0BDFDB) -> https://betterdiscord.app/Download?id=59`,
  PFL: `Windows: Press win + r and paste in %appdata%/betterdiscord/plugins\nMac: Go to finder, press cmd + shift + G and paste in ~/Library/Application Support/betterdiscord/plugins\nLinux: Go to your command line and type cd ~/.config/BetterDiscord/plugins`,
  awkward: `There are a number of plugins that are crashing Discord. Please :check_the_pins: READ THE PINS :check_the_pins: for more information.`,
};
const linkReg =
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;


async function getReply(message, regex) {
  // find what type of error the message is
  
  if (!message.attachments) return;

  if (message.attachments.first()) {//if error is an attachment
    const ImageText = await getTextFromImage(
      message.attachments.first().attachment
    );

    for (let reg = 0; reg < Object.keys(messagesRegexes).length; reg++) {
      //loop over all erorr regex and test the text provided by getTextFromImage
      
      if (
        messagesRegexes[Object.keys(messagesRegexes)[reg]].test(
          ImageText.toLowerCase()
        )
      ) {
        return `<@${message.author.id}>` + fixes[Object.keys(messagesRegexes)[reg]];
      }
    }
  } else {
    const isLinks = linkReg.test(message.content);
    if (!isLinks) return;
    const links = message.content.match(linkReg);
    let sent = false;

    for (let i = 0; i < links.length || !sent; i++) {
      // loop over all urls untill an error is found
      
      if (checkUrl(message.content)) {//check if url is real
        sent = true;
        const ImageText = await getTextFromImage(links[i]);

        for (let reg = 0; reg < Object.keys(messagesRegexes).length; reg++) {
          //loop over all erorr regex and test the text provided by getTextFromImage
          if (
            messagesRegexes[Object.keys(messagesRegexes)[reg]].test(
              ImageText.toLowerCase()
            )
          ) {
            return `<@${message.author.id}>` + fixes[Object.keys(messagesRegexes)[reg]];// return the fix message and mentioning them
          }
        }
      }
    }
  }
}

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.name != "bot-testing") return;
    const msg = message;
    const reply = await getReply(msg);//test if there is an image with getReply
    if (reply) message.reply(reply);//if getReply is not undefind reply with the fix message returned
  }
  catch (err) {
    console.error(err);
  }
});

//start bot
client.login('BOT-TOKEN');
