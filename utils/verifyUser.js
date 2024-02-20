var jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if(!token) {
        const error = new Error('Unauthorized.');
        error.statusCode = 401;
        throw error;
    };

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {

        if(error) {
            error.statusCode = 403;
            error.message = 'Forbidden';
            throw error;
        };

        // save the user to the request object and then proceed next to updateUser.
        req.user = user;
        next(); 
    });

};

module.exports = {
    verifyToken,
};