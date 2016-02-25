var nexe = require('nexe');
var fs = require("fs");
var steam = require("steam");
var prompt = require("prompt");

prompt.start();
var loginForm = [{
    name: 'Username',
    required: true
    }, {
    name: 'Password',
    hidden: true,
    replace: '*',
  }, {
  	name: 'SteamGuard',
  	message: 'Do you have your SteamGuard code? (yes/no)'
  }];

var steamClient = new steam.SteamClient();
var steamUser = new steam.SteamUser(steamClient);
var steamFriends = new steam.SteamFriends(steamClient);

console.log("Logging on to the Steam servers. This could take a second.")
steamClient.connect();

steamClient.on('connected', function() {
	handleLogin();
});

steamClient.on('logOnResponse', function(res){

	// Handle bad logons.
	if (errHandler(res.eresult)) {
		if (res.eresult == 63) {steamClient.disconnect(); steamClient.connect();}
		return false;
	}

	if (res.eresult == steam.EResult.OK) {
	    console.log('Logged into Steam.');
	    steamFriends.setPersonaState(steam.EPersonaState.Online); 
  	}
	
});

steamClient.on('error', function(err){
});

steamFriends.on('relationships', function(){
	prompt.get([{name: "Message", message: 'Mass Message (this will go to ALL friends)', required: true}], function(err, res){
   		if (err) { console.log(err) }

   		massMessage(res.Message);
   	});
})

function massMessage(msg) {
	for (var k in steamFriends.friends){
		if (steamFriends.friends[k] == 3) {
			steamFriends.sendMessage(k, msg);
		}
	}
}

function errHandler(err) {

	var errs = {
		5: "Incorrect credentials. Try again.",
		63: "A SteamGuard code has been e-mailed to you.",
		65: "SteamGuard code incorrect. Make sure that your code is correct from the email that Valve sent you. It may have also expired, in which case you can run the program again and enter 'no' for the SteamGuard option."
	}

	if (err == steam.EResult.OK){
		return false;
	} else {
		console.log(errs[err] + " (Error " + err + ")")
		return true;
	}

}

function handleLogin() {
	prompt.get(loginForm, function(err, res) {
		if (err) { console.log(err); return 1 }
		global.credentials = res;
		if (res.SteamGuard.toLowerCase() == "no") {
			return steamUser.logOn({
				account_name: res.Username,
				password: res.Password
			});
		} else if (res.SteamGuard.toLowerCase() == "yes") {

			// Getting the SteamGuard code.
			prompt.get([{name: "sgcode", message: "SteamGuard Code", required: true}], function(err,res){
				return steamUser.logOn({
					account_name: global.credentials.Username,
					password: global.credentials.Password,
					auth_code: res.sgcode
				});
			})
		} else {
			console.log("Invalid response. Program terminating.");
			return process.exit();
		}
	});
}