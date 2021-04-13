const express = require('express');
const app = express();
const net = require("net");

const policy = require('./policyServer');
const lobbyServer = require('./LobbyServer');

policy();
let server1 = new lobbyServer()
server1.startServer();

app.use('/', express.static('../public'))

app.listen(5000, () => {
    console.log('server listening on 5000 port');
})