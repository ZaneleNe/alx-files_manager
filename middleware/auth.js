// middleware/auth.js

import jwt from 'jsonwebtoken';

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    // Get token from the request headers
    const token = req.headers['x-token'];

    // If no token is provided, return unauthorized status
    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    // Verify the token using the secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // If the token is invalid, return forbidden status
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        // If the token is valid, attach the user information to the request
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};

export default authenticateToken;
