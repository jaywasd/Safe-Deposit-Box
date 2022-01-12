const topic = require('./pubSubModules/createTopic');
const subscriber = require('./pubSubModules/createSubscription');
const publishMessage = require('./pubSubModules/publishMessage');
const pullMessage = require('./pubSubModules/syncPull');
// Creates topic, subscription for the project defined
// topic.quickstart("csci-5410-2021", "chatMessaging", "messageAuthUsers");
// user3
// subscriber.createSubscription("chatMessaging","user3");

/* input is topic name, message to publish */
publishMessage.sendMsgToSubscription("chatMessaging", "Hi There users.");

/* input is project id, subscriber name */
pullMessage.pullMessagesForSubscriber("csci-5410-2021", "user1");