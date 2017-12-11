/**
 * ExEngine: encryption.js
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
    "use strict"
    //The following comes from example code from nodejs crypto page
    //https://nodejs.org/api/crypto.html
    const crypto = require('crypto');
    const cipher = crypto.Cipher(main.method, main.lock);
    const decipher = crypto.createDecipher(main.method, main.lock);
    const encryption = {};

    const crypt = function (string) {
        var encrypted = '';
        cipher.on('readable', function () {
            const data = cipher.read();
            if (data)
                encrypted += data.toString('hex');
        });
        cipher.on('end', function () {
            return true;
        });

        cipher.write(string);
        cipher.end();
        return encrypted;
    };

    const decrypt = function (string) {
        var decrypted = '';
        decipher.on('readable', function () {
            const data = decipher.read();
            if (data)
                decrypted += data.toString('utf8');
        });
        decipher.on('end', function () {
            return true;
        });

        decipher.write(encrypted, 'hex');
        decipher.end();
        return decrypted;
    };
    // end nodejs crypto example functions.

    /**
     * My own encryption functions
     * krypt
     * @param {String} str 
     * string to be encrypted must be greater than 1 character
     * @param {String} en 
     * string password for encryption must be at least 1 character
     * @param {Number} num 
     * number password for encryption must be less than or greater than 0
     * 
     * This method of encryption makes use of the full utf-8 specification.
     * Also note that a single letter change in the string to be encrypted will change the
     * entire encrypted string!
     */
    function krypt(str, en, num) {
        try {
            if (str.length <= 1 || en.length < 1 || num === 0) {
                throw new Error("check krypt arguments at least one of them is bad");
            } else {
                var str2 = '', c1, c2, mod = str.split('').map(function (a) { return a.charCodeAt(0) }).reduce(function (a, b) { return a + b });
                for (let i = 0; i < str.length; i++) {
                    c1 = str.charCodeAt(i);
                    for (let p = 0; p < en.length; p++) {
                        c2 = en.charCodeAt(p);
                        c2 = c2 % 2 === 0 ? c2 << 1 : c2 >> 1;
                        c1 = c1 + c2 - Math.round(num) + mod;
                    }
                    str2 += String.fromCharCode(c1);
                }
                return str2 += String.fromCharCode(mod);
            }
        } catch (e) {
            console.error(e);
        }
    };

    function dekrypt(str, en, num) {
        var str2 = '', c1, c2, mod = str.charCodeAt(str.length-1);
        for (let i = 0; i < str.length; i++) {
            c1 = str.charCodeAt(i);
            for (let p = 0; p < en.length; p++) {
                c2 = en.charCodeAt(p);
                c2 = c2 % 2 === 0 ? c2 << 1 : c2 >> 1;
                c1 = c1 - c2 + Math.round(num) - mod;
            }
            str2 += String.fromCharCode(c1);
        }
        return str2.slice(0, -1);
    };


    encryption.crypt = crypt;
    encryption.decrypt = decrypt;
    encryption.krypt = krypt;
    encryption.dekrypt = dekrypt;
    return encryption;
};
