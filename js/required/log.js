/**
 * ExEngine: log.js
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
module.exports = function () {
    const fs = require('fs');
    var log = {};

    /**
     * logMsg
     * @param {string} msg
     * 
     * logs a message to a log/year/month/day.txt
     */
    log.logMsg = function (msg) {
        var date = new Date();
        fs.appendFile(__dirname + '/log/' + date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + '.txt', date + ': ' + msg,
            function (err) {
                if (err) {
                    return console.error(err);
                }
            }
        );
    };

    /**
     * assert.typeOf
     * @param test your test case
     * @param {string} expect your expected result
     * @param {function} fn your callback function
     * 
     * checks the typeOf your test case against your expected result
     * Then sends a message to your callback function
     */
    log.assert.typeOf = function (test, expect, fn) {
        var e = null;
        if (typeof test === expect) {
            fn('assertion typeof test: ' + test + ' is of type ' + expect);
        } else {
            e = new Error('assertion typeof test: ' + test + ' is NOT of type ' + expect);
            fn(`${e.stack}`);
        }
    };

    /**
     * assert.equals
     * @param test your test case
     * @param expect your expected result
     * @param {function} fn your callback function
     * 
     * checks if your test case is equal to your expectation
     * then sends a message to your callback function
     */
    log.assert.equals = function (test, expect, fn) {
        var e = null;
        if (test === expect) {
            fn('assertion equals test: ' + test + ' equals ' + expect);
        } else {
            e = new Error('assertion equals test: ' + test + ' NOT equal to ' + expect);
            fn(`${e.stack}`);
        }
    };

    /**
     * assert.lengthOf
     * @param test your test case
     * @param expect your expected result
     * @param {function} fn your callback function
     * 
     * checks the lengthOf your test case against your expectation
     * then sends a message to your callback function
     */
    log.assert.lengthOf = function (test, expect, fn) {
        var e = null;
        if (test === Object(test) && typeof test !== 'array') {
            if (Object.keys(test).length === expect) {
                fn('assertion lengthOf test: ' + test + ' is equal to length ' + expect);
            } else {
                e = new Error('assertion lengthOf test: ' + test + ' is NOT equal to length ' + expect);
                fn(`${e.stack}`);
            }
        } else if (test.length === expect && test.length !== undefined) {
            fn('assertion lengthOf test: ' + test + ' is equal to length ' + expect);
        } else {
            e = new Error('assertion lengthOf test: ' + test + ' is NOT equal to length ' + expect);
            fn(`${e.stack}`);
        }
    };

    /**
     * assert.property
     * @param test your test case
     * @param expect your expected result
     * @param {function} fn your callback function
     * 
     * checks if your test case has an expected property
     * then sends a message to your callback function 
     */
    log.assert.property = function (test, expect, fn) {
        var e = null;
        if (test[expect] !== undefined) {
            fn('assertion property test: ' + test + ' does have property ' + expect);
        } else {
            e = new Error('assertion property test: ' + test + ' does NOT have property ' + expect);
            fn(`${e.stack}`);
        }
    };

    return log;
};
