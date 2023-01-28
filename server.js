var express = require("express"); // Requires the Express module
var path = require("path"); // Requires the Express module
var morgan = require("morgan");
const cors = require("cors");
const { nextTick } = require("process");

let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);
let dbPprefix = properties.get("db.prefix");
//URL-Encoding of User and PWD
//for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");
const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);

// Calls the express function to start a new Express application
var app = express();
app.use(morgan("short"));

app.set("json spaces", 3);

app.use(cors());

app.use(express.json());

app.param("collectionName", function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next();
});
app.use(function (request, response, next) {
  // middleware
  console.log(
    "recieved request with HTTP method " +
      request.method +
      " and url: " +
      request.url
  );

  next();
});

// http://localhost:3000/collections/lessons
// Get all lessons
app.get("/collections/:collectionName", function (req, res, next) {
  req.collection.find({}).toArray(function (err, results) {
    if (err) {
      return next(err);
    }
    res.send(results);
  });
});
// Send new order to DB
app.post("/collections/:collectionName", function (req, res, next) {
  req.collection.insertOne(req.body, function (err, results) {
    if (err) {
      return next(err);
    }
    res.send(results);
  });
});
// Update spaces in lesson collection 
app.put("/collections/:collectionName/:id", function (req, res, next) {
  // TODO: Validate req.body
  req.collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    function (err, result) {
      if (err) {
        return next(err);
      } else {
        res.send(
          result.matchedCount === 1 ? { msg: "success" } : { msg: "error" }
        );
      }
    }
  );
});
//======================================================================================================
// Search Functionality - Get route to retrieve user input and return search result from DB
app.get("/search/:collectionName/:subject", function (req, res, next) {
  let query = { subject: { $regex: req.params.subject } };
  console.log(typeof req.params.subject);
  req.collection.find(query).toArray(function (err, results) {
    if (err) {
      return next(err);
    }
    // COULD WORK BUT NEED TO FETCH INSTANLY - NOT ON BUTTON CLICK
    // res.send(results.filter((matches) => {
    //   return (
    //     matches.subject.includes(query)
    //   );
    // }));
    console.log("===================================");
    res.send(results);
    console.log(typeof results);

    console.log("===================================");
  });
});

//======================================================================================================
app.use(function (req, res, next) {
  console.log("Incoming request: " + req.url);
  next();
});
// Middleware to outpur all requests to console
app.use(function (request, response, next) {
  console.log(
    "recieved request with HTTP method " +
      request.method +
      " and url: " +
      request.url
  );

  next();
});
// Static file middleware to return lesson images
var imagesPath = path.join(__dirname, "images");
app.use("/images", express.static(imagesPath));
// GET route to display message if user accesses server without specifying path
app.get("/", function (req, res, next) {
  res.send("Welcome to After School Web Page");
});
// Error message if image file does not exist
app.use(function (request, response) {
  response.status(404);
  response.send("Image File Does Not Exist");
});

// app.listen(3000, function () {
//   console.log("App started on port 3000");
// });
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("App started on port: "+port);
});
