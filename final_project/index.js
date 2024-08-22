const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

/*app.use("/customer/auth/customer", function auth(req, res, next) {
  //Write the authenication mechanism here
});*/
	app.use("/customer/auth/customer", function auth(req, res, next) {
	    // Check if user is logged in and has valid access token
	    if (req.session.authorization) {
	        let token = req.session.authorization['accessToken'];
	
	        // Verify JWT token
	        jwt.verify(token, "access", (err, user) => {
	            if (!err) {
	                req.user = user;
	                next(); // Proceed to the next middleware
	            } else {
	                return res.status(403).json({ message: "User not authenticated" });
	            }
	        });
	    } else {
	        return res.status(403).json({ message: "User not logged in" });
	    }
	});
	
	// Login endpoint
	app.post("/login", (req, res) => {
	    const username = req.body.username;
	    const password = req.body.password;
	
	    // Check if username or password is missing
	    if (!username || !password) {
	        return res.status(404).json({ message: "Error logging in" });
	    }
	
	    // Authenticate user
	    if (authenticatedUser(username, password)) {
	        // Generate JWT access token
	        let accessToken = jwt.sign({
	            data: password
	        }, 'access', { expiresIn: '1h' });
	
	        // Store access token and username in session
	        req.session.authorization = {
	            accessToken, username
	        }
	        return res.status(200).send("User successfully logged in");
	    } else {
	        return res.status(401).json({ message: "Invalid Login. Check username and password" });
	    }
	});
    

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

function authenticatedUser(username, password) {
    // Replace this with actual authentication logic
    return username === 'user2' && password === 'password2';
}
