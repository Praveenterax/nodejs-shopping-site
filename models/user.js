const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiration: Date,

  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (productId) {
  const exisitngProductIndex = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === productId.toString()
  );

  let updatedCartItems = [...this.cart.items];

  if (exisitngProductIndex >= 0) {
    updatedCartItems[exisitngProductIndex].quantity += 1;
  } else {
    updatedCartItems.push({
      productId: productId,
      quantity: 1,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.productId.toString() !== prodId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const { ObjectId } = require("mongodb");

// const getDb = require("../util/database").getDb;

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }
//   save() {
//     const db = getDb();
//     return db
//       .collection("users")
//       .insertOne(this)
//       .then(() => {
//         console.log("user added successfully");
//       })
//       .catch((err) => console.log(err));
//   }

//   addToCart(productId) {
//     const exisitngProductIndex = this.cart.items.findIndex(
//       (cp) => cp.productId.toString() === productId.toString()
//     );

//     let updatedCartItems = [...this.cart.items];

//     if (exisitngProductIndex >= 0) {
//       updatedCartItems[exisitngProductIndex].quantity += 1;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(productId),
//         quantity: 1,
//       });
//     }
//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const prodIds = this.cart.items.map((item) => {
//       return item.productId;
//     });
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: { $in: prodIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(
//               (item) => item.productId.toString() === p._id.toString()
//             ).quantity,
//           };
//         });
//       })
//       .catch((err) => console.log(err));
//   }

//   deleteFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter((item) => {
//       return item.productId.toString() !== productId.toString();
//     });

//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   addOrder() {
//     const db = getDb();

//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: this._id,
//             username: this.username,
//             email: this.email,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       })
//       .catch((err) => console.log(err));
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray()
//       .catch((err) => console.log(err));
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new ObjectId(userId) })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = User;
