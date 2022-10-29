require("dotenv").config()
var XMLHttpRequest = require('xhr2');
var telegrambot = require("./telegramMessanger").Bot

// PUBLIC VARIABLES 
let bot;
let delay = 30
let nekoAddress= "http://localhost:8080"
let nekoPassword = "neko"
let telegramToken = "";
let telegramChatId = "";
let lastState = 0;

// You want some cool looking messages? Then you need it :)
const EMOTES = {
    good : "🟢",
    bad : "🔴",
    more: "⏫",
    less: "⏬"
}

// Default function to run the routine every X seconds 
function main()
{
    checkServer();
    setTimeout(() => {
        checkServer();
        main();
    }, delay *1000); // Every XDelay seconds
}

// Send a request to your neko browser end get stats like connections or members
function checkServer() {
    fetch(nekoAddress+"/stats?pwd="+nekoPassword).then((response) => {
        return response.json();
    }).then((data) => {

        if(data.connections == lastState)
        {
            return;
        }
        let tmpState = lastState
        lastState = data.connections;

        let ar = [];
        for (let i = 0; i < data.members.length; i++) {
            const member = data.members[i];
            ar.push(member.displayname)
        }
        // send notification to telegram with the names
        sendingNotification(ar, tmpState);
    })
}

// Everytime something changed we hit the Notifications
// not cool because the function dont do what the function names says.
// This function checks if is more or less members or everybody leaved or if someone started it first

function sendingNotification(ar,lastState) {
    let emote = ""
    let content = ""

        //someone connected or disconnected
        if(ar.length == 0)
        {
            // Everybody leaved the channel
            emote = EMOTES.good;
            content = "Everybody leaved the session.";
        }else{
            // Send messages with all users in it
            if(ar.length == 1 && lastState == 0)
            {
                emote = EMOTES.bad;
                content = ar[0] +" started the session."
            }else if(lastState > ar.length)
            {
                emote = EMOTES.less;
                content = "Someone leaved the session."
            }else{
                emote = EMOTES.more;
                content = "Someone joined the session."
                
            }
            if(ar.length != 1)
            {
                content = content + "%0AHere is a list of connected users"
                for (let i = 0; i < ar.length; i++) {
                    const username = ar[i];
                    content = content + "%0A<b><i>" + username + "</i></b>";
                }
            }
         
        }
 
    let msg = "[Virtual Browser] ["+emote+"]: " + content + ""
    console.log(msg)

    // Send the message to telegram only if the first user joined the session or the last user leaved the session
    if(emote == EMOTES.bad || emote == EMOTES.good)
    {
        bot.sendMessage(msg);
    }else{
        bot.sendMessage(msg,null,null,true);
    }
    
}

// check if all .env variables are set
if(!process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_CHATID || !process.env.NEKO_ADDRESS || !process.env.NEKO_PASSWORD || !process.env.DELAY)
{
    console.log("Please set all .env variables!")
    //find variables which are not set
    if(!process.env.TELEGRAM_TOKEN)
    {
        console.log("TELEGRAM_TOKEN is not set!")
    }
    if(!process.env.TELEGRAM_CHATID)
    {
        console.log("TELEGRAM_CHATID is not set!")
    }
    if(!process.env.NEKO_ADDRESS)
    {
        console.log("NEKO_ADDRESS is not set!")
    }
    if(!process.env.NEKO_PASSWORD)
    {
        console.log("NEKO_PASSWORD is not set!")
    }
    if(!process.env.DELAY)
    {
        console.log("DELAY is not set!")
    }

    return;    
}else{
    // set variables
    
    nekoAddress = process.env.NEKO_ADDRESS
    nekoPassword = process.env.NEKO_PASSWORD
    delay = process.env.DELAY
    telegramToken = process.env.TELEGRAM_TOKEN
    telegramChatId = process.env.TELEGRAM_CHATID
    bot = new telegrambot(telegramToken,telegramChatId) // create telegram bot instance
    main();
}

