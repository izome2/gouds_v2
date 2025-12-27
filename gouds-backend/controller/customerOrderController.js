require("dotenv").config();
const stripe = require("stripe");
const Razorpay = require("razorpay");
const MailChecker = require("mailchecker");

const mongoose = require("mongoose");

const Order = require("../models/Order");
const Setting = require("../models/Setting");
const { sendEmail } = require("../lib/email-sender/sender");
const { formatAmountForStripe } = require("../lib/stripe/stripe");
const { handleCreateInvoice } = require("../lib/email-sender/create");
const { handleProductQuantity } = require("../lib/stock-controller/others");
const customerInvoiceEmailBody = require("../lib/email-sender/templates/order-to-customer");

const addOrder = async (req, res) => {
  console.log("addOrder - Request body:", JSON.stringify(req.body, null, 2));
  console.log("addOrder - User info:", req.user);

  try {
    // Check if user is authenticated
    const isGuest = !req.user || !req.user._id;
    console.log("Is guest order:", isGuest);

    // Prepare order data
    const orderData = {
      ...req.body,
      isGuestOrder: isGuest,
    };

    // Add user reference only if user is authenticated
    if (!isGuest && req.user && req.user._id) {
      orderData.user = req.user._id;
      console.log("Added user ID to order:", req.user._id);
    }

    // For guest orders, ensure we have guest information
    if (isGuest) {
      if (!req.body.guestInfo || !req.body.guestInfo.email) {
        console.log("Missing guest info for guest order");
        return res.status(400).send({
          message: "Guest information is required for guest orders",
        });
      }

      // Validate guest email
      if (!MailChecker.isValid(req.body.guestInfo.email)) {
        return res.status(400).send({
          message: "Invalid email address provided",
        });
      }

      console.log("Guest info validated:", req.body.guestInfo);
    }

    // Handle delivery schedule data
    if (req.body.deliverySchedule) {
      console.log("Processing delivery schedule:", req.body.deliverySchedule);

      // Validate delivery schedule
      const deliverySchedule = req.body.deliverySchedule;

      // If it's scheduled delivery, ensure we have a preferred date
      if (deliverySchedule.deliveryType === "scheduled") {
        if (!deliverySchedule.preferredDate) {
          return res.status(400).send({
            message: "Preferred date is required for scheduled delivery",
          });
        }

        // Convert to proper date format if it's a string
        if (typeof deliverySchedule.preferredDate === 'string') {
          deliverySchedule.preferredDate = new Date(deliverySchedule.preferredDate);
        }

        // Validate the date is in the future
        const now = new Date();
        const preferredDate = new Date(deliverySchedule.preferredDate);

        if (preferredDate <= now) {
          return res.status(400).send({
            message: "Preferred delivery date must be in the future",
          });
        }
      }

      // Ensure delivery schedule has default values
      orderData.deliverySchedule = {
        deliveryType: deliverySchedule.deliveryType || "standard",
        preferredTimeSlot: deliverySchedule.preferredTimeSlot || "anytime",
        deliveryNotes: deliverySchedule.deliveryNotes || "",
        ...(deliverySchedule.preferredDate && {
          preferredDate: deliverySchedule.preferredDate
        })
      };

      console.log("Final delivery schedule:", orderData.deliverySchedule);
    } else {
      // Set default delivery schedule if none provided
      orderData.deliverySchedule = {
        deliveryType: "standard",
        preferredTimeSlot: "anytime",
        deliveryNotes: ""
      };
      console.log("Set default delivery schedule");
    }

    // Generate invoice number if not provided
    if (!orderData.invoice) {
      const lastOrder = await Order.findOne().sort({ createdAt: -1 });
      const invoiceNumber = lastOrder ?
        parseInt(lastOrder.invoice) + 1 :
        100001;
      orderData.invoice = invoiceNumber.toString();
    }

    console.log("Creating order with data:", {
      isGuest,
      hasUser: !!orderData.user,
      hasGuestInfo: !!orderData.guestInfo,
      deliveryType: orderData.deliverySchedule?.deliveryType,
      invoice: orderData.invoice
    });

    const newOrder = new Order(orderData);
    const order = await newOrder.save();

    console.log("Order created successfully:", {
      id: order._id,
      invoice: order.invoice,
      isGuestOrder: order.isGuestOrder
    });

    res.status(201).send({
      success: true,
      message: isGuest ? "Guest order created successfully" : "Order created successfully",
      order: order
    });

    // Handle product quantity reduction
    handleProductQuantity(order.cart);

  } catch (err) {
    console.error("addOrder error:", err);
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

//create payment intent for stripe
const createPaymentIntent = async (req, res) => {
  const { total: amount, cardInfo: payment_intent, email } = req.body;

  // Validate the amount that was passed from the client.
  if (!(amount >= process.env.MIN_AMOUNT && amount <= process.env.MAX_AMOUNT)) {
    return res.status(500).json({ message: "Invalid amount." });
  }

  const storeSetting = await Setting.findOne({ name: "storeSetting" });
  const stripeSecret = storeSetting?.setting?.stripe_secret;
  const stripeInstance = stripe(stripeSecret);

  if (payment_intent.id) {
    try {
      const current_intent = await stripeInstance.paymentIntents.retrieve(
        payment_intent.id
      );
      // If PaymentIntent has been created, just update the amount.
      if (current_intent) {
        const updated_intent = await stripeInstance.paymentIntents.update(
          payment_intent.id,
          {
            amount: formatAmountForStripe(amount, "usd"),
          }
        );
        return res.send(updated_intent);
      }
    } catch (err) {
      if (err.code !== "resource_missing") {
        const errorMessage =
          err instanceof Error ? err.message : "Internal server error";
        return res.status(500).send({ message: errorMessage });
      }
    }
  }

  try {
    // Create PaymentIntent from body params.
    const params = {
      amount: formatAmountForStripe(amount, "usd"),
      currency: "usd",
      description: process.env.STRIPE_PAYMENT_DESCRIPTION || "",
      automatic_payment_methods: {
        enabled: true,
      },
    };
    const payment_intent = await stripeInstance.paymentIntents.create(params);

    res.send(payment_intent);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).send({ message: errorMessage });
  }
};

const createOrderByRazorPay = async (req, res) => {
  try {
    const storeSetting = await Setting.findOne({ name: "storeSetting" });

    const instance = new Razorpay({
      key_id: storeSetting?.setting?.razorpay_id,
      key_secret: storeSetting?.setting?.razorpay_secret,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    if (!order)
      return res.status(500).send({
        message: "Error occurred when creating order!",
      });
    res.send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addRazorpayOrder = async (req, res) => {
  try {
    const isGuest = !req.user || !req.user._id;

    const orderData = {
      ...req.body,
      isGuestOrder: isGuest,
    };

    // Add user reference only if user is authenticated
    if (!isGuest && req.user && req.user._id) {
      orderData.user = req.user._id;
    }

    // For guest orders, ensure we have guest information
    if (isGuest) {
      if (!req.body.guestInfo || !req.body.guestInfo.email) {
        return res.status(400).send({
          message: "Guest information is required for guest orders",
        });
      }
    }

    // Handle delivery schedule for Razorpay orders too
    if (req.body.deliverySchedule) {
      const deliverySchedule = req.body.deliverySchedule;

      if (deliverySchedule.deliveryType === "scheduled") {
        if (!deliverySchedule.preferredDate) {
          return res.status(400).send({
            message: "Preferred date is required for scheduled delivery",
          });
        }

        if (typeof deliverySchedule.preferredDate === 'string') {
          deliverySchedule.preferredDate = new Date(deliverySchedule.preferredDate);
        }
      }

      orderData.deliverySchedule = {
        deliveryType: deliverySchedule.deliveryType || "standard",
        preferredTimeSlot: deliverySchedule.preferredTimeSlot || "anytime",
        deliveryNotes: deliverySchedule.deliveryNotes || "",
        ...(deliverySchedule.preferredDate && {
          preferredDate: deliverySchedule.preferredDate
        })
      };
    }

    const newOrder = new Order(orderData);
    const order = await newOrder.save();

    res.status(201).send({
      success: true,
      message: isGuest ? "Guest order created successfully" : "Order created successfully",
      order: order
    });

    handleProductQuantity(order.cart);
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

// get all orders user (only for authenticated users)
const getOrderCustomer = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).send({
        message: "Authentication required to view orders",
      });
    }

    const { page, limit } = req.query;

    const pages = Number(page) || 1;
    const limits = Number(limit) || 8;
    const skip = (pages - 1) * limits;

    const totalDoc = await Order.countDocuments({ user: req.user._id });

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
          user: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total processing order count
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: "Processing",
          user: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          user: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // query for orders
    const orders = await Order.find({ user: req.user._id })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits);

    res.send({
      orders,
      limits,
      pages,
      pending: totalPendingOrder.length === 0 ? 0 : totalPendingOrder[0].count,
      processing:
        totalProcessingOrder.length === 0 ? 0 : totalProcessingOrder[0].count,
      delivered:
        totalDeliveredOrder.length === 0 ? 0 : totalDeliveredOrder[0].count,
      totalDoc,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    console.log("getOrderById called with ID:", req.params.id);
    console.log("User info:", req.user);

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        message: "Order not found",
      });
    }

    console.log("Found order:", {
      id: order._id,
      isGuestOrder: order.isGuestOrder,
      userId: order.user,
      deliverySchedule: order.deliverySchedule
    });

    // Allow access if:
    // 1. It's a guest order (no authentication needed)
    // 2. User is authenticated and owns the order
    if (order.isGuestOrder || (req.user && order.user && order.user.toString() === req.user._id.toString())) {
      console.log("Access granted to order");
      return res.send(order);
    }

    // Deny access
    return res.status(401).send({
      message: "Access denied to this order",
    });

  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).send({
      message: err.message,
    });
  }
};

const sendEmailInvoiceToCustomer = async (req, res) => {
  try {
    const user = req.body.user_info;

    // Validate email using MailChecker
    if (!MailChecker.isValid(user?.email)) {
      return res.status(400).send({
        message:
          "Invalid or disposable email address. Please provide a valid email.",
      });
    }

    const pdf = await handleCreateInvoice(req.body, `${req.body.invoice}.pdf`);

    const option = {
      date: req.body.date,
      invoice: req.body.invoice,
      status: req.body.status,
      method: req.body.paymentMethod,
      subTotal: req.body.subTotal,
      total: req.body.total,
      discount: req.body.discount,
      shipping: req.body.shippingCost,
      currency: req.body.company_info.currency,
      company_name: req.body.company_info.company,
      company_address: req.body.company_info.address,
      company_phone: req.body.company_info.phone,
      company_email: req.body.company_info.email,
      company_website: req.body.company_info.website,
      vat_number: req.body?.company_info?.vat_number,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      address: user?.address,
      cart: req.body.cart,
      // Add delivery schedule to email template
      deliverySchedule: req.body.deliverySchedule,
    };

    const body = {
      from: req.body.company_info?.from_email || "sales@kachabazar.com",
      to: user.email,
      subject: `Your Order - ${req.body.invoice} at ${req.body.company_info.company}`,
      html: customerInvoiceEmailBody(option),
      attachments: [
        {
          filename: `${req.body.invoice}.pdf`,
          content: pdf,
        },
      ],
    };
    const message = `Invoice successfully sent to the customer ${user.name}`;
    sendEmail(body, res, message);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  addOrder,
  getOrderById,
  getOrderCustomer,
  createPaymentIntent,
  createOrderByRazorPay,
  addRazorpayOrder,
  sendEmailInvoiceToCustomer,
};