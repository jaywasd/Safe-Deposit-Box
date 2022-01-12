const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers' : "Content-Type",
        'Access-Control-Allow-Methods': '*'
    };

    try {
        switch (event.httpMethod) {
            case 'GET':
                let type = event.queryStringParameters.type;
                let email = event.queryStringParameters.email;
                let res = await checkEmail(email);
                if(res.Count == 1){
                    let boxNumber = res.Items[0].safeNumber;
                    if(type != ""){
                        if(type == 0){
                            let balance = await getBalance(boxNumber);
                            body = {status: 200, balance: balance};
                        }else if(type == 1){
                            let users = await getAllUsers(boxNumber);
                            let account = await Promise.all(
                                    users.map(async (e) => {
                                    let d = await getDebits(boxNumber, e);
                                    let c = await getCredits(boxNumber, e);
                                    let r = {user: e, credit: c, debit: d};
                                    return r;
                                })
                            );
                            body = {status: 200, data: account};
                        }else{
                            body = {status: 400, message: "Invalid request"};
                        }
                    }else{
                        body = {status: 200, message: "Invalid request"};
                    }
                }else{
                    statusCode = '404';
                    body = {status: 404, message: "No user found"};
                }
                break;
            case 'OPTIONS' :
            case 'POST' :
                let data = JSON.parse(event.body);
                let email2 = data.email;
                let amount = data.amount;
                let res2 = await checkEmail(email2);
                if(amount > 0){
                  if(res2.Count == 1){
                      let boxNumber = res2.Items[0].safeNumber;
                      let balance = await getBalance(boxNumber);
                      let new_balance;
                      if(data.type == "PLUS"){
                          new_balance = parseInt(balance) + parseInt(amount);
                          body = {status: 200, balance: new_balance, message: "Balance updated successfully"};
                          await updateBalance(boxNumber, new_balance);
                          await createLog(boxNumber, email2, amount, "PLUS")
                      }else if(data.type == "MINUS"){
                          new_balance = parseInt(balance) - parseInt(amount);
                          if(amount <= 1000 && new_balance >= 0){
                              body = {status: 200, balance: new_balance, message: "Balance updated successfully"};
                              await updateBalance(boxNumber, new_balance);
                              await createLog(boxNumber, email2, amount, "MINUS")
                          }else{
                              body = {status: 200, balance: balance, message: "Invalid amount"};
                          }
                      }else{
                          body = {status: 400, message: "Unsupported request type"};
                      }
                  }else{
                      body = {status: 404, message: "No user found"};
                  }
                }else{
                    body = {status: 400, message: "Please enter valid amount"};
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
async function checkEmail(email){
  var params = {
    TableName: 'userDetails',
    KeyConditionExpression: "#e = :email",
    ExpressionAttributeNames: {
      "#e": "email",
    },
    ExpressionAttributeValues:{
      ":email": email
    },
    ProjectionExpression: "safeNumber",
  };
  var res = await dynamo.query(params).promise();
  return res;
}
async function getAllUsers(boxNum){
  var params = {
    TableName: 'userDetails',
    FilterExpression: "#sn = :sn",
    ExpressionAttributeNames: {
      "#sn": "safeNumber"
    },
    ExpressionAttributeValues:{
      ":sn": boxNum
    },
    ProjectionExpression: "email",
  };
  var res = await dynamo.scan(params).promise();
  return res.Items.map((item)=> item.email);
}
async function getBalance(boxNum){
  var params = {
    TableName: 'safeDepositBoxes',
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues:{
      ":id": boxNum
    },
    ProjectionExpression: "amount",
  };
  var res = await dynamo.query(params).promise();
  return res.Items[0].amount;
}
async function getCredits(boxNum, email){
  var params = {
    TableName: 'safeDepositAccountLogs',
    FilterExpression: "#sn = :sn and #user = :user and #type = :type",
    ExpressionAttributeNames: {
      "#sn": "safeNumber",
      "#user": "user",
      "#type": "type"
    },
    ExpressionAttributeValues:{
      ":sn": boxNum,
      ":user": email,
      ":type": "PLUS"
    },
    ProjectionExpression: "amount",
  };
  var res = await dynamo.scan(params).promise();
  const total = res.Items.reduce((acc, item)=>parseInt(acc) + parseInt(item.amount), 0);
  return total;
}
async function getDebits(boxNum, email){
  var params = {
    TableName: 'safeDepositAccountLogs',
    FilterExpression: "#sn = :sn and #user = :user and #type = :type",
    ExpressionAttributeNames: {
      "#sn": "safeNumber",
      "#user": "user",
      "#type": "type"
    },
    ExpressionAttributeValues:{
      ":sn": boxNum,
      ":user": email,
      ":type": "MINUS"
    },
    ProjectionExpression: "amount",
  };
  var res = await dynamo.scan(params).promise();
  const total = res.Items.reduce((acc, item)=>parseInt(acc) + parseInt(item.amount), 0);
  return total;
}

async function updateBalance(boxNum, amount){
  var params = {
    TableName: 'safeDepositBoxes',
    Key: {"id": boxNum},
    UpdateExpression: "set #a = :a",
    ExpressionAttributeNames: {
        "#a": "amount"
    },
    ExpressionAttributeValues: {
        ":a": amount
    },
    ReturnValues:"UPDATED_NEW"
  };
  var res = await dynamo.update(params).promise();
  return res;
}
async function createLog(boxNum, email, amount, type){
    let randomId = Date.now();
    var params = {
        TableName: 'safeDepositAccountLogs',
        Item: {
            "id": randomId,
            "safeNumber": boxNum,
            "user": email,
            "amount": amount,
            "type": type
        }
    }
    var res = await dynamo.put(params).promise();
    return res;
}
