//simple hardcoded checker if someone is in a neko browser

var XMLHttpRequest = require('xhr2');
var telegrambot = require("./telegramMessanger").Bot
const bot = new telegrambot("YOUR-BOT-TOKEN-HERE", "YOUR-DEFAULT-CLIENT-ID")
let delay = 30
// if you are using neko-rooms just but in here your domain/roomid 
let address= "http://browser.kempfimperium.de/dk"
// if you are using default neko its maybe cool to put your port in here or just put it in address like ":8080"
let port = ""
//Here you need to pass your room admin password
let password = "testtester123"
//Yea, saving the last state to not spam Telegram only if something changed.
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
    fetch(address+port+"/stats?pwd="+password).then((response) => {
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
                content = content + "\nHere is a list of connected users"
                for (let i = 0; i < ar.length; i++) {
                    const username = ar[i];
                    content = content + "\n" + username;
                }
            }
         
        }
 
    let msg = "[Virtual Browser] ["+emote+"]: " + content + ""
    console.log(msg)
    bot.sendMessage(msg);
}

main();