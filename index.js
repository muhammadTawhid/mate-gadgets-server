const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require('mongodb');
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
  const ordersCollection = client.db(dbUser).collection("orders");

    //   create data to database
  app.post("/addProduct", (req, res) =>{
      gadgetsCollection.insertOne(req.body)
      .then(result => {
          res.send(result);
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
        console.log(req.params.name)
        gadgetsCollection.find({name:req.params.name})
        .toArray((err, document) =>{
            res.send(document)
        })
    })
    // read data by id
    app.get("/productById/:id", (req, res) =>{
        console.log(req.params.id)
        gadgetsCollection.find({_id: ObjectId(req.params.id)})
        .toArray((err, document) =>{
            res.send(document[0])
        })
    })

    // update data to database
    app.patch("/editProduct/:id", (req, res) =>{
        const name = req.body.name;
        const price = req.body.price;
        const category = req.body.category;
        const img = req.body.img;
        gadgetsCollection.findOneAndUpdate(
            {_id: ObjectId(req.params.id)},
            {$set: {name: name, price: price, category: category, img: img} },
            {returnDocument: true}
        )
        .then((result) => res.send(result))
    })

    // delete data from database
    app.delete("/delete/:id", (req, res) =>{
        gadgetsCollection.findOneAndDelete({_id: ObjectId(req.params.id)})
        .then((err, doc) => console.log(err, doc))
    })

    // proceed order
    app.post("/addOrders", (req, res) =>{
        console.log(req.body)
        ordersCollection.insertOne(req.body)
        .then(result => {
            res.send(result)
        })
    })
});

app.get("/", (req, res) =>{
    res.send("hellowwoo")
})

app.listen(port)