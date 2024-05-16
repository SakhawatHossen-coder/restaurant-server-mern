const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: ["https://wandering-fork.netlify.app", "http://localhost:5173"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  // CORS headers
  res.header(
    "Access-Control-Allow-Origin",
    "https://wandering-fork.netlify.app",
    // "http://localhost:5173"
  ); // restrict it to the required domain
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  // Set custom headers for CORS
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept,X-Custom-Header"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  return next();
});

const logger = async (req, res, next) => {
  console.log("log: info", req.method, req.url);
  next();
};
const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

// const corsOptions = {
//   origin: ["https://wandering-fork.netlify.app", "http://localhost:5173"],
//   credentials: true,
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
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
    //start
    const foodCollection = client.db("foodDB").collection("foods");
    const foodPurchase = client.db("foodDB").collection("foodPurchase");
    const feedbackCollection = client
      .db("foodDB")
      .collection("feedbackCollection");
    // const cookieOptions = {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    // };
    //jwt
    // app.post("/jwt",  async (req, res) => {
    //   let user = req.body;
    //   console.log("token for", user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "365d",
    //   });
    //   res
    //     .cookie("token", token, cookieOptions)
    //     // res
    //     //   .cookie("token", token, {
    //     //     httpOnly: true,
    //     //     secure: false,
    //     //     sameSite: "none",
    //     //   })
    //     .send({ success: true });
    // });
    // app.post("/logout", async (req, res) => {
    //   const user = req.body;
    //   console.log("logging out", user);
    //   res
    //     .clearCookie("token", { ...cookieOptions, maxAge: 0 })
    //     .send({ success: true });
    // });
    //

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
      const searchTerm = req.query.term || ""; // Get search term from query parameter
      const regex = new RegExp(searchTerm, "i");
      const filter = req.query;

      // let query = {
      //   foodname: { $regex: filter.searchTerm, $options: "i" },
      // };
      // if (filter) query.category = filter;
      let options = {};

      const cursor = foodCollection.find().sort({ purchaseCount: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/searchfood", async (req, res) => {
      const searchTerm = req.query.term || ""; // Get search term from query parameter
      const regex = new RegExp(searchTerm, "i");
      const search = req.query.search || "";
      const filter = req.query;
      // console.log(filter)
      let query = {
        foodname: { $regex: filter.searchTerm, $options: "i" },
      };
      // if (filter) query.category = filter;
      let options = {};
      // Case-insensitive search
      const cursor = foodCollection.find(query, options);
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
      // console.log(req.params.email);
      const result = await foodCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      // console.log(result);
      res.send(result);
    });
    app.post("/purchasefood", async (req, res) => {
      const newFood = req.body;
      const result = await foodPurchase.insertOne(newFood, {
        purchaseCount: 0,
      });
      res.send(result);
    });
    // app.post("/purchasefood", async (req, res) => {
    //   const newFood = req.body;
    //   const result = await foodPurchase.findOneAndUpdate(newFood, {
    //     $inc: { purchaseCount: 1 },
    //   });
    //   res.send(result);
    // });
    //  { $inc: { purchaseCount: 1 } }, // Increment purchaseCount by 1
    //   { new: true }

    app.get("/purchasefood/email/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await foodPurchase
        .find({
          buyeremail: req.params.email,
        })
        .toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/purchasefood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOneAndUpdate(query, {
        $inc: { purchaseCount: 1 },
      });
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
    app.delete("/purchasefood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodPurchase.deleteOne(query);
      res.send(result);
    });
    app.delete("/addfood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });
    // comment
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Food server is running");
});

app.listen(port, () => {
  console.log("food server runnning ---");
});
