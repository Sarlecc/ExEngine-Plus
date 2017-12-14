/**
 * ExEngine: metrics.js
 * Version: 1.1.0
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
    var main = main;

    io.on('connection', function (socket) {
        console.log("A socket has connected to the server, they are not logged in yet. socket id: " + socket.id);


        /**
         * save skill data
         */
        //TODO use log.js to log messages instead of console.log
        socket.on('saveSkillData', function (data) {
            var db = main.mongo.db('mongodb://' + main.admin.user + ':' + main.admin.pass + '@' +
                main.dbHost + ':' + main.dbPort + '/multiplayer');
            var info = data;
            db.collection(info.collection).findOne({ name: info.name }, function (error, item) {
                var saved = false;
                if (error) {
                    main.io.emit('Error', error);
                    console.error(error);
                    process.exit(1);
                }
                console.info('findOne: ', item);
                if (item === null) {
                    db.collection(info.collection).insert(info, function (error, count) {
                        io.emit('saved skill data', 'saved skill data');
                        console.info('saved skill data', count);
                    });
                } else {
                    for (var i = 0; i < item.skills.length; i++) {
                        if (item.skills[i].id === info.skills[0].id) {
                            item.skills[i].uses += 1;
                            if (item.skills[i].skillDamage.length === 10) {
                                item.skills[i].skillDamage.shift();
                                item.skills[i].skillDamage.push(info.skills[0].skillDamage);
                            } else {
                                item.skills[i].skillDamage.push(info.skills[0].skillDamage);
                            }
                            if (item.skills[i].avgTargets.length === 10) {
                                item.skills[i].avgTargets.shift();
                                item.skills[i].avgTargets.push(info.skills[0].avgTargets);
                            } else {
                                item.skills[i].avgTargets.push(info.skills[0].avgTargets);
                            }
                            saved = true;
                            break;
                        }
                    }
                    if (saved === false) {
                        item.skills.push([{
                            id: info.skills[0].id,
                            name: info.skills[0].name,
                            uses: info.skills[0].uses,
                            skillDamage: [info.skills[0].skillDamage],
                            avgTargets: [info.skills[0].avgTargets]
                        }]);
                        saved = true;
                    }

                    var id = item._id.toString();
                    console.info('before saving: ', item);
                    db.collection(info.collection).save(item, function (error, count) {
                        main.io.emit('updated skill data', 'updated skill data');
                        console.info('save: ', count);
                    });
                }
                db.close();
            });
        }); // on save skill data

        /**
         * retrieve skill data
         */
        socket.on('retrieveData', function (request, fnd) {
            var db = main.mongo.db('mongodb://' + main.admin.user + ':' + main.admin.pass + '@' +
                dbHost + ':' + main.dbPort + '/multiplayer');
            var info = request;
            db.collection(info.collection).findOne({ name: info.name }, function (error, item) {
                if (error) {
                    main.io.emit('Error', error);
                    console.error(error);
                    process.exit(1);
                }
                if (item === null) {
                    fnd({ data: 'No data for ' + info.name });
                } else {
                    fnd({ data: item });
                }
                var id = item._id.toString();
                console.info('findOne: ', item, id);
                db.close();
            });
        });

    }); 

};
