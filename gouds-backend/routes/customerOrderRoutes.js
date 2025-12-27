const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrderById,
  getOrderCustomer,
  createPaymentIntent,
  addRazorpayOrder,
  createOrderByRazorPay,
  sendEmailInvoiceToCustomer,
} = require("../controller/customerOrderController");

const { isAuth, optionalAuth } = require("../config/auth");
const { emailVerificationLimit } = require("../lib/email-sender/sender");

// Routes that work with both authenticated and guest users
//add a order (supports guest orders) -
router.post("/add", optionalAuth, addOrder);

// create stripe payment intent (no auth needed)
router.post("/create-payment-intent", createPaymentIntent);

//add razorpay order (supports guest orders) -
router.post("/add/razorpay", optionalAuth, addRazorpayOrder);

//add a order by razorpay (no auth needed)
router.post("/create/razorpay", createOrderByRazorPay);

//get a order by id (supports guest orders)
router.get("/:id", optionalAuth, getOrderById);

// Routes that require authentication
//get all order by a user (requires auth)
router.get("/", isAuth, getOrderCustomer);

// Email invoice route (no auth needed as it uses order data)
router.post(
  "/customer/invoice",
  // emailVerificationLimit,
  sendEmailInvoiceToCustomer
);

module.exports = router;