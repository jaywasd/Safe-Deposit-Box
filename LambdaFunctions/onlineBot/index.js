const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const documentClient = new AWS.DynamoDB.DocumentClient();


async function getItem(params) {
    try {
        const data = await documentClient.query(params).promise();
        return data;
    } catch (err) {
        return err;
    }
}

exports.handler = async (event, context) => {
    try {
        const fulfillmentState = 'Fulfilled';
        const sessionId = event.sessionId;
        const params = {
            TableName: 'userDetails',
            KeyConditionExpression: "#e = :email",
            FilterExpression: "#fname = :fname AND #lname = :lname",
            ExpressionAttributeNames: {
                "#e": "email",
                "#fname": "firstName",
                "#lname": "lastName"
            },
            ExpressionAttributeValues: {
                ":email": event.currentIntent.slotDetails.email.originalValue,
                ":fname": event.currentIntent.slotDetails.firstName.originalValue,
                ":lname": event.currentIntent.slotDetails.lastName.originalValue
            },
        };

        const data = await getItem(params);
        let message = {'contentType': 'PlainText', 'content': `Sorry box number is not available.`};
        if (data.Items.length > 0) {
            message = {'contentType': 'PlainText', 'content': `Your box number is ${data.Items[0].safeNumber}`};
        }
        check = {
            dialogAction: {
                type: 'Close',
                fulfillmentState,
                message,
            },
        }
        console.log(check)
        return check;
    } catch (err) {
        console.log(err);
        return {error: err};

    }
};
