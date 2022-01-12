const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
/* Pub Sub Imports */
const publishMessage = require('../../pubSubModules/publishMessage');
const pullMessage = require('../../pubSubModules/syncPull');
/* Set the topic to chatMessaging */
const pubSubTopic = "chatMessaging";
/* Set the project id to  */
const projectId = 'csci-5410-2021';
app.use(bodyParser.urlencoded({ extended: true }));
// make express know that public is the file to search for ejs files
app.use(express.static("public"));
// Set the view engine to ejs
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("welcome.ejs");
});

// Post endpoint
app.post("/", (req, res) => {
//   let name = req.body.name;
  try {
    // res.render("https:// docker3-cfz5p5gatq-uc.a.run.app?"+"name="+req.body.name);
    // Render the message user screen to allow user to chat with other users
    let otherUser = '';
    res.render("messageUser.ejs", {userName:req.body.name, otherAuthUser:otherUser, userMsg: '', otherUserMsg: ''});
    console.log('Name is:', req.body.name);
    // res.render("/index");
  } catch (err) {
    // if an error occurs then redirect to register form
    console.log(err);
    res.redirect("/");
  }
});

app.get("/messageUser", (req, res) => {
    let blankMsg = '';
    res.render("messageUser.ejs",{userName:req.body.message,otherAuthUser:blankMsg, userMsg: blankMsg, otherUserMsg: blankMsg});
  });

  app.post("/messageUser", (req, res, next) => {
    const userMsg = req.body.message;
    publishMessage.sendMsgToSubscription("chatMessaging", userMsg);
    // publishMessage.sendMsgToSubscription(pubSubTopic, userMsg);
    /* Creation of publisher needs to be handled, hard coding it for now. */
    let receivedMessages = [];
    receivedMessages = pullMessage.pullMessagesForSubscriber(projectId, "user1");
    console.log('Pull Messages');
    for(let i=0;i<receivedMessages.length;i++) {
      let eachMessage = receivedMessages[i];
      console.log('message received:', eachMessage);
      res.render('messageUser.ejs', {userMsg: req.body.message, otherUserMsg: eachMessage});
    }
    // next();
    // process.exit(0);
  })
  
// Listen on port and start server
app.listen(port, () => {
  console.log(`Started server. Listening on port ${port}`);
});
