const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  // Check if the username already exists
  const userExists = users.some((users) => users.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }
  // Register the new user
  users.push({ username, password });
  return res
    .status(201)
    .json({ message: "User successfully registered. Now you can log in." });
});

// Get the book list available in the shop with DIRECT ACCESS to the server
/*public_users.get("/", (req, res) => {
  // Convert books array to a formatted JSON string with indentation
  const formattedBooks = JSON.stringify(books, null, 4); // 4 spaces for indentation
  res.send(formattedBooks);
});*/

// Get the book list available in the shop with async function. Mainly used for external APIs
public_users.get("/books-async", async (req, res) => {
  try {
    // Simulate async operation, here you just return the books directly
    const getBooks = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (books) {
            resolve(books); // Resolve with the books data
          } else {
            reject("No books found"); // Reject if something goes wrong
          }
        }, 100); // Simulated delay of 100ms
      });
    };

    // Wait for the promise to resolve
    const booksData = await getBooks();
    res.json(booksData); // Send the books data as the response
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving book list", error: error.message });
  }
});

/*
// Get book details based on ISBN with DIRECT ACCESS 
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
});*/

public_users.get("/isbn-async/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const getBooksByIsbn = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const book = books.find((books) => books.isbn === isbn);
          if (book) {
            resolve(book);
          } else {
            reject("No book found with the given ISBN");
          }
        }, 100);
      });
    };
    const booksData = await getBooksByIsbn();
    res.json(booksData);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});
/*
// Get book details based on author based on DIREC access
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
});*/

//Get all books based on author with async access from third party API
public_users.get("/author-async/:author", async (req, res) => {
  const authorName = req.params.author.toLowerCase();
  try {
    const getBooksByAuthor = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const book = books.find(
            (books) => books.author.toLowerCase() === authorName
          );
          if (book) {
            resolve(book);
          } else {
            reject("No book found under this author's name");
          }
        }, 100);
      });
    };
    const booksData = await getBooksByAuthor();
    res.json(booksData);
  } catch (error) {
    res.status(500).json({ message: "Book was not found" });
  }
});
/*
// Get all books based on title with DIRECT CONNECTION
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
});*/

// get books by title with async promise for third party API
public_users.get("/title-async/:title", async (req, res) => {
  const bookTitle = req.params.title.toLowerCase();
  try {
    const getBooksByTitle = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const book = books.find(
            (book) => book.title.toLowerCase() === bookTitle
          );
          if (book) {
            resolve(book);
          } else {
            reject("No book found with this title");
          }
        }, 100);
      });
    };

    const booksData = await getBooksByTitle();
    res.json(booksData);
  } catch (error) {
    res.status(404).json({ message: error });
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
