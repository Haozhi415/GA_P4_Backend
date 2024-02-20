var bcryptjs = require("bcryptjs");
var daoUser = require("../daos/user.schema.js");
var daoListing = require("../daos/listing.schema.js");

module.exports = {
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
};

async function updateUser(req, res, next) {
  if (req.user.id !== req.params.id) {
    const error = new Error("You can only update your own account.");
    error.statusCode = 401;
    throw error;
  }

  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await daoUser.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  if (req.user.id !== req.params.id) {
    const error = new Error("You can only delete your own account.");
    error.statusCode = 401;
    throw error;
  }

  try {
    await daoUser.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted.");
  } catch (error) {
    next(error);
  }
}

async function getUserListings(req, res, next) {
  if (req.user.id === req.params.id) {
    try {
      const listings = await daoListing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  }
}

async function getUser(req, res, next) {
  try {
    const user = await daoUser.findById(req.params.id);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const { password, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
}
