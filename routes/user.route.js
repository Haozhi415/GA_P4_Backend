var express = require("express");
var router = express.Router();
var userController = require("../controllers/user.controller.js");
var { verifyToken } = require("../utils/verifyUser.js");

router.post("/update/:id", verifyToken, userController.updateUser);

router.delete("/delete/:id", verifyToken, userController.deleteUser);

router.get("/listings/:id", verifyToken, userController.getUserListings);

router.get("/get/:id", userController.getUser);

module.exports = router;
