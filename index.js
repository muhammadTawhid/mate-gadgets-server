const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require('mongodb');
var admin = require("firebase-admin");
const { getAuth } = require('firebase-admin/auth');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const port = process.env.PORT || 5000;

var serviceAccount = require("./config/mate-gadgets-firebase-adminsdk-eklnu-5b2c9f0c59.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const uri = `mongodb+srv://${dbUser}:${dbPassword}@mate-gadgets.wtxhn.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const gadgetsCollection = client.db(dbUser).collection("gadgets");
    const ordersCollection = client.db(dbUser).collection("orders");
    //   create data to database
    app.post("/addProduct", (req, res) => {
        gadgetsCollection.insertOne(req.body)
            .then(result => {
                res.send(result);
            })
    })

    //   read data from database
    app.get("/products", (req, res) => {
        gadgetsCollection.find()
            .toArray((err, document) => {
                console.log(document)
                res.send(document)
            })
    })

    // read data by name
    app.get("/product/:name", (req, res) => {
        gadgetsCollection.find({ name: req.params.name })
            .toArray((err, document) => {
                res.send(document)
            })
    })
    // read data by id
    app.get("/productById/:id", (req, res) => {
        gadgetsCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, document) => {
                res.send(document[0])
            })
    })

    // update data to database
    app.patch("/editProduct/:id", (req, res) => {
        const name = req.body.name;
        const price = req.body.price;
        const category = req.body.category;
        const img = req.body.img;
        gadgetsCollection.findOneAndUpdate(
            { _id: ObjectId(req.params.id) },
            { $set: { name: name, price: price, category: category, img: img } },
            { returnDocument: true }
        )
            .then((result) => res.send(result))
    })

    // delete data from database
    app.delete("/delete/:id", (req, res) => {
        gadgetsCollection.findOneAndDelete({ _id: ObjectId(req.params.id) })
            .then((err, doc) => console.log(err, doc))
    })

    // proceed order
    app.post("/addOrders", (req, res) => {
        ordersCollection.insertOne(req.body)
            .then(result => {
                res.send(result)
            })
    })

    // get orders
    app.get("/orders", (req, res) => {
        const email = req.query.email
        const idToken = req.headers.authorization

        if (idToken) {
            getAuth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const decodedEmail = decodedToken.email;
                    if (decodedEmail === email) {
                        ordersCollection.find({ userEmail: email })
                            .toArray((err, doc) => {
                                res.send(doc)
                            })
                    }
                })
                .catch((error) => {
                    // Handle err
                });
        }

    })

    // remove order
    app.delete("/order/:orderId", (req, res) => {
        ordersCollection.findOneAndDelete({ _id: ObjectId(req.params.orderId) })
            .then((err, doc) => console.log(err, doc))
    })
});

app.get("/", (req, res) => {
    res.send("hello mate gadgets")
})

app.listen(port)