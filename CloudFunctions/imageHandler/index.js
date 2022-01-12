const express = require('express');
const vision = require('@google-cloud/vision');
var cors = require("cors");

const {format} = require('util');
const express = require('express');
const Multer = require('multer');

const app = express();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

app.get('/processImage/:bucket/:user/:img', async (req, res) => {
  const bucket = req.params.bucket;
  const user = req.params.user;
  const img = req.params.img;
  const id = "SD" + Math.floor((Math.random()*9000)+1000);
  const link = 'gs://safedepositbucket/'+img;
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.labelDetection(link);
  const labels = result.labelAnnotations;
  let label_list = {};
  labels.forEach(label => label_list[label.description] = label.score);
  db.collection("bucket_images")
    .doc(id)
    .set({
      user_bucket: bucket,
      user_name: user,
      user_image: img,
      image_labels: label_list
    })
    .then(function () {
      res.send({ body: "Image labeled successfully" });
    });
});

app.get('/compareImage/:bucket/:user/:img', async (req, res) => {
  const bucket = req.params.bucket;
  const user = req.params.user;
  const img = req.params.img;

  var data = [];
  var data2 = [];
  const original_image = await db.collection('bucket_images').where('user_image', '==', img).get();
  if (original_image.size > 0) {
    original_image.forEach((image) => {
      var tmp = {};
      tmp = image.data();
      tmp["id"] = image.id;
      data.push(tmp);
    });
  }

  const images = await db.collection('bucket_images').where('user_name', '!=', user).get();
  if (images.size > 0) {
    images.forEach((image) => {
      var tmp = {};
      tmp = image.data();
      tmp["id"] = image.id;
      if(tmp.user_bucket == bucket){
        data2.push(tmp);
      }
    });
  }
  let finalSimilarity = 0;
  data2.forEach((element)=>{
    let tmp = detectSimilarity(data[0], element);
    if(tmp > finalSimilarity){
      finalSimilarity = tmp;
    }
  });

  res.send({ message: finalSimilarity + "% similarity detected", similarity: finalSimilarity });
});

const detectSimilarity = (original_image, other_image) => {
  let original_labels = Object.keys(original_image.image_labels);
  let other_labels = Object.keys(other_image.image_labels);
  const intersection = original_labels.filter(element => other_labels.includes(element));
  return intersection.length * 10;
}
exports.imageHandler = app;
