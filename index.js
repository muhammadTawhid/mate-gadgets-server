const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require('mongodb');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${dbUser}:${dbPassword}@mate-gadgets.wtxhn.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const gadgetsCollection = client.db(dbUser).collection("gadgets");

    //   create data to database
  app.post("/addProduct", (req, res) =>{
      gadgetsCollection.insertOne(req.body)
      .then(result => {
          console.log(result);
      })
  })

    //   read data from database
    app.get("/products", (req, res) =>{
        gadgetsCollection.find()
        .toArray((err, document) =>{
            res.send(document)
        })
    })

    // read data by name
    app.get("/product/:name", (req, res) =>{
        gadgetsCollection.find({name:req.params.name})
        .toArray((err, document) =>{
            res.send(document)
        })
    })
});

app.get("/", (req, res) =>{
    res.send("hellowwoo")
})

app.listen(port)