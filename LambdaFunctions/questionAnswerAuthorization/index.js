const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers' : "Content-Type",
        'Access-Control-Allow-Methods': 'POST,GET'
    };

    try {
        switch (event.httpMethod) {
            case 'GET':
                console.log(event.queryStringParameters.email + " Logged in successfully.");
                var params = {
                    TableName: 'userDetails',
                    KeyConditionExpression: "#e = :email",
                    ExpressionAttributeNames: {
                        "#e": "email",
                    },
                    ExpressionAttributeValues:{
                        ":email": event.queryStringParameters.email
                    },
                    ProjectionExpression: "securityQuestion",
                };
                var res = await dynamo.query(params).promise();
                if(res.Count == 1){
                    body = {"code":200, "message": res.Items[0].securityQuestion};
                }else{
                    body = {"code":400, "message": "Invalid request"};
                }
                break;
            case 'POST':
                var data = JSON.parse(event.body);
                var params = {
                    TableName: 'userDetails',
                    KeyConditionExpression: "#e = :email",
                    FilterExpression: "#a = :answer",
                    ExpressionAttributeNames: {
                        "#e": "email",
                        "#a": "questionAnswer"
                    },
                    ExpressionAttributeValues:{
                        ":email": data.email,
                        ":answer": data.answer
                    },
                    ProjectionExpression: "questionAnswer",
                };
                var res = await dynamo.query(params).promise();
                if(res.Count == 1){
                    body = {"code":200, "message": "User verified successfully"};
                }else{
                    body = {"code":400, "message": "Invalid answer"};
                }
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '200';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
