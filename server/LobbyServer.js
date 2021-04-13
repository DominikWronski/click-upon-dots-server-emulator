const net = require("net");
const { v4: uuidv4 } = require('uuid');

const User = require('./User');
const Room = require('./Room');
const GameServer = require('./GameServer');

class LobbyServer {
    constructor() {
        this.users = [];
        this.rooms = [];
        this.chatHistory = [];
    }

    startServer() {
        net.createServer((socket) => {
            socket.setEncoding('utf8');

            // Making user
            const user = new User(socket, this)
            
            // Making all needed rooms
            for(let i = 0; i<13; i++) {
                this.rooms[i] = new Room(i);
            }

            socket.on('data', data => {
                data = data.substr(0, data.length - 1)
                console.log("Packet: " + data);

                switch(data[0]) {
                    case 'r': // Sends username from client

                        //Set user id and user playername
                        user.setUser(uuidv4(), data.slice(1))

                        // Add new user to lobby server users array
                        this.users.push(user)

                        // Add new user to none room array
                        this.rooms[0].users.push(user);

                        // Set user room to 'none'
                        user.setRoom = 'none'
                        console.log(`User ${user.fullname} connected.`);

                        // Sets client user ID
                        user.send('d' + user.id);

                        // Loads lobby flash scene
                        user.send('g');

                        break;
                    case 'c': // Chat packet

                        console.log(`${user.playername}: ${data.split(': ')[1]}`);
                        
                        // To do:
                        // Add admin commands; /kick, /report etc
                        // Add command /pop  

                        // Send to all users new user message
                        (this.users).forEach(user => {
                            user.send(`c${data.slice(1)}`)
                        });

                        // Add new user message to lobby server chat history array 
                        this.chatHistory.push(data.slice(1));

                        break;
                    case 'o': // Lobby join packet

                        // Loads all users in lobby
                        (this.users).forEach(everyUser => {
                            user.send(`j${everyUser.room}\`${everyUser.fullname}`)
                            everyUser.send(`j${user.room}\`${user.fullname}`);
                        });

                        // Loads all messages in lobby
                        (this.chatHistory).forEach(message => {
                            user.send(`c${message}`)
                        });

                        break;
                    case 'j': // Room join packet
                        console.log(`${user.playername} joined to room: ${data[1]}`);
                        if(user.room == 'none') {
                            (this.rooms[0]).delUser(user);
                            (this.users).forEach(everyuser => {
                                everyuser.send('l' + user.room + '`' + user.fullname);
                                everyuser.send('j' +data[1]+'`' + user.fullname);
                            });
                            user.room = data[1];
                            (this.rooms[data[1]].users).push(user);
                        } else {
                            if(data[1] == 'n') {
                                (this.users).forEach(everyuser => {
                                    everyuser.send('l' + user.room + '`' + user.fullname);
                                    everyuser.send('j' + 'none' + '`' + user.fullname);
                                });
                                (this.rooms[user.room]).delUser(user);
                                user.room = 'none';
                                (this.rooms[0].users).push(user);
                        } else {
                                (this.users).forEach(everyuser => {
                                    everyuser.send('l' + user.room + '`' + user.fullname);
                                    everyuser.send('j' + data[1] + '`' + user.fullname);
                                });
                                (this.rooms[user.room]).delUser(user);
                                user.room = data[1];
                                (this.rooms[data[1]].users).push(user);
                            }
                        }
                        break;
                    case 'q': // User has left game server packet

                        //Send r and l packet to all lobby users
                        (this.users).forEach(everyuser => {
                            // Unlock room
                            everyuser.send('r' + user.room);
                            // Kick users out of the room
                            everyuser.send('l' + user.room + '`' + user.fullname);
                        });

                        // Delete user from room
                        (this.rooms[user.room]).delUser(user);

                        // Set room started property to false 
                        (this.rooms[user.room]).started = false;

                        // Set user room to 'none'
                        user.room = 'none';

                        // Loads lobby flash scene to user
                        user.send('g');

                        break;
                    case 's': // Game start packet

                        // Set room started property to true 
                        (this.rooms[user.room]).started = true;

                        // Send to all users in lobby that room started and starts game to users in this room
                        (this.users).forEach(everyuser => {
                            everyuser.send('s' + user.room);
                        });

                        // Create game server for started room
                        const gameServer = new GameServer(user.room);
                        gameServer.startServer();

                        break;
                    default:
                        console.log('Not handled packet');
                        break;
                    }
                })

            socket.on('close', () => {

                    console.log(`User ${user.fullname} disconnected.`);

                    // Destroy user socket
                    user.socket.destroy();

                    // Delete disconnected user from lobby users array
                    const index = (this.users).indexOf(user);
                    if(index > -1) {
                        (this.users).splice(index, 1);
                    }

                    // Send to every user l packet
                    (this.users).forEach(everyuser => {
                        // Sends to users that disconnected user has left from the game
                        everyuser.send('l' + user.room + '`' + user.fullname);
                    });

            })
        }).listen(9000)
    }
}

module.exports = LobbyServer