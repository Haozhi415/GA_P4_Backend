var daoUser = require("../daos/user.schema.js");
var bcryptjs = require("bcryptjs");
var jwt = require("jsonwebtoken");

module.exports = {
  signup,
  signin,
  signout,
};

async function signup(req, res, next) {
  const { username, email, password } = req.body;
  // hash the password before saving it to the database using bcryptjs and a salt of 10
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new daoUser({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
}

async function signin(req, res, next) {
  const { email, password } = req.body;
  try {
    // Defined validUser as the result of the findOne method of the user schema.
    const validUser = await daoUser.findOne({ email });
    if (!validUser) {
      throw new Error("Invalid email or password");
    }

    // If the email is found, but the password is not provided, it throws an error with a message of
    // "Password is required".
    if (!password) {
      throw new Error("Password is required");
    }

    // If a user with the provided email is found, it compares the provided password with the hashed password
    // stored in the user record using bcryptjs library's compareSync method.
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      throw new Error("Invalid email or password");
    }

    // If the password is correct, create a token using the jwt.sign method.
    // The token contains the user id and isAdmin status as the payload.
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    // validUser._doc contains the user details except the password
    // password is removed from the user details before sending it to the client
    const { password: pass, ...rest } = validUser._doc;

    // send the user details in "rest" and the token in access_token cookie to the client
    // the client can use the token to authenticate future requests
    // the client can use the user details to display user information
    res
      .header({
        "Access-Control-Allow-Origin": "https://ga-p4-frontend.onrender.com",
        "Access-Control-Allow-Credentials": "true",
      })
      .cookie("access_token", token, {
        // The cookie cannot be accessed through client-side JavaScript.
        // This is a security setting that can help to prevent cross-site scripting (XSS) attacks.
        httpOnly: true,
        // The browser will send the cookie with cross-site requests.
        // This is a security setting that can help to prevent cross-site request forgery (CSRF) attacks.
        sameSite: "None",
        // The cookie will only be sent over HTTPS.
        // This is a security setting that helps to ensure that the cookie data is encrypted during transmission.
        secure: true,
        // By default the access_token cookie will be included in ALL requests to the same domain that the
        // original request (the one that set the cookie) was made to, and for all paths on that domain which is
        // https://ga-p4-backend.onrender.com
      })

      // Sends the user details (excluding password) along with a status code of 200 (OK) in JSON format
      // to the client.
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
}

async function signout(req, res, next) {
  try {
    res.clearCookie("access_token");
    res.status(200).json("User has been signed out.");
  } catch (error) {
    next(error);
  }
}
