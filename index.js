/**
 * ExEngine: index.js
 * Version: 2.0.0
 * Author: Sarlecc
 * Contributors:
 * License: Copyright <2017> <Mythical Games (Nathan Morris aka Sarlecc)>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Notice that all variables in index.js get set by
 * config.js so there is no need to change them here.
 */

"use strict";

var config = require('./config/config.json');
var log = require('./required/log.js');
var fs = require('fs');
var app = require('express')();

/**
 * admin object
 * user this is the name of the administrator
 * pass this is the pass of the administrator
 * 
 * this object holds the mongodb admin data and needs to get
 * set to the correct values.
 * NOTE that this may be changed/removed in the future.
 */
var admin = {
	user : config['adminName'][0],
	pass : config['adminPwd'][0]
	};

/**
* The variable that holds the path of your
* project folder represented as a string.
*/
var projectPath = config['projectPath'][0];

/*
* path to the ssl certificates
*/
var SSLPath = config['sslPath'][0];

/**
 * Lock
 * Password for encryption
 */
var lock = config['lock'][0];

/**
 * method
 * Method of encryption aes256, sha256, scrabble, etc
 */
var method = config['method'][0];

/**
 * optionalLock
 * Used by scrabble only
 */
var optionalLock = parseInt(config['optionalLock'][0], 10);

// DO NOT CHANGE ANYTHING PAST THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING
	
/**
 *  creates a secure https server
 */
var https = require('https');
var server = https.createServer({
    key: fs.readFileSync(SSLPath+'/key.pem'), //normally privkey.pem
    cert: fs.readFileSync(SSLPath+'/cert.pem'),
    ca: fs.readFileSync(SSLPath+'/cert.pem'),//normally chain.pem
    requestCert: false,
    rejectUnauthorized: false
},app);
server.listen(443);

var io = require('socket.io').listen(server);
console.log("server is now listening");

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/**
 * the mongo database variable
 */
var mongoskin = require('mongoskin'),
    dbHost = 'localhost',
    dbPort = 27017;

var main = {io: io, admin: admin, lock: lock,
            mongo: mongoskin, dbHost: dbHost, 
            dbPort: dbPort, log: log};

//TODO if this causes a problem add new to the front of the call
log.logMsg('Initializing players');
var users = require('./required/players')(main).getUsers();

log.logMsg("Adding modules");
var modules = {};
for (let i = 0; i < config.modules[0].length; i++) {
    modules[i] = require('./modules/'+config.modules[0][i]);//(main, users);
};

log.logMsg('Starting modules');
//TODO ensure the following works
for (let i in modules) {
    modules[i] = modules[i](main, users, modules);
};

log.logMsg("Server Ready");

/**
 * This function sends files to the client at the clients request.
 * It will not load any files from the utility folder. If a request asks for a file
 * from that folder a 403 access denied error will be sent instead.
 */
app.get('/*', function(req, res){
	var path = __dirname + '/' + req.params[0];
	if (path.match(/utility/g) || path.match(/.ssl/g)){
        log.logMsg('Warning: denied access to: ' + path);
        res.sendStatus(403);
    } else {
   	    res.sendFile(path);
    }
});

/**
 * This function loads scripts from the utility folder
 * it requires the client to be an admin otherwise it will send a 403
 * access denied error
 */
app.post('/js/utility/*', function(req, res) {
    log.logMsg('Logging: utility folder access');
    //TODO because players are not users of the database I am going to have to find a
    //different way to check if they can access the utility folder
    var isAdmin = {user: req.body.user, pass: req.body.pass};
    var db = mongoskin.db('mongodb://' + admin.user + ':' + admin.pass + '@' + dbHost + ':' +
		           dbPort + '/multiplayer');
    //TODO I need to find a way to limit admin access to only admins
    db.authenticate(admin.user, admin.pass, function(error, item) {
        if (error) {
  	    io.emit('Error', error);
  	    log.logMsg(error);
	    db.close
  	    process.exit(1);
        }
  	if (item === true) {
  	    var path = __dirname + '/js/utility/' + req.params[0];
  	    res.sendFile(path);
        } else {
            log.logMsg('Warning: attempt to access utility folder resource was denied');
  	        res.status(403).send('access to this resource has been denied');
    }
    db.close();
    });
});


 