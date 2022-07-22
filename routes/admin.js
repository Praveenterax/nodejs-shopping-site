const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProductPage);

router.get("/products", isAuth, adminController.getAdminProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("imageUrl").isURL(),
    body("description").isString().isLength({ min: 5 }).trim(),
  ],
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  isAuth,
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("imageUrl").isURL(),
    body("description").isString().isLength({ min: 5 }).trim(),
  ],
  adminController.updateEditedProduct
);

router.post("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
