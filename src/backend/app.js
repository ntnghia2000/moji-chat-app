const ws = require("ws");
const wsServer = new ws.WebSocketServer({ port: 3300 });

wsServer.on("connection", (socket) => {
    console.log("Connection established!");
    socket.on("message", (data) => {
        console.log("User message: ", data);
    });
});