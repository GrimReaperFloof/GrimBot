class Command {
    constructor(command, description, syntax) {
        this.command = command;
        this.description = description;
        this.syntax = syntax;
    }
}

const commands = {
    help: new Command(['help', 'commands'], 'Shows a list of commands and helpful information', 'help|commands'),
    prefix: new Command('prefix', 'Change the prefix for this guild', 'prefix <new prefix>')
};

function parseCommand(inputCommand) {
    for (let i = 0; i < Object.keys(commands).length; i++) {
        const command = Object.keys(commands)[i];

        if (typeof commands[command].command === 'string') {
            if (inputCommand === commands[command].command) {
                return command;
            }
        } else if (Array.isArray(commands[command].command)) {
            for (const alias of commands[command].command) {
                if (inputCommand === alias) {
                    return command;
                }
            }
        }
    }
}

module.exports = {
    Command: Command,
    commands: commands,
    parseCommand: parseCommand
};