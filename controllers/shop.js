const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
// const Cart = require("../models/cart");
const ITEMS_PER_PAGE = 3;

exports.getProductsPage = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/products-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        current: page,
        hasNextPage: page * ITEMS_PER_PAGE < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
  // Product.findById(productId)
  //   .then(([rows, fieldData]) => {
  //     res.render("shop/product-detail", {
  //       product: rows[0],
  //       pageTitle: rows[0].title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "SHOP",
        path: "/",
        current: page,
        hasNextPage: page * ITEMS_PER_PAGE < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      // console.log(products);
      return res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findById(prodId)
  //   .then((product) => {
  //     return req.user.addToCart(product);
  //   })
  req.user
    .addToCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let totalAmount = 0;
  let products;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      products.forEach((p) => {
        totalAmount += p.quantity * p.productId.price;
      });
      return res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalAmount: totalAmount,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.createOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      // console.log(user.cart.items);
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          productData: { ...i.productId._doc },
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "My Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("Order not found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceFile = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceFile);

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   } else {
      //     res.setHeader("Content-Type", "application/pdf");
      //     res.setHeader(
      //       "Content-Disposition",
      //       "attachment;filename=" + invoiceFile
      //     );
      //     res.send(data);
      //   }
      // });

      // const fileStream = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader(
      //   "Content-Disposition",
      //   "attachment;filename=" + invoiceFile
      // );
      // fileStream.pipe(res);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline;filename=" + invoiceFile);
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(24).text("Invoice", { align: "center", underline: true });
      pdfDoc
        .fontSize(14)
        .text("----------------------------------------------------------", {
          align: "center",
        });
      let totalPrice = 0;
      order.products.forEach((product) => {
        totalPrice += product.quantity * product.productData.price;
        pdfDoc.text(
          product.productData.title +
            "---" +
            product.quantity +
            " x " +
            "$" +
            product.productData.price
        );
      });
      pdfDoc.text("----------------------------------------------");
      pdfDoc.text("Total Price ---- $" + totalPrice);
      pdfDoc.end();
    })

    .catch((err) => next(err));
};
