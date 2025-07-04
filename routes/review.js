const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateReview } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//Reviews
//Post Route
router.post(
  "/",
  validateReview,
  isLoggedIn,
  wrapAsync(reviewController.createReview)
);

//Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isOwner,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
