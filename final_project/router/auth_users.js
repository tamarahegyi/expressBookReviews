const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  { username: "user3", password: "password3" },
  { username: "user4", password: "password4" },
  { username: "user5", password: "password5" },
];

const isValid = (username) => {
  //returns boolean
  return username.length >= 5 && password.length >= 5;
};

function authenticateUser(username, password) {
  return users.some(
    (user) => user.username === username && user.password === password
  );
}

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Authenticate user
  if (authenticateUser(username, password)) {
    // Generate a JWT token
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Store access token and username in session
    req.session.authorization = { accessToken, username };

    // Respond with a success message and the token
    return res
      .status(200)
      .json({ message: "User successfully logged in", token: accessToken, username: username });
  } else {
    // Respond with an error message if authentication fails
    return res
      .status(401)
      .json({ message: "Invalid login. Check username and password" });
  }
});

regd_users.get("/protected-route", (req, res) => {
  // This route is protected by the authentication middleware
  res.status(200).json({ message: "You have access to this route" });
});

regd_users.put("/auth/reviews/:isbn", (req, res) => {
  const loggedinUser = req.session.authorization.username;
  const isbn = req.params.isbn;
  const reviewText = req.body.reviews;  // Extract the review text from request body

  // Check if review text is provided
  if (!reviewText) {
      return res.status(400).json({ message: "Review text is required" });
  }

  // Find the book with the matching ISBN
  const book = books.find((book) => book.isbn === isbn);

  if (!book) {
      // If the book is not found, respond with a 404 Not Found status
      return res.status(404).json({ message: "Book not found" });
  }

  // If the book is found, add or modify the review
  if (book.reviews[loggedinUser]) {
      // User has already posted a review for this book, update the review
      book.reviews[loggedinUser] = reviewText;
      return res.status(200).json({ message: "Review updated successfully" });
  } else {
      // User has not posted a review for this book yet, add the review
      book.reviews[loggedinUser] = reviewText;
      return res.status(201).json({ message: "Review added successfully" });
  }
});

regd_users.delete("/auth/reviews/:isbn", (req, res) => {
  const loggedinUser = req.session.authorization.username;
  const isbn = req.params.isbn;
  const book = books.find((book)=> book.isbn === isbn)
  if(!book){
    return res.status(404).json({message: "No book found under this name"})
  }
  if(book.reviews[loggedinUser]){
    delete book.reviews[loggedinUser];
    return res.status(200).json({message: `you have successfully deleted your review for "${book.title}"`})
  }else{
    return res.status(400).json({message: `You haven't left a review for "${book.title}"`})
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
