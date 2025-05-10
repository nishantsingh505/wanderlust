const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { uploadToCloudinary } = require("../cloudconfig");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("new.ejs");
};

module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  } else {
    res.render("show.ejs", { listing });
  }
};

module.exports.createListing = async (req, res) => {
  let { id } = req.params;
  try {
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "listings"
    );
    let url = result.secure_url;
    let filename = result.display_name;
    // console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "new listing created!");
    res.redirect("/listings");
  } catch (err) {
    req.flash("error", "image upload failed!");
    res.redirect(`/listings/${id}`);
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200");
    res.render("edit.ejs", { listing, originalImageUrl });
  }
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  // Update the listing data without modifying the image if no file is provided
  listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // If a file is uploaded, handle the image upload to Cloudinary
  if (req.file) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"]; // Adjust based on the formats you support
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      req.flash("error", "Invalid file type. Please upload a valid image.");
      return res.redirect(`/listings/${id}`);
    }

    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "listings"
      );

      if (result) {
        let url = result.secure_url;
        let filename = result.display_name;
        listing.image = { url, filename };
      } else {
        req.flash("error", "Image upload failed");
        return res.redirect(`/listings/${id}`);
      }
    } catch (error) {
      req.flash("error", "An error occurred during the image upload.");
      return res.redirect(`/listings/${id}`);
    }
  }

  await listing.save();
  req.flash("success", "Listing edited successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "listing deleted successfully!");
  res.redirect("/listings");
};
