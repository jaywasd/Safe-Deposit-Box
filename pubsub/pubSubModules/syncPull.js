// https://cloud.google.com/pubsub/docs/samples/pubsub-create-pull-subscription
// Pulls message for a subscriber and then acknowledges the messages, thus removing the messages that are pulled
function pullMessagesForSubscriber(projectId, subscriptionName) {
  // const projectId = "csci-5410-2021";
  // const subscriptionName = "user3";

  // Imports the Google Cloud client library. v1 is for the lower level
  // proto access.
  const { v1 } = require("@google-cloud/pubsub");
  // const projectId = 'csci-5410-2021'
  const keyFilename = './service-account-file.json'
  // Creates a client; cache this for further use.
  const subClient = new v1.SubscriberClient();
  let receivedMessages = [];
  async function synchronousPull() {
    const formattedSubscription = subClient.subscriptionPath(
      projectId,
      subscriptionName
    );

    // The maximum number of messages returned for this request.
    // Pub/Sub may return fewer than the number specified.
    const request = {
      subscription: formattedSubscription,
      maxMessages: 10,
    };

    // The subscriber pulls a specified number of messages.
    const [response] = await subClient.pull(request);

    // Process the messages.
    const ackIds = [];
    for (const message of response.receivedMessages) {
      console.log(`Received message: ${message.message.data}`);
      receivedMessages.push(message.message.data);
      ackIds.push(message.ackId);
    }
    if (ackIds.length !== 0) {
      // Acknowledge all of the messages. You could also acknowledge
      // these individually, but this is more efficient.
      const ackRequest = {
        subscription: formattedSubscription,
        ackIds: ackIds,
      };

      await subClient.acknowledge(ackRequest);
    }

    console.log("Done.");
  }

  synchronousPull().catch(console.error);
  // [END pubsub_subscriber_sync_pull]
  /* Print the Received Messages */
  console.log("Pulling Messages");
  for(let i=0;i<receivedMessages.length;i++) {
    console.log(receivedMessages[i]+"\n");
  }
  return receivedMessages;
}
module.exports = {pullMessagesForSubscriber};
// pullMessagesForSubscriber("csci-5410-2021", "user1");