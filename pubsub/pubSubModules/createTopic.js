// https://cloud.google.com/nodejs/docs/reference/pubsub/latest
// Imports the Google Cloud client library
const { PubSub } = require("@google-cloud/pubsub");

// This creates the topic, 
async function quickstart(projectId, topicName, subscriptionName) {
  // Instantiates a client
  const pubsub = new PubSub({ projectId });

  // Creates a new topic
  const [topic] = await pubsub.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);
  
  // Creates a subscription on that new topic
  const [subscription] = await topic.createSubscription(subscriptionName);

  // Receive callbacks for new messages on the subscription
  subscription.on("message", (message) => {
    console.log("Received message:", message.data.toString());
    process.exit(0);
  });

  // Receive callbacks for errors on the subscription
  subscription.on("error", (error) => {
    console.error("Received error:", error);
    process.exit(1);
  });

  // Send a message to the topic
  //   topic.publishMessage(Buffer.from('Test message!'));
  topic.publish(Buffer.from("Test message!"));
}
module.exports = {quickstart}
quickstart("csci-5410-2021", "chatMessaging", "messageAuthUsers");
