
// https://cloud.google.com/nodejs/docs/reference/pubsub/latest
// https://github.com/googleapis/nodejs-pubsub/blob/main/samples/createSubscription.js
function createSubscription(topicName, subscriptionName) {
  // [START pubsub_create_pull_subscription]

  // Imports the Google Cloud client library
  const { PubSub } = require("@google-cloud/pubsub");

  // Creates a client; cache this for further use
  
  const projectId = 'csci-5410-2021'
  const keyFilename = './service-account-file.json'
  const pubSubClient = new PubSub({projectId, keyFilename});

  async function createSubscription() {
    // Creates a new subscription
    await pubSubClient.topic(topicName).createSubscription(subscriptionName);
    console.log(`Subscription ${subscriptionName} created.`);
  }

  createSubscription().catch(console.error);
  // [END pubsub_create_pull_subscription]
}

module.exports = {createSubscription};
// createSubscription("chatMessaging","user4");
