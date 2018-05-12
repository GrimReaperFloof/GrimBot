const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

let guildConf = JSON.parse('{}');

if (fs.existsSync('./guildConf.json')) guildConf = JSON.parse(fs.readFileSync('./guildConf.json', 'utf8'));

function getTextInDoubleQuotes(str) {
    let ret = '';

    if (/"/.test(str)) {
        ret = str.match(/"(.*?)"/)[1];
    } else {
        ret = str;
    }

    return ret;
}

client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (message.author === client.user) return;

    let isCommand = false;
    let prefix = config.defaultPrefix;

    if (message.channel.type !== 'dm') {
        try {
            if (guildConf[message.guild.id].prefix == undefined || guildConf[message.guild.id].prefix == null) {
                if (message.content.startsWith(config.defaultPrefix)) {
                    isCommand = true;
                }
            } else {
                if (message.content.startsWith(guildConf[message.guild.id].prefix)) {
                    isCommand = true;
                }
                prefix = guildConf[message.guild.id].prefix;
            }
        } catch(TypeError) {
            if (message.content.startsWith(config.defaultPrefix)) {
                isCommand = true;
            }
        }

        if (message.content === '<@' + client.user.id + '>' || message.content === '<@!' + client.user.id + '>') {
            message.channel.send('My default prefix is: "' + config.defaultPrefix + '"\n' + 'My prefix on this server is: "' + prefix + '"');
        }
    } else {
        if (message.content.startsWith(config.defaultPrefix)) {
            isCommand = true;
        }

        if (message.content === '<@!' + client.user.id + '>') {
            message.channel.send('My prefix is: "' + config.defaultPrefix);
        }
    }

    if (message.content.startsWith('<@!' + client.user.id + '> ')) {
        isCommand = true;
        prefix = '<@!' + client.user.id + '> ';
    }

    if (isCommand) {
        if (message.author.bot) return;
        const command = message.content.replace(prefix, '').split(' ')[0];
        // const args = message.content.split(' ').slice(1);

        if (command === 'help') {
            message.channel.send({ embed: {
                color: 16726843,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL,
                },
                title: 'Commands',
                description: 'Mention the bot to get the prefix.',
                fields: [{
                    name: 'help',
                    value: 'Syntax: <prefix>help\nDisplays this helpful command list.',
                },
                {
                    name: 'prefix',
                    value: 'Syntax: <prefix>prefix <newPrefix, supports prefixes within double quotes>\nChange the prefix for this guild.',
                },
                ],
            },
            });
        }

        if (command === 'prefix') {
            if (!message.member.hasPermission('MANAGE_GUILD')) {
                message.channel.send('You need the MANAGE_GUILD (Manage Server) permission to use this command.');
                return;
            }

            let newPrefix = message.content.replace(prefix + command, '');
            newPrefix = getTextInDoubleQuotes(newPrefix);
            newPrefix = newPrefix.replace(/^\s+/g, '');

            guildConf[message.guild.id] = {
                prefix: newPrefix,
            };

            if (guildConf[message.guild.id].prefix == '') {
                delete guildConf[message.guild.id].prefix;
                if (Object.keys(guildConf[message.guild.id]).length === 0) delete guildConf[message.guild.id];

                newPrefix = config.defaultPrefix;
            } else {
                newPrefix = guildConf[message.guild.id].prefix;
            }

            fs.writeFile('./guildConf.json', JSON.stringify(guildConf), function(err) {
                if (err) {
                    console.log(err);
                    message.channel.send('An error occured while trying to write prefix to file. Once the bot has restarted, your prefix will be reset.');
                }
            });
            message.channel.send('Prefix changed to "' + newPrefix + '"');
        }
    }
});

client.login(config.token);