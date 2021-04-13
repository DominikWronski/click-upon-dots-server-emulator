const net = require('net');

const Socket = require('./Socket');

class User extends Socket {
    constructor(socket, server) {
        super(socket)
        this.server = server
        this.playername = "test"
        this.room = 'none';
        this.score = 0;
    }

    setUser(id, playername) {
        this.id = id
        this.playername = playername
        this.fullname = this.playername + "`" + id
    }

    setShortId() {
        this.shortID = (Math.floor(Math.random() * 9) + 1)
    }

    setColors(color1, color2) {
        this.insideColor = color1;
        this.outsideColor = color2;
    }
    
    addScore(point) {
        this.score = this.score + point
    }

    setRoom(roomId) {
        this.room = roomId
    }
}

module.exports = User