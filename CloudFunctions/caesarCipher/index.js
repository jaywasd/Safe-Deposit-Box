var AWS = require("aws-sdk");
AWS.config.loadFromPath('./config.json');
const dynamo = new AWS.DynamoDB.DocumentClient();

var express = require("express");
var app = express();

var cors = require("cors");
app.use(cors());

app.use(express.urlencoded());
app.use(express.json());

app.get('/:email', async function (req, res) {
  try{
    var body, status;
    var email = req.params.email;
    var captcha = generateCaptcha();
    var response = await checkEmail(email);
    if(response.Count == 1){
      var cipher = caesarCipherEncode(captcha, 5);
      var response2 = await updateCaptcha(email, cipher);
      body = {status: 200, body: {captcha: captcha}};
      status = 200;
    }else{
      body = {status: 400, body: "Invalid email address"};
      status = 400;
    }
    res.status(status).send(body);
  }catch(e){
    console.log(e);
  }
})

app.post("/", async function (req, res) {
  try{
    console.log(req);
    var email = req.body.email;
    var answer = req.body.answer;
    var response = await checkEmail(email);
    var body, status;
    if(response.Count == 1){
      if(response.Items[0].captcha == answer.toUpperCase()){
        body = {status: 200, body: "Approved", safeNumber: response.Items[0].safeNumber};
        status = 200;
      }else{
        body = {status: 403, body: "Invalid captcha"};
        status = 403
      }
    }else{
      body = {status: 400, body: "Invalid email address"};
      status = 400;
    }
    res.status(status).send(body);
  }catch(e){
    console.log(e);
  }
});

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
    ProjectionExpression: "captcha, safeNumber",
  };
  var res = await dynamo.query(params).promise();
  return res;
}

async function updateCaptcha(email, captcha){
  var params = {
    TableName: 'userDetails',
    Key:{
      "email": email
    },
    UpdateExpression: "set #c = :captcha",
    ExpressionAttributeNames: {
      "#c": "captcha"
    },
    ExpressionAttributeValues:{
      ":captcha": captcha
    },
    ReturnValues:"UPDATED_NEW"
  };
  var res = await dynamo.update(params).promise();
  return res;
}

function generateCaptcha() {
  var charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var listLength = charList.length;
  var data = '';
  for ( var i = 0; i < 6; i++ ) {
    data += charList.charAt(Math.floor(Math.random() * listLength));
  }
  return data;
}

function caesarCipherEncode(str, rightShift) {
  var alphabets =['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  var result = [];
  for(let i=0; i<str.length; i++){
    var nextPosition = alphabets.indexOf(str.charAt(i)) + rightShift;
    if(nextPosition > 25){
      nextPosition -= 26;
    }
    result.push(alphabets[nextPosition]);
  }
  return result.join("");
};

exports.caeserCipher = app;

// THIS IS FOR LOCAL TESTING
// const port = process.env.PORT || 8080;
// app.listen(port, function () {
//     console.log("App is running.");
// });