const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderCustomer,
  updateOrder,
  deleteOrder,
  getDashboardOrders,
  getDashboardRecentOrder,
  getBestSellerProductChart,
  getDashboardCount,
  getDashboardAmount,
  updateOrderDelivery, // ✅ Add new import
  getDeliverySchedulesByDate, // ✅ Add new import
  getDeliveryAnalytics, // ✅ Add new import
} = require("../controller/orderController");

const { isAuth, isAdmin } = require("../config/auth");

//get all orders
router.get("/", getAllOrders);

// get dashboard orders data
router.get("/dashboard", getDashboardOrders);

// dashboard recent-order
router.get("/dashboard-recent-order", getDashboardRecentOrder);

// dashboard order count
router.get("/dashboard-count", getDashboardCount);

// dashboard order amount
router.get("/dashboard-amount", getDashboardAmount);

// chart data for product
router.get("/best-seller/chart", getBestSellerProductChart);

//get all order by a user
router.get("/customer/:id", getOrderCustomer);

//get a order by id
router.get("/:id", getOrderById);

//update a order
router.put("/:id", updateOrder);

//delete a order
router.delete("/:id", deleteOrder);

// ✅ New delivery management routes
router.put("/delivery/:id", isAuth, updateOrderDelivery);
router.get("/delivery-schedule", isAuth, getDeliverySchedulesByDate);
router.get("/delivery-analytics", isAuth, getDeliveryAnalytics);

module.exports = router;
