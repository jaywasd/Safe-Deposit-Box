const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
    res.render('home.ejs');
});

server.listen(3001, () => {
    console.log("Server Running on port 3001");
});

io.on('connection', (socket) => {
    console.log('User connected'+socket.id);

    socket.on("message", (data) => {
        socket.broadcast.emit('message', data)
        console.log(data);
    })
});