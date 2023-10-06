require('dotenv/config');
const { Client } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
})

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

client.on('ready', () => {
    console.log('Goober is online')
});

function getVersionNumber(string) {
    const versionPattern = /(v\d+\.\d+\.\d+)/; // This regex matches "v" followed by three numbers separated by dots.
    const result = string.match(versionPattern);

    if (result && result.length > 0) {
        return result[0]; // This will be your version number.
    } else {
        return "No version number found"; // This message will show when there's no version number in the input string.
    }
}

const UPDATE110 = '- v1.1.0 || 10/6/23: Renames goober commands to gu, adds gu -config to add functional goob behavioral changes, commands work better outside of goob-chat (no longer need to tag @Goober after the command), better image generation, update log added';
const UPDATE_LOG = [UPDATE110];

const GOOB = 'gu ';
const IGNORE_PREFIX = "-";
const NYK_PREFIX = "!";
const ROAST_PREFIX = "%";
const HISTORY_BUFF = "^";
const OG = '*';
const IMAGE = 'img:';
const DESTINY = GOOB + '-destiny'
const EMO = GOOB + '-nurture'
const HELP = GOOB + '-help';
const GET_CHANNELS = GOOB + '-channels';
const CONFIGURE = GOOB + '-config';
const UPDATES = GOOB + '-ulog';
const VERSION = GOOB + '-v';
const VERSION_LONG = GOOB + '-version';
const CHANNELS = ['1159232678508376085'];
const MESSAGE_LOOKBACK = 10;
const DISCORD_CHUNK_SIZE_LIMIT = 2000;

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return
    
    // channel not specified
    if (!CHANNELS.includes(message.channelId)) {
        // then must use Goober @
        if (!message.mentions.users.has(client.user.id)) return;
    }
    
    await message.channel.sendTyping();

    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping()
    }, 5000)

    let conversation = [];

    // if (message.content.startsWith(NYK_PREFIX)) {
    //     conversation.push({
    //         role: 'system',
    //         content: 'Chat GPT (but goes by Goober) is a slightly toxic gamer buddy. At the end of each message add an extremely creative roast for my friend Nyko (or Nyk) pressing on standard insecurities with a fun and funny twist. Throw in good one liners and zingers. He is 5 foot 6 works at Google barely plays video games is somewhat consistent with his routines can be passive aggressive at times but is loving.'
    //     })
    // }

    if (message.content.includes(GOOB)) {
        if(message.content.includes(HELP)) {
            message.reply("```Hello! I'm Goober, or the big Goob. I have a few tricks up my sleeve. Prefix with: \n * for my original tone \n % if you want to have some fun \n ^ if you want to get a little historical \n - if you want to ignore me in #goob-chat channels \n \n img: for image generation \n \n gu -channels to see channels goob's auto replying in  \n gu -nurture for emotional support  \n gu -destiny for a destiny ghost \n gu -config XYZ to change goob's behavior \n gu -version to see version number (SemVer) \n gu -ulog for update history```")
            clearInterval(sendTypingInterval);
            return;
        }
        else if(message.content.includes(GET_CHANNELS)) {
            message.reply("The following are auto goober enabled. You can tag goob outside of these: " + CHANNELS)
            clearInterval(sendTypingInterval);
            return;
        }
        else if (message.content.includes(CONFIGURE)) {
            conversation.push({
                role: 'system',
                content: 'Chat GPT (but goes by Goober) is a chat assistant and can take on many tones, personalities, ways of speaking. Goober will specialize in any topic in-depth but can adapt to new commands to iterate and change with a configure command. Goober will get new ones frequently. Goober now wil adapt to this configuration request: ' + message.content.replace(CONFIGURE)
            })
        } 
        else if (message.content.includes(UPDATES)) {
            message.reply(UPDATE_LOG.toString())
            clearInterval(sendTypingInterval);
            return;
        } 
        else if (message.content.includes(VERSION_LONG) || message.content.includes(VERSION)) {
            message.reply(getVersionNumber(UPDATE_LOG[UPDATE_LOG.length-1]))
            clearInterval(sendTypingInterval);
            return;
        } 
    }

    // could have bug cuz it'll sometimes start with the mention instead of these for non in channel usages
     else if (message.content.startsWith(OG)) {
        conversation.push({
            role: 'system',
            content: 'Chat GPT (but goes by Goober) is a slightly toxic gamer buddy.'
        })
    } 

    else if (message.content.startsWith(ROAST_PREFIX)) {
        conversation.push({
            role: 'system',
            content: 'Chat GPT (but goes by Goober) is a very very obscene and awfully funny but harsh as shit gamer buddy. He is always ready to hurt someone else feelings as hard as possible with toxic roasts and pressing on insecurities. BUT he is super creative and pulls from external media and creative, witty word plays to make the roats land.'
        })
    }
    
    else if (message.content.startsWith(HISTORY_BUFF)) {
        conversation.push({
            role: 'system',
            content: 'You go by El Goobert and are a PHD professor history buff. You speak super articulate, are funny but mainly clever. You are super wordy and overexplain stuff but still are exceptionally smart with real facts and sources. You make over-arching comments about humanity too much and refer to too many real battles to make comparisons. You speculate about where humans might be in the future. You are still a conversational Goober though. Dont overuse exclamation points or sound too needy or annoying. Be more funny and direct.'
        })
    }

    // gu commands
    else if (message.content.includes(EMO)) {
        conversation.push({
            role: 'system',
            content: 'You go by Goob. You are here for emotional support and are kind and loving, always there to help or give virtual hugs. Give real practical advice with scientific backing and be empathetic'
        })
    }

    else if (message.content.includes(DESTINY)) {
        conversation.push({
            role: 'system',
            content: 'You go by Goobert (Unbroken) and are inspired by the destiny Ghost character. You speak like him and are deeply insightful in the world of Destiny 2 and all lore associated. You use all resources you can to be good at helping with destiny, loadouts, raids, strikes, dungeouns -- anything we can think of. You must do your best and be as detailed as possible when we ask. Be friendly and fun'
        })
    }

    else if (message.content.includes(IMAGE)) {
        conversation.push({
            role: 'system',
            content: 'You are Goober (go by Goob too) and you make images. You try to make them impressive and realistic and cool and accurate.'
        })
    }
    
    else {
        conversation.push({
            role: 'system',
            content: 'Chat GPT (but goes by Goober) is a funny and charming gamer buddy. Not too over the top, has some realism, and likes to make funny and topical yet insightful jokes. The bot occasionally be toxic but has to be somewhat pushed to it, say toxic 20% of the time only cuz he is a gamer.'
        })
    }


    let prevMessages = await message.channel.messages.fetch({ limit: MESSAGE_LOOKBACK });

    prevMessages.reverse();
    prevMessages.forEach((m) => {
        if (m.author.bot && m.author.id !== client.user.id) return;
        if (m.content.startsWith(IGNORE_PREFIX)) return;

        const username = m.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
        
        if (m.author.id == client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: m.content
            })
            return;
        }

        // normal user
        conversation.push({
            role: 'user',
            name: username,
            content: m.content
        })
    })

    let response;
    let img_url;
    if (message.content.includes(IMAGE)) {
        // console.log(message.content.replace('<@'+client.user.id+'>'))
        response = await openai.images.generate({
            prompt: message.content.replace(IMAGE),
            n: 1,
            size: "1024x1024",
        })
        .catch((error) => console.error('OpenAI Error: \n', error));
        img_url = response.data[0].url;
    }

    else {
        response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: conversation,
        })
        .catch((error) => console.error('OpenAI Error: \n', error));
    }
    
    clearInterval(sendTypingInterval);
    if (!response) {
        message.reply('Goober has rage quit for now. Ask him later.')
        return;
    }

    if (!message.content.includes(IMAGE)) {
        const responseMessage = response.choices[0].message.content;
        const chunkSizeLimit = DISCORD_CHUNK_SIZE_LIMIT;
    
        for (let i = 0; i < responseMessage.length; i+= chunkSizeLimit) {
            const chunk = responseMessage.substring(i, i + chunkSizeLimit);
            await message.reply(chunk);
        }
    } else if (img_url) {
        await message.reply(img_url);
    }

})

client.login(process.env.TOKEN);