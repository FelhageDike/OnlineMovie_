const http = require('http');
const fs = require('fs');
const ws = require('ws');

const SOCKET_PORT = 8000;
const HTTP_PORT = 8080;

const wss = new ws.Server({
    port: SOCKET_PORT
});
const log = console.log;
const clients = new Set();
let playerState = {
    message: ''
};

function accept(req, res) {
    if (req.url === '/ws' && req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() === 'websocket' &&
        // может быть подключён: keep-alive, Upgrade
        req.headers.connection.match(/\bupgrade\b/i)
    ) {
        log('accepted');
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
        return res.end();
    }
    log('get ' + req.url);
    let fn = req.url === '/' ? './index.html' : '.' + req.url;
    fs.createReadStream(fn).pipe(res);
}

wss.on('connection', function(ws) {
    clients.add(ws);
    console.log("new connection. clients " + clients.size);

    log("connect");
    ws.on('message', function (message) {
        log(`request a message: ${message}`);
        let data = JSON.parse(message);
        message = data.message.slice(0, 50); // максимальная длина сообщения 50
        playerState = {
            message
        };
        for(let client of clients) {
            client.send(JSON.stringify(playerState));
        }
    });

    ws.on('close', function () {
        log(`connection closed`);
        clients.delete(ws);
    });

    ws.send(JSON.stringify(playerState));
});

if (!module.parent) {
    http.createServer(accept).listen(HTTP_PORT);
} else {
    exports.accept = accept;
}