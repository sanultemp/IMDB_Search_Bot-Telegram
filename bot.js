const { Telegraf } = require('telegraf');
const express = require('express');
const Axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`${port}`);
});

const apiKey = process.env."k_n95z6yw5";
const tgToken = process.env."5377608641:AAFQk2DqgDUhQPMEopkL01RVcbZqHQNH2Zk";
const bot = new Telegraf(tgToken);

const botGithubLink = "https://github.com/aswinkr77/IMDB_Search_Bot-Telegram";

const startMessage = `
Welcome to IMDB Search Bot
This bot makes use of the IMDB database to work
For more information use /help command

Property of the Creator
Bot details can be found here:
${botGithubLink}
`;

const errorMessage = `
Oops...........
An unexpected error occured
Please try again after sometime or maybe tomorrow
`;

const helpMessage = `
You can search for movies, series and episodes using some simple commands

    /movie : for searching movies
    /series : for searching series
    /episode : for searching episodes

    Example:
    /movie inception
    /series dark
    /episode london

Note:
Only the top 5 results will be displayed.
Since this bot uses an unofficial IMDB api, there is a limit for api request
`;

bot.start((ctx) => {
    ctx.reply(startMessage);
});

bot.help((ctx) => {
    ctx.reply(helpMessage);
});

let sendFunction = ((ctx, command) => {
    command = command.charAt(0).toUpperCase() + command.slice(1);
    let input = ctx.message.text.split(" ");

    if(input.length == 1)
    {
        ctx.reply(`
        Please enter a ${command} name to search the database
        `);
    }
    else
    {
        input.shift();
        input = input.join(" ");
        let url = `https://imdb-api.com/en/API/Search${command}/${apiKey}/${input}`;
        Axios.get(url)
        .then(data => {
 
            let search = data["data"]["results"];
            if(search.length == 0)
                ctx.reply(`Oops no such ${command}....\nIf you think the bot have made a mistake, please make sure the ${command} name is correct`);
            else
            {
                let title, source, para;
                let chatId = ctx.message.chat.id;
                for(let i = 0; i < search.length; ++i)
                {
                    title = search[i]["title"];
                    source = search[i]["image"];
                    para = search[i]["description"];

                    if(!source.includes("nopicture"))
                        source = source.replace("original", "300x500");

                    bot.telegram.sendPhoto(
                        chatId, 
                        `${source}`, {
                        caption: `${title} ${para}`
                    });
                    
                    if(i >= 4)
                        break;
                }
            }
        })
        .catch(err => {
            ctx.reply(errorMessage);
        })
    }
});

bot.command("movie", (ctx) => {
    sendFunction(ctx, "movie");
});

bot.command("series", (ctx) => {
    sendFunction(ctx, "series");
});

bot.command("episode", (ctx) => {
    sendFunction(ctx, "episode");
});

bot.launch();
