var AWS = require('aws-sdk');
var client = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    console.log('Received event:', event);
    var data = event.request.userAttributes;

    var res = await getEmptyBox();
    console.log(res);
    var safeBoxId;
    var userCount;
    if(res.Items.length == 0){
        var year = new Date().getFullYear();
        var month = ("0" + (new Date().getMonth() + 1)).slice(-2);
        safeBoxId = "SD" + year + month + Math.floor((Math.random()*9000)+1000);
        createSafeBox(safeBoxId);
        res = await getEmptyBox();
        userCount = 0;
    }else{
        safeBoxId = res.Items[0].id;
        userCount = res.Items[0].totalUsers;
    }

    await updateUserCount(safeBoxId, userCount + 1);

    var params = {
        TableName: 'userDetails',
        Item: {
            'email' : data["email"],
            'firstName' : data["name"],
            'lastName' : data["custom:lastName"],
            'safeNumber' : safeBoxId,
            'securityQuestion' : data["custom:securityQuestion"],
            'questionAnswer' : data["custom:questionAnswer"]
        }
    };
    client.put(params, await function(err, res) {
        if (err) {
            console.log("error inserting user data in database"+err);
        } else {
            console.log("user data inserted successfully.");
        }
    });
    

    callback(null, event);
    
};
async function createSafeBox(id){
    var boxSpecs = {
        TableName: 'safeDepositBoxes',
        Item: {
            "id": id,
            "totalUsers": 0,
            "amount": 5000,
        }
    }
    client.put(boxSpecs, await function(err, res) {
        if (err) {
            console.log("error inserting user data in database"+err);
        } else {
            console.log("user data inserted successfully.");
        }
    });
}
async function getEmptyBox(){
    var query = {
        TableName: 'safeDepositBoxes',
        FilterExpression: "#c >= :zero AND #c < :three",
        ExpressionAttributeNames: {
            "#c": "totalUsers",
        },
        ExpressionAttributeValues:{
            ":zero": 0,
            ":three": 3
        },
        ProjectionExpression: "id, totalUsers, allUsers",
    };
    var result = await client.scan(query).promise().then(data => { return data;}).catch(console.error);
    return result;
}
async function updateUserCount(id, count){
    var query = {
        TableName: 'safeDepositBoxes',
        Key: {
            "id": id,
        },
        UpdateExpression: "set #c = :c",
        ExpressionAttributeNames: {
            "#c": "totalUsers",
        },
        ExpressionAttributeValues:{
            ":c": count,
        },
        ReturnValues:"UPDATED_NEW"
    };
    await client.update(query).promise().then(data => { return data;}).catch(console.error);
}