var daoListing = require("../daos/listing.schema.js");

module.exports = {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getAllListings,
};

async function createListing(req, res, next) {
  try {
    const listing = await daoListing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
}

async function deleteListing(req, res, next) {
  const listing = await daoListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }

  console.log(req.user);

  if (!req.user.isAdmin && req.user.id !== listing.userRef) {
    return res
      .status(401)
      .json({ error: "Unauthorized to delete other's listing." });
  }

  try {
    await daoListing.findByIdAndDelete(req.params.id);
    return res.status(200).json("Listing has been deleted.");
  } catch (error) {
    next(error);
  }
}

async function updateListing(req, res, next) {
  const listing = await daoListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }

  if (req.user.id !== listing.userRef) {
    return res
      .status(401)
      .json({ error: "Unauthorized to update other's listing." });
  }

  try {
    const updatedListing = await daoListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
}

async function getListing(req, res, next) {
  try {
    const listing = await daoListing.findById(req.params.id);
    return res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
}

async function getAllListings(req, res, next) {
  try {
    // If offer is undefined or "false", listings with and without offers are returned.
    // If offer is "true", only listings with offers are returned.
    let offer = req.query.offer;
    offer =
      offer === undefined || offer === "false" ? { $in: [false, true] } : offer;

    // If furnished is undefined or "false", listings with and without furniture are returned.
    // If furnished is "true", only furnished listings are returned.
    let furnished = req.query.furnished;
    furnished =
      furnished === undefined || furnished === "false"
        ? { $in: [false, true] }
        : furnished;

    // If parking is undefined or "false", listings with and without parking are returned.
    // If parking is "true", only listings with parking are returned.
    let parking = req.query.parking;
    parking =
      parking === undefined || parking === "false"
        ? { $in: [false, true] }
        : parking;

    // If type is undefined or "both", both sale and rent listings are returned.
    // If type is "sale" or "rent", only sale or rent listings are returned.
    let type = req.query.type;
    type =
      type === undefined || type === "both" ? { $in: ["sale", "rent"] } : type;

    // If searchTerm is undefined, all listings are returned.
    // If searchTerm is defined, only listings with names that match the searchTerm are returned.
    const searchTerm = req.query.searchTerm || "";

    // regex is used to search for listings with names that contain the searchTerm.
    // $options: "i" is used to make the search case-insensitive.
    const listings = await daoListing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    });

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
}
