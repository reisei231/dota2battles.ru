var cluster = require('cluster');
var steam = require("steam"),
    util = require("util"),
    fs = require("fs"),
    crypto = require("crypto"),
    dota2 = require("./index.js"),
    steamClient = new steam.SteamClient(),
    steamUser = new steam.SteamUser(steamClient),
    steamFriends = new steam.SteamFriends(steamClient),
    Dota2 = new dota2.Dota2Client(steamClient, true),
    stageBot = "wait";
console.log(process.argv);
// Load config
var id = process.argv[2];
    var logOnDetails = {
        "account_name": process.argv[3] + id,
        "password": process.argv[4],
    };
    /* Process logic */
    

    /* Steam logic */
    var onSteamLogOn = function onSteamLogOn(logonResp) {
        util.log(logonResp);
        process.on('message', function(packet) {
        console.log('GET MESSAGE: ', packet);
        switch(packet.data.cmd){
            case 'getBotInfo':
                process.send({
                    type: 'process:msg',
                    data: {
                    success: true,
                    steamid : logonResp['client_supplied_steamid'],
                    stage : stageBot
                    },
                    topic: 'from bot to server'
          });

        }
        
        });
    }
    onSteamServers = function onSteamServers(servers) {
        util.log("Received servers.");
        fs.writeFile('servers', JSON.stringify(servers), (err) => {
            if (err) { if (this.debug) util.log("Error writing "); }
            else { if (this.debug) util.log(""); }
        });
    },
    onSteamLogOff = function onSteamLogOff(eresult) {
        util.log("Logged off from Steam.");
    },
    onSteamError = function onSteamError(error) {
        util.log("Connection closed by server: " + error);
    };

    steamUser.on('updateMachineAuth', function (sentry, callback) {
        var hashedSentry = crypto.createHash('sha1').update(sentry.bytes).digest();
        fs.writeFileSync('sentry', hashedSentry)
        util.log("sentryfile saved");
        callback({
            sha_file: hashedSentry
        });
    });


    // Login, only passing authCode if it exists
    
    try {
        var sentry = fs.readFileSync('sentry');
        if (sentry.length) logOnDetails.sha_sentryfile = sentry;
    } catch (beef) {
        //util.log("Cannae load the sentry. " + beef);
    }

    steamClient.connect();

    steamClient.on('connected', function () {
        steamUser.logOn(logOnDetails);
    });
    steamClient.on('logOnResponse', onSteamLogOn);
    steamClient.on('loggedOff', onSteamLogOff);
    steamClient.on('error', onSteamError);
    steamClient.on('servers', onSteamServers);
