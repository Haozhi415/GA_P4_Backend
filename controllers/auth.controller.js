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
    const validUser = await daoUser.findOne({ email });
    if (!validUser) {
      throw new Error("Invalid email or password");
    }

    if (!password) {
      throw new Error("Password is required");
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      throw new Error("Invalid email or password");
    }

    // create a token and send it in a cookie to the client
    // the token contains the user id and isAdmin status
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
      .cookie("access_token", token, { httpOnly: false, SameSite: "None" })
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
