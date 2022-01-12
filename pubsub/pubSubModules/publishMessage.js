// https://github.com/googleapis/nodejs-pubsub/blob/main/samples/publishMessage.js
// Publishes a message to a topic.
function sendMsgToSubscription(topicName, data) {
//   const topicName = "chatMessaging";
//   const data = JSON.stringify({ foo: "bar" });
  // Imports the Google Cloud client library
  const { PubSub } = require("@google-cloud/pubsub");

  // Creates a client; cache this for further use
  const projectId = 'csci-5410-2021'
  const keyFilename = './service-account-file.json'
  const pubSubClient = new PubSub();

  async function publishMessage() {
    // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(data);

    try {
      const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
      console.log(`Message ${messageId} published.`);
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }
  }

  publishMessage();
  // [END pubsub_publish_with_error_handler]
  // [END pubsub_quickstart_publisher]
}

process.on("unhandledRejection", (err) => {
  console.error(err.message);
  process.exitCode = 1;
});
module.exports = {sendMsgToSubscription};
// sendMsgToSubscription("chatMessaging", "Hi There users.");
