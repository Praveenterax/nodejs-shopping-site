const { validationResult } = require("express-validator");
// const fileHelper = require("../util/file");

const Product = require("../models/product");

exports.getAddProductPage = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  // const image = req.file;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // console.log(imageUrl);
  // if (!image) {
  //   return res.status(422).render("admin/edit-product", {
  //     pageTitle: "Add Product",
  //     path: "/admin/add-product",
  //     editing: false,
  //     hasError: true,
  //     product: {
  //       title: title,
  //       price: price,
  //       description: description,
  //     },
  //     errorMessage: "Please select an image",
  //     validationErrors: errors.array(),
  //   });
  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        imageURL: imageUrl,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  // console.log(image);

  // const imageUrl = image.path;
  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId: req.session.user,
  });
  product
    .save()
    .then((result) => {
      // console.log("created a product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const editingMode = req.query.edit;
  if (!editingMode || editingMode === "false") {
    return res.redirect("/");
  }
  Product.findById(prodId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasError: false,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.updateEditedProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  // const updatedImage = req.file;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        imageUrl: updatedImageUrl,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      // if (updatedImage) {
      //   fileHelper.deleteFile(product.imageUrl);
      //   product.imageUrl = updatedImage.path;
      // }
      return product.save().then(() => {
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found"));
      }
      // fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      // console.log("Product Deleted");
      res.redirect("/admin/products");
      // res.status(200).json({ message: "Deleted successfully" });
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // next(error);
      res.status(500).json({ message: "Some error occured" });
    });
};

exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select("title price imageUrl")
    // .populate("userId", "username")
    .then((products) => {
      // console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
