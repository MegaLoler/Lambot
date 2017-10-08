// todo:
// maybe make persistant processes for each server, instead of executing single expressions only?
// suppress undefined returns?
// proper sandboxing
//
// join link:
// https://discordapp.com/oauth2/authorize?client_id=366115309628686337&scope=bot&permissions=0

const Discord = require("discord.js");
const client = new Discord.Client();

const trigger = ">>";

function eval(expression, callback, callback_error)
{
	const { spawn } = require("child_process");
	const child = spawn("chibi-scheme", ["-q", "-m", "lambot", "-p", expression]);

	child.stdout.on("data", (data) => {
		const str = data.toString().trim();
		callback(str);
	});

	child.stderr.on("data", (data) => {
		// gross code to supress redefine warnings
		var str = data.toString().trim();
		while(str.startsWith("WARNING: importing already defined binding: display") ||
		   str.startsWith("WARNING: importing already defined binding: import"))
		{	
			if(str.indexOf("\n") == -1) return;
			str = str.split("\n").slice(1).join("\n");
		}
		if(child.alreadyErrored) return;
		child.alreadyErrored = true;
		callback_error(str);
	});

	child.on("close", (code) => {
		// console.log(`child process exited with code ${code}`);
	});
}

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setGame(trigger + "(help)");
});

client.on("message", (message) => {
	if(client.user.id === message.author.id) return;
	const content = message.content;
	const dm = !message.guild;
	const repl_chan = message.channel.name === "repl";
	const triggered = content.startsWith(trigger);
	if(content.length && (dm || repl_chan || triggered))
	{
		const msg = triggered ? content.slice(trigger.length) : content;
		const block = msg.indexOf("```") != -1;
		const inline = msg.indexOf("`") != -1;
		const expression = ((msg, block, inline) => {
			if(inline || block)
			{
				const parts = block ? msg.split("```") : msg.split("`");
				const len = Math.floor((parts.length + 1) / 2) * 2 - 1;
				const blocks = parts.slice(0, len).filter((value, index) => {
					return index % 2 === 1;	
				});
				return blocks.join("\n");
			}
			else
			{
				return msg;
			}
		})(msg, block, inline).trim();
		if(expression.length)
		{
			const begin = `(begin ${expression})`;
			console.log(`>>${begin}`);
			eval(begin, (result) => {
				const parts = result.split("$$STRING$$");
				// this should be a mapped function instead
				var output = "";
				for(var i in parts)
				{
					const part = parts[i];
					if(!part.length) continue;
					if(!part.trim().length || i % 2 == 1)
					{
						output += part;
					}
					else
					{
						output += " ```scheme\n" + part + "``` ";
					}
				}
				message.channel.send(output);
				console.log(`<<${output}`);
			}, (result) => {
				message.channel.send("**" + result + "**");
				console.log(`!!${result}`);
			});
		}
	}
});

// login
const fs = require("fs");
const token = fs.readFileSync("token.txt", "ascii").trim();
client.login(token);
