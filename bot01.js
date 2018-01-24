var cluster = require('cluster');
var steam = require("steam"),
    util = require("util"),
    fs = require("fs"),
    crypto = require("crypto"),
    dota2 = require("../index.js"),
    steamClient = new steam.SteamClient(),
    steamUser = new steam.SteamUser(steamClient),
    steamFriends = new steam.SteamFriends(steamClient),
    Dota2 = new dota2.Dota2Client(steamClient, true);

// Load config
module.exports = function createLobby(id) {
    
    var logOnDetails = {
        "account_name": 'd2battles' + id,
        "password": 'nT3J2aT3',
    };
    if (id == 8) { logOnDetails["password"] = 'nT3J2aT38'}
    /* Steam logic */
    var onSteamLogOn = function onSteamLogOn(logonResp) {
        util.log(logonResp);
        Dota2.launch();
        
        Dota2.on("ready", function () {
            console.log("Work");
            Dota2.destroyLobby();
            if (id <= 9) { var lid = `0${id}`; }
            else { lid = id;}
            var lobbyConfig = {
                "game_name": `dota2battles.ru - ${lid} EU`,
                "server_region": dota2.ServerRegion.EUROPE,
                "game_mode": dota2.schema.lookupEnum('DOTA_GameMode').values.DOTA_GAMEMODE_CM,
                "game_version": 1,
                "allow_cheats": false,
                "fill_with_bots": false,
                "allow_spectating": false,
                "pass_key": "ap",
                "radiant_series_wins": 0,
                "dire_series_wins": 0,
                "allchat": true
            }
            Dota2.createPracticeLobby(lobbyConfig, function (err, data) {
                if (err) {
                    util.log(err + ' - ' + JSON.stringify(data));
                }
            });

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
        util.log("Cannae load the sentry. " + beef);
    }

    steamClient.connect();

    steamClient.on('connected', function () {
        steamUser.logOn(logOnDetails);
    });
    steamClient.on('logOnResponse', onSteamLogOn);
    steamClient.on('loggedOff', onSteamLogOff);
    steamClient.on('error', onSteamError);
    steamClient.on('servers', onSteamServers);
}
