let app = new Vue({
  el: "#App",
  data: {
    showProduct: true,
    path: "https://cdn-icons-png.flaticon.com/512/221/221945.png",
    text: "Maths Icon",
    // Display data of 1 subject
    subject: {
      subject: "Math",
      location: "London",
      price: 100,
      spaces: 5,
      image_path: "https://cdn-icons-png.flaticon.com/512/221/221945.png",
      image_text: "Maths Icon",
    },
    // Call array of objects from lessons.js file into 'subjects' object
    subjects: [],
    orderID: [],
    search: [],
    // Object to hold data of user inputted order details
    order: {
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
    },
    radioBtn: {
      option: "",
    },
    // Object to hold data of message when order is successful
    orderMsg: {
      msg: "Thank for your order. Your order has been placed.",
    },
    // Object to keep track of what user inputs in the search bar
    searchBar: {
      input: "",
      input2: "",
    },
    // Object to hold data to see if user selects radio button that matches this value
    //  to check they have selected the acend or decend button
    sortOrder: {
      order: "ascend",
    },
    // Empty cart array to push data to once user selects button
    cart: [],
  },
  created: function () {
    let subject = this.searchBar.input2;
    fetch("http://localhost:3000/search/lessons/" + "Math").then(function (
      response
    ) {
      response.json().then(function (json) {
        console.log(json);
        app.subjects = json;

        // const result = app.subjects.filter(match => match.subject.includes("a"));
        
        // for (let i = 0; i < app.subjects.length; i++) {
        //   const t = app.subjects[i].subject;
        // console.log(t);
        // }
        // console.log("****8888*****");
        // console.log(result[0].subject);
        // console.log("****88888*****");

      });
    });
    // Fetch to retrieve lessons with GET
    fetch("http://afterschoolapp2-env.eba-wwaj2wgs.eu-west-2.elasticbeanstalk.com/collections/lessons").then(function (
      response
    ) {
      response.json().then(function (json) {
        console.log(json);
        app.subjects = json;
      });
    });

    // ABOVE COMMENTED CODE IS CORRECT VERSION - BELOW IS TEST
    //   fetch("http://localhost:3000/search/lessons").then(function (
    //   response
    // ) {
    //   response.json().then(function (json) {
    //     console.log(json);
    //     app.subjects = json;
    //   });
    // });
  },
  // TRY PUT IN COMPUTED
  methods: {
    // Fetch to send search request of subject name to backend
    testSearch() {
      let subject = this.searchBar.input2;
      fetch("http://localhost:3000/search/lessons/" + subject).then(function (
        response
      ) {
        response.json().then(function (json) {
          console.log(json);
          app.subjects = json;
        });
      });
    },
    getLessonID(id) {
      this.orderID.push(id);
    },
    postOrder(firstName, phone_number, id) {
      const order = {
        name: firstName,
        phone_number: phone_number,
        lesson_id: this.orderID.toString(),
        spaces: this.cart.length,
      };
      // Fetch to save new order with POST when submitted
      fetch("http://localhost:3000/collections/orders", {
        method: "POST",
        body: JSON.stringify(order),
        headers: {
          "Content-type": "application/json",
        },
      })
        // Converting to JSON
        .then((response) => response.json())

        // Displaying results to console
        .then((json) => console.log(json));
    },
    // Fetch to update lesson spaces with PUT
    updateSpaces(spaceNum, id) {
      fetch("http://localhost:3000/collections/lessons/" + id, {
        // Adding method type
        method: "PUT",

        // Adding body or contents to send
        body: JSON.stringify({
          spaces: spaceNum,
        }),

        // Adding headers to the request
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        // Converting to JSON
        .then((response) => response.json())

        // Displaying results to console
        .then((json) => console.log(json));
    },
    // Method to decrease number of spaces once user clicks 'Add to Cart' button
    decrementSpaces() {
      if (this.spaces > 0) {
        this.spaces--;
      }
    },
    // Method to add an item to cart array once user clicks 'Add to Cart' button
    addToCart: function (product) {
      this.cart.push(product); // push the relevant subject to store in the cart array
      console.log(this.cart);
      console.log("Added to Arr " + this.cart.length);
    },
    // Method to remove an item from cart array once user clicks 'Remove' button
    removeLesson(product, i) {
      this.cart.splice(this.cart.indexOf(product), 1); // remove specific item in cart array
      console.log(this.cart.indexOf(product));
    },
    addBackRemovedLesson(sub) {
      sub.spaces++; // Display new current spaces number to user
    },
    // Method to check which page to display
    displayCheckout() {
      if (this.showProduct) {
        this.showProduct = false;
      } else {
        this.showProduct = true;
      }
    },
    // Method to decrease number of spaces once user clicks 'Add to Cart' button
    btn(sub) {
      if (sub.spaces > 0) {
        sub.spaces--;
      }
      console.log(sub.spaces);
    },
    // Method to check if there are any more spaces left
    noMoreSpaces: function (sub) {
      console.log(sub.spaces);
      console.log(sub.spaces == 5);
      // check and return if spaces is more than 0, otherwise button will be disabled
      return sub.spaces > 0;
    },
    // Method to create confirmation button
    checkoutBtn: function () {
      let para = document.createElement("p"); // Createe p tag in index.html
      para.innerText = this.orderMsg.msg; // add order message in this paragraph and append to id
      document.getElementById("confirmCheckout").appendChild(para);
    },
    // Method to sort subjects in ascended order
    sort: function (option) {
      // create function to compare each element
      function compare(a, b) {
        if (a[option] > b[option]) return 1;
        if (a[option] < b[option]) return -1;
        return 0;
      }
      this.subjects.sort(compare); // sort all the already compared elements
    },
    // Method to sort subjects in descended order
    sort2: function (option) {
      // create function to compare each element
      function compare(a, b) {
        if (a[option] > b[option]) return -1;
        if (a[option] < b[option]) return 1;
        return 0;
      }
      // sort all the already compared elements
      this.subjects.sort(compare);
    },
    ascend: function () {
      this.sortOrder.order = "ascend";
      console.log(this.sortOrder.order);
    },
    descend: function () {
      this.sortOrder.order = "descend";
      console.log(this.sortOrder.order);
    },
  },
  computed: {
    // tester: function () {
    //   fetch("http://localhost:3000/collections/lessons").then(function (
    //     response
    //   ) {
    //     response.json().then(function (json) {
    //       console.log(json);
    //       return app.subjects = json;
    //     });
    //   });
    //   return this.subjects;
    // },

    // Computed property to check how many items are added to cart array
    cartItemCount: function () {
      // Displays number of items in cart array or returns empty string if array is empty
      return this.cart.length || "";
    },
    // Computed property to check if any searches match the subjects title or location
    searchFunction: function () {
      // For loop to loop through all the subjects
      for (let j = 0; j < this.subjects.length; j++) {
        return this.subjects.filter((matches) => {
          return (
            // and check if the users input matches the subjects stored in the object - then returns all the matches subjects
            matches.subject
              .toLowerCase()
              .includes(this.searchBar.input.toLowerCase()) ||
            matches.location
              .toLowerCase()
              .includes(this.searchBar.input.toLowerCase())
          );
        });
      }
    },
    // Computed property to check if checkout button can be enabled or not
    canViewCart: function () {
      return this.cartItemCount >= 1; // check if number of items in cart array is more than or equal to 1
    },

    // Computed property to check if checkout  button on checkout page can be enabled or not
    checkForm: function () {
      return (
        // Regular expressions to check if the first and last name contains only letters
        /^[a-zA-Z]+$/.test(this.order.firstName) &&
        /^[a-zA-Z]+$/.test(this.order.lastName) &&
        // Regular expressions to check if the phone number contains only numbers
        /^[0-9]+$/.test(this.order.phone) &&
        // Check if all fields are inputted
        this.order.firstName.length > 0 &&
        this.order.lastName.length > 0 &&
        this.order.address.length > 0 &&
        this.order.phone.length > 0
      );
    },
  },
});
