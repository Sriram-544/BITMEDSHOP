const AWS = require("aws-sdk");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const { v4: uuidv4 } = require("uuid");

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
});

const s3 = new AWS.S3();

// Helper function to upload image to S3
const uploadToS3 = async (image) => {
  const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `products/${uuidv4()}`, // Unique file name
    Body: buffer,
    ContentEncoding: "base64",
    ContentType: "image/jpeg", // Adjust if necessary
  };
  const upload = await s3.upload(params).promise();
  return { url: upload.Location, key: upload.Key };
};

// Helper function to delete image from S3
const deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  await s3.deleteObject(params).promise();
};

// CREATE PRODUCT (ADMIN)
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];
  for (let i = 0; i < images.length; i++) {
    const result = await uploadToS3(images[i]);
    imagesLinks.push({
      url: result.url,
      key: result.key,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// GET ALL PRODUCTS
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 4;
  const productsCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter();

  let products = await apiFeature.query;
  let filteredProductsCount = products.length;

  apiFeature.pagination(resultPerPage);
  products = await apiFeature.query;

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});

// GET ALL PRODUCTS (ADMIN)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// GET PRODUCT DETAILS
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  console.log(product)
  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// UPDATE PRODUCT (ADMIN)
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Delete old images from S3
    for (let i = 0; i < product.images.length; i++) {
      await deleteFromS3(product.images[i].key);
    }

    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await uploadToS3(images[i]);
      imagesLinks.push({
        url: result.url,
        key: result.key,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// DELETE PRODUCT
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // Delete images from S3
  for (let i = 0; i < product.images.length; i++) {
    await deleteFromS3(product.images[i].key);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// CREATE OR UPDATE REVIEW
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    urli: req.user.avatar.url,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// GET ALL REVIEWS OF A PRODUCT
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// DELETE REVIEW
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = reviews.length === 0 ? 0 : avg / reviews.length;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
