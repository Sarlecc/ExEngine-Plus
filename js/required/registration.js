/**
 * ExEngine: registration.js
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
module.exports = function (main) {
    const crypto = require('crypto');
    const emailTemplates = require('email-templates');
    var encryption = require('./encryption')(main);
    var main = main;

    "use strict";

    /**
     * email-templates sender variable
     */
    const emailer = new Email({
        message: {
            from: 'noreply@email.com' //the noreply email string
        },
        // uncomment below to send emails in development/test env:
        // send: true
        transport: {
            jsonTransport: true
        }
    });

    /*
    * Non cryptographically secure code generation
    * currently not in use
    */
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    function generateCode() {
        var code = '';
        for (var i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
            if (code.length === 3) {
                code += '-';
            }
        }
        return code;
    };

    /**
     * Checks to see if the codes are the same
     * @param {String} code 
     * @param {String} storedCode 
     */
    function validateCode(code, storedCode) {
        if (code === storedCode) {
            return true;
        } else {
            return false;
        }
    };

    /*
    * cryptographically secure code generation
    * currently using this one
    */

    function generateCode2() {
        var nums = new Uint8Array(8);;
        crypto.randomFillSync(nums);
        var code = '';
        for (var i = 0; i < nums.length; i++) {
            if (Math.abs(nums[i]) < 42) {
                while (Math.abs(nums[i]) < 42) {
                    nums[i] += 42
                }
                code += String.fromCharCode(Math.abs(nums[i]));
            } else if (Math.abs(nums[i]) > 90) {
                while (Math.abs(nums[i]) > 90) {
                    nums[i] -= 42
                }
                code += String.fromCharCode(Math.abs(nums[i]));
            } else {
                code += String.fromCharCode(Math.abs(nums[i]));
            }
        }
        return code;
    };

    /*
    * validateEmail
    * regex from Dans Tools universal email match
    */
    function validateEmail(email) {
        if (email.match(/^[a-z0-9](\.?[a-z0-9_-]){0,}@[a-z0-9-]+\.([a-z]{1,6}\.)?[a-z]{2,6}$/g)) {
            return true;
        } else {
            return false;
        }
    };

    var reserved = {};
    main.io.on('connection', function (socket) {

        /**
         * resereved object for each socket holding information to
         * be saved after all fields have been entered
         */
        reserved[socket.id] = {
            name: '', pwd: '', email: '',
            confirmedPwd: false, confirmedEmail: false,
            code: generateCode2(), confirmedCode: false
        };
        /**
         * user name
         */
        socket.on('userName', function (name) {
            var db = main.mongo.db('mongodb://' + main.admin.user + ':' + main.admin.pass + '@' +
                main.dbHost + ':' + main.dbPort + '/multiplayer');
            if (name.length < 6 && !(name.length > 10)) {
                socket.emit('goodName', false, 'User name is too short. Must be 6-10 characters.')
            }
            for (var id in reserved) {
                if (reserved[id].name === name && id !== socket.id) {
                    socket.emit('goodName', false, 'That player name is reserved. Please try a different one.');
                }
            }
            db.collection('players').findOne({ name: user.name }, function (error, item) {
                if (error) {
                    main.io.emit('Error', error);
                    main.log.logMsg(error);
                    db.close();
                    process.exit(1);
                } else if (item) {
                    socket.emit('goodName', false, 'That player name is already in use. Please try a different one.');
                } else {
                    reserved[socket.id]['name'] = name;
                    socket.emit('goodName', true);
                }
            });
        });
        /**
         * pwd
         */
        socket.on('pwd', function (pwd) {
            if (pwd.match(/^([a-z]+)([A-Z]+)([0-9]+)([!@$%*&^]+)$/g)) {
                if (pwd.length < 8 && !(pwd.length > 16)) {
                    socket.emit('goodPass', false, 'Password is too short. Must be 8-16 characters')
                } else {
                    reserved[socket.id]['pwd'] = encryption.crpyt(pwd);
                    socket.emit('goodPass', true);
                }
            } else {
                socket.emit('goodPass', false, 'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol: !@$%*&^');
            }
        });
        /**
         * confirm the pwd
         */
        socket.on('confirmPwd', function (confirmPwd) {
            if (reserved[socket.id]['pwd'].match(confirmPwd)) {
                reserved[socket.id]['confirmedPwd'] = true;
                socket.emit('confirmedPwd', true);
            } else {
                socket.emit('confirmedPwd', false, 'Passwords don\'t match');
            }
        });
        /**
         * email
         */
        socket.on('email', function (email) {
            if (validateEmail(email)) {
                reserved[socket.id]['email'] = email;
                socket.emit('goodEmail', true);
            } else {
                socket.emit('goodEmail', false, 'The email you entered is not valid.');
            }
        });
        /**
         * email Confirm
         */
        socket.on('emailConfirm', function (emailConfirm) {
            if (reserved[socket.id]['email'].match(emailConfirm)) {
                reserved[socket.id]['confirmedEmail'] = true;
                socket.emit('confirmedEmail', true, 'An email has been sent to you with a confirmation code.');
                emailer.send({
                    template: /*template*/'',
                    message: {
                        to: reserved[socket.id]['email']
                    },
                    locals: {
                        name: reserved[socket.id]['name'],
                        code: reserved[socket.id]['code']
                    }
                }).then(console.log).catch(console.error);
            } else {
                socket.emit('confirmedEmail', false, 'Emails don\'t match.')
            }
        });
        /**
         * code Confirm
         * TODO finish this function to save initial player data
         */
        socket.on('codeConfirm', function (codeConfirm) {
            if (reserved[socket.id]['code'].match(codeConfirm)) {
                reserved[socket.id]['confirmedCode'] = true;
                socket.emit('codeConfirmed', true);
            } else {
                socket.emit('codeConfirmed', false, 'Code did not match');
            }
        });

        /**
         * disconnect
         * This is fired when ever someone is disconnected from the registration process
         * Either they lossed connection, refreshed the page or closed the browser
         */
        socket.on('disconnect', function () {
            if (typeof reserved[socket.id] !== 'undefined') {
                main.log.logMsg(reserved[socket.id] + " did not finish the registration process.");
                reserved[socket.id] = undefined;
                reserved = JSON.parse(JSON.stringify(reserved));
            }
        });
    });
};  
