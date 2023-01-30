// Requires the relevant modules
var express = require("express"); 
var path = require("path"); 
var morgan = require("morgan");
const cors = require("cors");
const { nextTick } = require("process");

let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);
let dbPprefix = properties.get("db.prefix");
//URL-Encoding of user and password from db.properties file
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");
const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;
// Require MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);

// Call express function to start application
var app = express();
app.use(morgan("short"));
// Neatly format JSON
app.set("json spaces", 3);
app.use(cors());
app.use(express.json());

// Get name of collection once provided - either lessons or orders
app.param("collectionName", function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next();
});

// Get all lessons - collectionName specficed in fetch in app.js
app.get("/collections/:collectionName", function (req, res, next) {
  // Get all the results from the specified collection
  req.collection.find({}).toArray(function (err, lessonResults) {
    if (err) {
      return next(err);
    }
    // Display results
    res.send(lessonResults);
  });
});
// Send new order to DB
app.post("/collections/:collectionName", function (req, res, next) {
  // Insert new document in specified collection and then get results
  req.collection.insertOne(req.body, function (err, orderResults) {
    if (err) {
      return next(err);
    }
    // Display results
    res.send(orderResults);
  });
});
// Update spaces in lesson collection 
app.put("/collections/:collectionName/:id", function (req, res, next) {
  // Update element based on provided ID
  req.collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    function (err, result) {
      if (err) {
        return next(err);
      } else {
        // Make sure there is only one match to be successful
        res.send(
          result.matchedCount === 1 ? { msg: "success" } : { msg: "error" }
        );
      }
    }
  );
});
// Search Functionality - Get route to retrieve user input and return search result from DB
app.get("/search/:collectionName/:subject", function (req, res, next) {
  // Create query to check subject mathces a subject stored in lesson collection
  let query = { subject: { $regex: req.params.subject } };
  console.log(typeof req.params.subject);
  // Get all the matching results from the specified collection
  req.collection.find(query).toArray(function (err, results) {
    if (err) {
      return next(err);
    }
    console.log("===================================");
    // Return the search results
    res.send(results);
    console.log(results);
    console.log("===================================");
  });
});

// Middleware to output requests to server 
app.use(function (request, response, next) {
  console.log(
    "Request recieved using " + request.method + " request" +
      " with URL: " + request.url
  );
  next();
});
// Static file middleware to return lesson images
var imagesPath = path.join(__dirname, "images");
app.use("/images", express.static(imagesPath));

// Error message if image file does not exist
app.use(function (request, response) {
  response.status(404);
  response.send("Image File Does Not Exist");
});

// GET route to display message if user accesses server without specifying path
app.get("/", function (req, res, next) {
  res.send("Welcome to After School Web Page");
});

// Allow AWS to choose port or choose port 3000
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("App started on port: " + port);
});
