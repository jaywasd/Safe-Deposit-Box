const express = require("express");
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 4000;
const io = require('socket.io')(server, {cors: {origin: "*"}});
app.set("view engine", "ejs");
const users = {}

const publishMessage = require('./pubSubModules/publishMessage');
const pullMessage = require('./pubSubModules/syncPull');
const projectId = 'csci-5410-2021';
const pubSubTopic = "chatMessaging";
const subscriber = require('./pubSubModules/createSubscription');

app.get("/", (req, res) => {
  res.render("welcome.ejs");
});

app.get("/messageUser", (req, res) => {
    res.render("messageUser.ejs");
  });

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
let username = '';
io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    username = name;
    subscriber.createSubscription("chatMessaging", username);
    socket.broadcast.emit('user-connected', name)
    console.log('user-connected', name)
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
    publishMessage.sendMsgToSubscription(pubSubTopic, message);
    let receivedMessages = [];
    receivedMessages = pullMessage.pullMessagesForSubscriber(projectId, username);
    console.log('Pull Messages');
    for(let i=0;i<receivedMessages.length;i++) {
      let eachMessage = receivedMessages[i];
      console.log('message received:', eachMessage);
    }
  })
  socket.on('disconnect', () => {
    console.log('user-disconnected', users[socket.id])
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})