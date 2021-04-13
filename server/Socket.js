const net = require("net");

class Socket {
    constructor(socket) {
        this.socket = socket
    }

    send(data) {
        this.socket.write(data + '\0');
    }
}

module.exports = Socket