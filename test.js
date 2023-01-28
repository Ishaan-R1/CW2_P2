//Import the express and url modules
const express = require("express");
const url = require("url");

//Status codes defined in external file
require("./http_status.js");
const db = require("./database.js");

//The express module is a function. When it is executed it returns an app object
const app = express();

//Set up express to serve static files from the directory called 'public'
app.use(express.static("public"));

//GET request for in otder to recieve all products
app.get("/products", async (request, response) => {
  //Get number of items and offset for pagination
  let [numItems, offset] = getNumItemsOffset(request.url);

  //Get the total number of products for pagination
  let prodCount = await db.getProductCount();

  //Get the all of the products
  let products = await db.getProducts(numItems, offset);

  //Put into an object and send back to client
  let returnObj = {
    count: prodCount,
    data: products,
  };
  response.json(returnObj);
});
// Set up path for web service to search for specific products
app.get("/search", async (request, response) => {
  // Get number of items and offset for pagination
  let [numItems, offset] = getNumItemsOffset(request.url);
  // Get model of phone
  let [model] = getModel(request.url);

  //Get the total number of products
  let prodCount = await db.getProductCount();

  //Get the products based on search of model name and number of items and offset provided
  let products = await db.getSearch(model, numItems, offset);

  //Put into an object and send back to client
  let returnObj = {
    count: prodCount,
    data: products,
  };
  response.json(returnObj);
});

//GET search request based on specific product
app.get("/search/*", (request, response) => {
  //Get number of items and offset
  let [numItems, offset] = getNumItemsOffset(request.url);
  // Get model of phone
  let [model] = getModel(request.url);

  //Get the end of the path
  const pathEnd = getPathEnd(request.url);
  console.log("SEARCH: " + pathEnd);

  //Run search of model and send results
  db.getSearch(model, numItems, offset)
    .then((searchResults) => {
      response.json(searchResults);
    })
    .catch((error) => console.log(error.message));
});

//GET request for product by specific ID
//Check if the path end contains an integer, if so then it is a valid ID of a product
app.get("/products/*", (request, response) => {
  //Get end string of path
  const pathEnd = getPathEnd(request.url);

  //Check to see if string contains only numbers using RegEx
  let regEx = new RegExp("^[0-9]+$"); 
  if (regEx.test(pathEnd)) {
    //Run search of model over all products based on ID provided and send results
    db.getProduct(pathEnd)
      .then((product) => {
        response.json(product);
      })
      .catch((error) => console.log(error.message));
    // Check if url is products/search
  } else if (pathEnd === "search") {
    //Get number of items and offset
    let [numItems, offset] = getNumItemsOffset(request.url);
  // Get model of phone
    let [model] = getModel(request.url);

    const pathEnd = getPathEnd(request.url);

    // Run search of model over all products based on search provided and send results
    db.getSearch(model, numItems, offset)
      .then((searchResults) => {
        response.json(searchResults);
      })
      .catch((error) => console.log(error.message));
  } else {
    // If path end is not a number or the string 'search' then it is not valid
    response.status(HTTP_STATUS.NOT_FOUND);
    response.send("{ERROR: Product ID: '"+ getPathEnd(request.url) + "', from URL: '"+ request.url +"' is not valid}");

  }
});
//Set up path to get comparison details for web service
app.get("/comparison", async (request, response) => {
  //Get number of items and offset
  let [numItems, offset] = getNumItemsOffset(request.url);

  //Retrieve total number of products
  let prodCount = await db.getProductCount();

  //Get the comparison details of all products
  let products = await db.getComparisons(numItems, offset);

  //Put into an object and send back to client
  let returnObj = {
    count: prodCount,
    data: products,
  };
  response.json(returnObj);
});
//Set up path to get comparison details of singular product for web service
app.get("/comparison/*", (request, response) => {
    //Get end string of path
  const pathEnd = getPathEnd(request.url);

  //Check to see if string contains only numbers using RegEx
  let regEx = new RegExp("^[0-9]+$");
  if (regEx.test(pathEnd)) {
    //Run search of model over all products based on ID provided and send comparison results
    db.getComparison(pathEnd)
      .then((product) => {
        response.json(product);
      })
      .catch((error) => console.log(error.message));
  } else {
    response.status(HTTP_STATUS.NOT_FOUND);
    response.send("{ERROR: Comparison ID: '"+ getPathEnd(request.url) + "', from URL: '"+ request.url +"' is not valid}");
  }
});
//Set up path to get multiple comparison details based on matches for web service
app.get("/comparisonSearch", async (request, response) => {
  // Get number of items and offset
  let [numItems, offset] = getNumItemsOffset(request.url);
  // Get model of phone
  let [model] = getModel(request.url);

  //Retrieve total number of products
  let prodCount = await db.getProductCount();

  //Retrieve all of the products matching the search to compare all relevant products
  let products = await db.getComparisonSearch(model, numItems, offset);

  //Combine into a single object and send back to client
  let returnObj = {
    count: prodCount,
    data: products,
  };
  response.json(returnObj);
});
//Start the app listening on port 8080
app.listen(8080);
console.log("Server listening on port 8080");

//Function to return the number of items and the offset
function getNumItemsOffset(urlStr) {
  //Parse the provided URL
  let urlObj = url.parse(urlStr, true);

  //Get object holding queries from object if URL
  let queries = urlObj.query;

  //Enable pagination properties to be defined based on user preference if queries contain a number
  let numItems = queries["num_items"];
  let offset = queries["offset"];

  //Return numItems and offset
  return [numItems, offset];
}
//Function to return the model of a phone
function getModel(urlStr) {
  //Parse the provided URL
  let urlObj = url.parse(urlStr, true);

  //Get object holding queries from object if URL
  let queries = urlObj.query;

  //Enable pagination properties to be defined based on user preference if queries contain a number
  let model = queries["model"];

  //Return model
  return [model];
}

//Function to return the last string of the path
function getPathEnd(urlStr) {
  //Parse the URL
  let urlObj = url.parse(urlStr, true);

  //Split the path by '/'
  let pathArray = urlObj.pathname.split("/");

  //Return the final element in array after the character provided
  return pathArray[pathArray.length - 1];
}

//Export server for testing
module.exports = app;
