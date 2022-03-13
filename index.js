const Tesseract = require('tesseract.js');

const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const messagesRegexes={"assets":/Cannot read property (|.)assets(|.) of undefined/g,"links":/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g};

function getTextFromImage(url) {
  return Tesseract.recognize(url)
    .then(({ data: { text } }) => {
        return text;
    })
}

function checkUrl(u){
  let r=true
  try{
    let x = new URL(u);
  }catch(e){
    r=false
  }
  return r;
}

client.on('messageCreate', async message => {
  try{
    if (message.author.bot) return;
    if(message.channel.name!='bot-testing') return;
    const messageReply = `<@${message.author.id}> If you are running into an Cannot read property 'assets' of undefined error while trying to install BetterDiscord you are using an outdated version of the installer. Please download the current version from https://betterdiscord.app/`
    if(messagesRegexes.assets.test(message.content)){
      message.reply(messageReply)
      return
    }
    if (message.attachments.first()){
      const ImageText = await getTextFromImage(message.attachments.first().attachment);
      if(messagesRegexes.assets.test(ImageText)){
        message.reply(messageReply)
      }
    }else{
      const isLinks=messagesRegexes.links.test(message.content)
      if(!isLinks)return;
      const links=message.content.match(messagesRegexes.links)
      console.log(links);
      let sent=false;
      for(let i=0;i<links.length||(!sent);i++){
        if(checkUrl(message.content)){
          sent=true;
          const ImageText = await getTextFromImage(links[i]);
          if(messagesRegexes.assets.test(ImageText)){
            message.reply(messageReply)
            return;
          }
        }
      }
    }
  }catch(err){
    console.error(err);
  }
});

client.login('BOT-TOKEN');
