const net = require('net');

const User = require('./User');

class GameServer {
    constructor(id) {
        this.server;
        this.gameId = id;
        this.users = [];
        this.clickedDots = [];
        this.dots = 50;
        this.scores = [];
    }

    // Map generator
    // Could be better, todo make it better
    genMap() {
        let dotsMap = '';
        for (let i = 1; i <= this.dots; i++) {
            let generatedDots = this.genCords(40,510) + '`' + this.genCords(360,110) + '`' + this.genCords(36,46) + '`' + this.genCords(0,360);
            dotsMap = dotsMap + generatedDots + ',';
            
        }
        dotsMap = dotsMap.substring(0, dotsMap.length - 1);
        return dotsMap;
    }

    // X, Y cords generator
    genCords(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    startServer() {
        this.server = net.createServer((socket) => {
            socket.setEncoding('utf8');

            // Creates new game user
            const user = new User(socket, this)

            socket.on('data', data => {
                data = data.substr(0, data.length - 1)

                switch(data[0]) {
                    case 'm': // Mouse position packet

                        // Sends mouse position to every user
                        (this.users).forEach(everyGameUser => {
                            everyGameUser.send(data)
                        });

                        break;
                    case 'x': // Dot clicked packet

                        // If there is more not clicked dots than 0
                        if(this.dots > 0) {
                            // If clicked dot from packet is not in game clicked dots array
                            if(!((this.clickedDots).includes(data.substring(1)))) {
                                // Sends clicked dot to every user to delete it from client map
                                (this.users).forEach(everyGameUser => {
                                    everyGameUser.send('x' + user.shortID + data.substring(1))
                                });
                                // Adds clicked dot from packet to game clicked dots array
                                (this.clickedDots).push(data.substring(1))
                                // Adds score to user
                                user.addScore(1)
                                // Deletes available dots from game available dots array
                                this.dots = this.dots - 1;
                            }
                        } else {

                            // Set user scores data
                            (this.users).forEach(everyGameUser => {
                                (this.scores).push(everyGameUser.shortID + everyGameUser.score)
                            })
                            this.scores = (this.scores).join('`');

                            // Send k packet to all game users and disconnect them 
                            (this.users).forEach(everyGameUser => {
                                // Sends scores to client
                                everyGameUser.send('k' + scores);
                                // Destroy user socket
                                // everyGameUser.socket.destroy();
                            });
                            // Close server
                            this.server.close();

                            break;
                        }
                    case 'e': // Game end packet

                        // I dont know why x packet comes there xD So i have to check if packet is 'e'
                        if(data[0] == "e") {

                            // Set user scores data
                            (this.users).forEach(everyGameUser => {
                                (this.scores).push(everyGameUser.shortID + everyGameUser.score)
                            })
                            this.scores = (this.scores).join('`');

                            // Send k packet to all game users and disconnect them 
                            (this.users).forEach(everyGameUser => {
                                // Sends scores to client
                                everyGameUser.send('k' + this.scores);
                                // Destroy user socket
                                everyGameUser.socket.destroy();
                            });

                            // Close server
                            this.server.close();

                            break;
                        }
                        break;
                    case 'i': // Game information packet

                        // Save user if not saved
                        if(user.playername == "test") {
                            user.setShortId()
                            user.setColors(((data.substr(1)).split('`'))[2],((data.substr(1)).split('`'))[3])
                            user.setUser(((data.substr(1)).split('`'))[1], ((data.substr(1)).split('`'))[0]);
    
                            (this.users).push(user);
                        }

                        // Map generation
                        let generatedMap = this.genMap();

                        (this.users).forEach(everyGameUser => {

                            // Send informations about other users to user
                            user.send('i' + everyGameUser.fullname + '`' + everyGameUser.insideColor + '`' + everyGameUser.outsideColor + '`' + everyGameUser.shortID)

                            // Send informations about user to all users
                            everyGameUser.send('i' + user.fullname + '`' + user.insideColor + '`' + user.outsideColor + '`' + user.shortID)

                            // Send the generated map to every user
                            everyGameUser.send('w' + generatedMap) // 510 max X, 40 min X, 110 max Y, 360 min Y
                        
                        });

                        break;

                    default: // x packet hits there lol why?
                        console.log('Not handled packet');
                        break;
                }
            })
            socket.on('close', () => {

                    console.log(`User ${user.fullname} disconnected from game server ${this.gameId}.`);

                    // // Destroy user socket
                    user.socket.destroy();

                    // // Delete disconnected user from game users array
                    const index = (this.users).indexOf(user);
                    if(index > -1) {
                        (this.users).splice(index, 1);
                    }
            })
        }).listen((900 + this.gameId))
    }
}

module.exports = GameServer;