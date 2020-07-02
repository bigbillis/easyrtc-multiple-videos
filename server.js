// Load required modules

var https = require("https"); // https server core module
var express = require("express"); // web framework external module
var serveStatic = require('serve-static'); // serve static files
var socketIo = require("socket.io");
var fs = require('fs'); // web socket external module
var easyrtc = require("./lib/easyrtc_server");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // EasyRTC external module
var port = 8085
var options = {
    key: fs.readFileSync('cert/server.key', 'utf8'),
    cert: fs.readFileSync('cert/server.crt', 'utf8'),
    passphrase: 'hello'
};
// Set process name
process.title = "node-easyrtc";

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();

app.use(serveStatic('static', {
    'index': ['index.html']
}));

app.get('/', function (req, res) {
    res.sendFile('./index.html', { root: __dirname });
});

// for secure connection 
var webServer = https.createServer(options, app).listen(port);
// Start Socket.io so it attaches itself to Express server
console.log('listening on https://localhost:' + port);

var socketServer = socketIo.listen(webServer, {
    "log level": 1
});


easyrtc.setOption("logLevel", "debug");

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function (socket, easyrtcid, msg, socketCallback, callback) {
    // console.log("***********************",easyrtcid);
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function (err, connectionObj) {
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {
            "isShared": false
        });

        console.log("[" + easyrtcid + "] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function (connectionObj, roomName, roomParameter, callback) {
    console.log("[" + connectionObj.getEasyrtcid() + "] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function (err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function (appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);
        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});
