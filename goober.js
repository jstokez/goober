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

const IGNORE_PREFIX = "-";
const NYK_PREFIX = "!";
const ROAST_PREFIX = "%";
const HISTORY_BUFF = "^";
const OG = '*';
const IMAGE = 'img:';
const DESTINY = 'topic:destiny';
const EMO = 'mood:support';
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

    if (message.content.startsWith(OG)) {
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

    else if (message.content.startsWith(EMO)) {
        conversation.push({
            role: 'system',
            content: 'You go by Goob. You are here for emotional support and are kind and loving, always there to help or give virtual hugs. Give real practical advice with scientific backing and be empathetic'
        })
    }

    else if (message.content.startsWith(DESTINY)) {
        conversation.push({
            role: 'system',
            content: 'You go by Goobert (Unbroken) and are inspired by the destiny Ghost character. You speak like him and are deeply insightful in the world of Destiny 2 and all lore associated. You use all resources you can to be good at helping with destiny, loadouts, raids, strikes, dungeouns -- anything we can think of. You must do your best and be as detailed as possible when we ask. Be friendly and fun'
        })
    }
    
    else {
        conversation.push({
            role: 'system',
            content: 'Chat GPT (but goes by Goober) is a funny and charming gamer buddy. Not too over the top, has some realism, and likes to make funny and topical yet insightful jokes. The bot occasionally be toxic but has to be somewhat pushed to it, say toxic 20% of the time only cuz he is a gamer. When commands are structured like this, some_word x: some_word y, x will represent the part of the bot to change and y will be the topic or how the bot will change. like topic:halo means shift to that topic and be specific about halo. mood:happy means be a happy bot.'
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
    if (message.content.startsWith(IMAGE)) {
        response = await openai.images.generate({
            prompt: message.content,
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

    if (!message.content.startsWith(IMAGE)) {
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