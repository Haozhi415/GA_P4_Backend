var express = require("express");
var router = express.Router();
var listingController = require("../controllers/listing.controller.js");
var { verifyToken } = require("../utils/verifyUser.js");

// starts with /listing.

router.post("/create", verifyToken, listingController.createListing);

router.delete("/delete/:id", verifyToken, listingController.deleteListing);

router.post("/update/:id", verifyToken, listingController.updateListing);

router.get("/get/:id", listingController.getListing);

router.get("/getAll", listingController.getAllListings);

module.exports = router;
