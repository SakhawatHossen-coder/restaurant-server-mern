const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174", ""],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_key}@cluster0.qkr0gnw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //     await client.connect();
    //start
    const foodCollection = client.db("foodDB").collection("foods");
    const foodPurchase = client.db("foodDB").collection("foodPurchase");
    const feedbackCollection = client
      .db("foodDB")
      .collection("feedbackCollection");

    app.post("/addfood", async (req, res) => {
      const newFood = req.body;
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });
    app.post("/addfeedback", async (req, res) => {
      const newFeedback = req.body;
      const result = await feedbackCollection.insertOne(newFeedback);
      res.send(result);
    });
    app.get("/addfeedback", async (req, res) => {
      const cursor = feedbackCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/addfood", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/addfood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });
    app.get("/addfood/email/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await foodCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      console.log(result);
      res.send(result);
    });
    app.post("/purchasefood", async (req, res) => {
      const newFood = req.body;
      const result = await foodPurchase.insertOne(newFood);
      res.send(result);
    });
    app.get("/purchasefood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });
    app.put("/addfood/:id", async (req, res) => {
      let id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      // const option = { upsert: true };
      const updateFood = req.body;
      const newFood = {
        $set: {
          foodimage: updateFood.foodimage,
          foodname: updateFood.foodname,
          foodcategory: updateFood.foodcategory,
          price: updateFood.price,
          description: updateFood.description,
          quantity: updateFood.quantity,
          country: updateFood.country,
        },
      };
      const result = await foodCollection.updateOne(filter, newFood);
      res.send(result);
    });
    app.delete("/addfood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });
    // comment
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Food server is running");
});

app.listen(port, () => {
  console.log("food server runnning ---");
});
