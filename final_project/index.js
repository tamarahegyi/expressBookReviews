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

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the session contains authorization information
    if (req.session.authorization) {
        const token = req.session.authorization.accessToken;

        // Verify the JWT token
        jwt.verify(token, 'access', (err, user) => {
            if (err) {
                // If there's an error verifying the token, respond with a 403 Forbidden status
                return res.status(403).json({ message: "Invalid or expired token" });
            }

            // Attach the user object to the request for use in the next middleware or route
            req.user = user;

            // Proceed to the next middleware or route handler
            next();
        });
    } else {
        // If there's no authorization information in the session, respond with a 403 Forbidden status
        return res.status(403).json({ message: "User not authenticated" });
    }
});
	
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));


