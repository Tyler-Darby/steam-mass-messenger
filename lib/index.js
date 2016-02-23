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
  	message: 'SteamGuard Code \n (leave this blank to get a code e-mailed to you)'
  }];

var steamClient = new steam.SteamClient();
var steamUser = new steam.SteamUser(steamClient);
var steamFriends = new steam.SteamFriends(steamClient);

console.log("Logging on to the Steam servers. This could take a second.")
steamClient.connect();

steamClient.on('connected', function() {
	prompt.get(loginForm, function(err, res) {
		if (err) { console.log(err); return 1 }
		if (res.SteamGuard == "") {
			steamUser.logOn({
				account_name: res.Username,
				password: res.Password
			});
		} else {
			steamUser.logOn({
				account_name: res.Username,
				password: res.Password,
				auth_code: res.SteamGuard
			});
		}
	});
});

steamClient.on('logOnResponse', function(res){
	if (res.eresult == 5){
		return console.log("Incorrect credentials. Try again. (Error " + res.eresult + ")")
	} else if (res.eresult == 63 || res.eresult == 65) {
		return console.log("SteamGuard code incorrect. If you left this blank, check your e-mail and try again with the code. (Error " + res.eresult + ")")
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
	process.exit();
}