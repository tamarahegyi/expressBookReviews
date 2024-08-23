const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  // Check if both username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }
  // Check if the username already exists
  const userExists = users.some(users => users.username === username);
  if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
  }
  // Register the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can log in." });
});

// Get the book list available in the shop
public_users.get("/", (req, res) => {
  // Convert books array to a formatted JSON string with indentation
  const formattedBooks = JSON.stringify(books, null, 4); // 4 spaces for indentation
  res.send(formattedBooks);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Find the book with the given ISBN
  const filteredBooks = books.filter((number) => number.isbn === isbn);

  if (filteredBooks.length > 0) {
    // Book found, send book details as JSON
    res.json(filteredBooks[0]);
  } else {
    // Book not found, send an error message
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", (req, res) => {
  const authorName = req.params.author.toLowerCase(); // Convert to lowercase for case-insensitive matching
  const matchingBooks = books.filter(
    (books) => books.author.toLowerCase() === authorName
  );

  if (matchingBooks.length > 0) {
    res.json(JSON.stringify(matchingBooks, null, 4));
  } else {
    res.status(404).json({ message: "No book found by this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const bookTitle = req.params.title.toLowerCase();
  const matchingTitles = books.filter(
    (books) => books.title.toLowerCase() === bookTitle
  );

  if (matchingTitles.length > 0) {
    res.json(JSON.stringify(matchingTitles, null, 4));
  } else {
    res.status(404).json({ message: "No book found with this title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Get the ISBN from the URL parameters
  const book = books.find((books) => books.isbn === isbn); // Find the book with the matching ISBN

  if (book) {
    // Check if the book exists
    res.json(book.reviews); // Send the reviews for the book
  } else {
    res.status(404).json({ message: "No book found with the given ISBN" }); // Respond if the book is not found
  }
});

module.exports.general = public_users;
