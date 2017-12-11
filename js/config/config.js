/**
 * ExEngine: config.js
 * Version: 1.0.0
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

//TODO may have to rewrite the configuration, maybe make it more command style?
const stream = require("stream");
const fs = require("fs");
const crypto = require("crypto");

"use strict"

var configuration = fs.existsSync(__dirname + '/config/config.json') ? require('./config/config.json') : {
    adminName: ['string', 'The name of the Mongodb multiplayer admin:'],
    adminPwd: ['string', 'The pass of the Mongodb multiplayer admin:'],
    projectPath: ['string', 'The path to your project folder:'],
    sslPath: ['string', 'The path of the SSL certificates:'],
    method: ['aes256', 'The method of encryption. Ex: aes256, sha256, etc'],
    lock: ['number', 'Number of characters used for the encryption password'],
    modules: [[], 'The modules to be used by ExEngine. Use add or remove commands to change the list.\n' +
        'list:\n'],
    optionalLock: ['number', 'The number of bytes to be applied to scabble\'s encrytion\n this is randomly generated']
};

var readStream = process.stdin;
readStream.setEncoding("utf8");

var i = 0;
var keys = Object.keys(configuration);
keys.push('add', 'remove', 'value', 'done');

function adminName(c) {
    configuration['adminName'][0] = c.length > 1 ? c[1] : configuration['adminName'][0];
};

function adminPwd(c) {
    configuration['adminPwd'][0] = c.length > 1 ? c[1] : configuration['adminPwd'][0];
};

function pPath(c) {
    configuration['projectPath'][0] = c.length > 1 ? c[1] : configuration['projectPath'][0];
};

function sslPath(c) {
    configuration['sslPath'][0] = c.length > 1 ? c[1] : configuration['sslPath'][0];
};

function eMethod(c) {
    configuration['method'][0] = c.length > 1 ? c[1] : configuration['method'][0];
};

function eLock(c) {
    var bytes = parseInt(c[1], 10);
    if (bytes > 256 || bytes < 16) throw 'Error number of bytes must be 16 to 256';
    crypto.randomBytes(bytes, function (err, buf) {
        if (err) throw err;
        configuration['lock'][0] = buf.toString();
        console.log(configuration['lock'][0]);
    });
};

function oLock(c) {
    var bytes = parseInt(c[1], 10);
    if (bytes > 6 || bytes < 1) throw 'Error number of bytes must be 1 to 6';
    crypto.randomBytes(bytes, function (err, buf) {
        if (err) throw err;
        configuration['optional lock'][0] = parseInt(buf.toString('hex'), 16).toString();
    });
};

function add(c) {
    for (let i = 1; i < c.length; i++) {
        if (fs.existsSync(__dirname + "/modules/" + c[i])) {
            if (configuration['modules'][0].includes(c[i]) === false) {
                console.log("Adding", c[i], "to active modules.");
                configuration['modules'][0].push(c[i]);
            } else {
                console.log(c[i], "is already an active module");
            }
        } else {
            console.log("Module:", c[i], "does not exist.");
        }
    }
};

function remove(c) {
    for (let i = 1; i < c.length; i++) {
        var index = configuration['modules'][0].indexOf(c[i]);
        if (index !== -1) {
            console.log("Removing", c[i], "from active modules.");
            configuration['modules'][0].splice(index, 1);
        } else {
            console.log("No module:", c[i])
        }
    }
};

function help(c) {
    try {
        if (c.length < 2) {
            for (let i = 0; i < keys.length; i++) {
                console.log(keys[i]);
            }
        } else if (configuration.hasOwnProperty(c[1])) {
            console.log(c[1] + ':', configuration[c[1]][1]);
        } else if (c[1] === 'add') {
            console.log(c[1] + ':', 'adds modules to the modules array\n' +
                'use the command "modules" to see which ones you can add');
        } else if (c[1] === 'remove') {
            console.log(c[1] + ':', 'removes modules from the modules array\n' +
                'use the command "added" to see which ones you can remove')
        } else if (c[1] === 'value') {
            console.log(c[1] + ':', 'Checks the value of a configuration variable');
        } else if (c[1] === 'done') {
            console.log(c[1] + ':', 'Finishes the configuration and saves the changes');
        } else {
            console.log('No such command:', c[1], 'Use the command "help" for a list of commands');
        }
    } catch (e) {
        console.error(e);
    }
};

function modules() {
    fs.readdir(__dirname + "/modules/", function (error, items) {
        items.map(function (a) { return a.replace(".js", "") });
        for (let i = 0; i < items.length; i++) {
            if (configuration['modules'][0].includes(items[i])) {
                console.log("\x1b[32m%s\x1b[0m", items[i]);
            } else {
                console.log("\x1b[31m%s\x1b[0m", items[i]);
            }
        }
    });
};

function value(c) {
    try {
        console.log("value of " + c[1] + ":", configuration[c[1]][0]);
    } catch (e) {
        console.log(e);
    }
};

function done() {
    if (fs.existsSync(__dirname + "/config") !== true) {
        fs.mkdirSync(__dirname + "/config");
    }
    fs.writeFile(__dirname + "/config/config.json", JSON.stringify(configuration), 'utf8', function (error) {
        if (error) {
            console.log(error)
            process.exit(1)
        }
        process.exit(0);
    });
}


readStream.on('data', function (chunk) {
    chunk = chunk.replace(/\n/, "");
    c = chunk.split(' ');
    switch (chunk) {
        case (chunk.match(/^adminName(?= )/i) || {}).input:
            adminName(c);
            break;
        case (chunk.match(/^adminPwd(?= )/i) || {}).input:
            adminPwd(c);
            break;
        case (chunk.match(/^projectPath(?= )/i) || {}).input:
            pPath(c);
            break;
        case (chunk.match(/^sslPath(?= )/i) || {}).input:
            sslPath(c);
            break;
        case (chunk.match(/^method(?= )/i) || {}).input:
            eMethod(c);
            break;
        case (chunk.match(/^lock(?= )/i) || {}).input:
            eLock(c);
            break;
        case (chunk.match(/^optionalLock(?= )/i) || {}).input:
            oLock(c);
            break;
        case (chunk.match(/^add(?= )/i) || {}).input:
            add(c);
            break;
        case (chunk.match(/^remove(?= )/i) || {}).input:
            remove(c);
            break;
        case (chunk.match(/^help/i) || {}).input:
            help(c);
            break;
        case (chunk.match(/^modules/i) || {}).input:
            modules();
            break;
        case (chunk.match(/^value(?= )/i) || {}).input:
            value(c);
            break;
        case (chunk.match(/^done/i) || {}).input:
            done();
            break;
        default:
            console.log('Use the command "help" for a list of commands');
    }
});
