const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false, // Not required for guest orders
    },

    // Guest order flag
    isGuestOrder: {
      type: Boolean,
      default: false,
    },

    // Guest information
    guestInfo: {
      name: {
        type: String,
        required: function () {
          return this.isGuestOrder;
        },
      },
      email: {
        type: String,
        required: function () {
          return this.isGuestOrder;
        },
      },
      phone: {
        type: String,
        required: function () {
          return this.isGuestOrder;
        },
      },
    },

    invoice: {
      type: Number,
      required: false,
    },
    cart: [{}],
    user_info: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      contact: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      zipCode: {
        type: String,
        required: false,
      },
    },

    // Enhanced Delivery scheduling
    deliverySchedule: {
      deliveryType: {
        type: String,
        enum: ["standard", "express", "scheduled"],
        default: "standard",
      },
      preferredDate: {
        type: Date,
        required: function () {
          return this.deliverySchedule?.deliveryType === "scheduled";
        },
        validate: {
          validator: function (date) {
            // Only validate if it's a scheduled delivery and date is provided
            if (this.deliverySchedule?.deliveryType === "scheduled" && date) {
              const now = new Date();
              const tomorrow = new Date(now);
              tomorrow.setDate(now.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);

              const selectedDate = new Date(date);
              selectedDate.setHours(0, 0, 0, 0);

              return selectedDate >= tomorrow;
            }
            return true;
          },
          message: "Preferred delivery date must be at least tomorrow"
        }
      },
      preferredTimeSlot: {
        type: String,
        enum: ["morning", "afternoon", "evening", "anytime"],
        default: "anytime",
      },
      deliveryNotes: {
        type: String,
        required: false,
        maxlength: 500,
        trim: true,
      },
      estimatedDeliveryDate: {
        type: Date,
        required: false,
      },
      // Track delivery status
      deliveryStatus: {
        type: String,
        enum: ["pending", "scheduled", "out_for_delivery", "delivered", "failed"],
        default: "pending",
      },
      // Actual delivery date (when delivered)
      actualDeliveryDate: {
        type: Date,
        required: false,
      },
      // Delivery instructions for the delivery team
      deliveryInstructions: {
        type: String,
        maxlength: 1000,
        required: false,
      },
    },

    subTotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    shippingOption: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    razorpay: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Delivered", "Cancel"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Enhanced indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ isGuestOrder: 1, createdAt: -1 });
orderSchema.index({ invoice: 1 });
orderSchema.index({ "guestInfo.email": 1 });
orderSchema.index({ "deliverySchedule.deliveryType": 1 });
orderSchema.index({ "deliverySchedule.preferredDate": 1 });
orderSchema.index({ "deliverySchedule.deliveryStatus": 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Method to check if order belongs to user
orderSchema.methods.belongsToUser = function (userId) {
  if (this.isGuestOrder) {
    return false; // Guest orders don't belong to any user
  }
  return this.user && this.user.toString() === userId.toString();
};

// Method to get customer info (works for both guest and user orders)
orderSchema.methods.getCustomerInfo = function () {
  if (this.isGuestOrder) {
    return {
      name: this.guestInfo.name,
      email: this.guestInfo.email,
      phone: this.guestInfo.phone,
    };
  }
  return {
    name: this.user_info?.name,
    email: this.user_info?.email,
    phone: this.user_info?.contact,
    address: this.user_info?.address,
  };
};

// Method to get delivery summary
orderSchema.methods.getDeliveryInfo = function () {
  const deliverySchedule = this.deliverySchedule || {};

  return {
    type: deliverySchedule.deliveryType || "standard",
    preferredDate: deliverySchedule.preferredDate,
    timeSlot: deliverySchedule.preferredTimeSlot || "anytime",
    notes: deliverySchedule.deliveryNotes || "",
    status: deliverySchedule.deliveryStatus || "pending",
    estimatedDate: deliverySchedule.estimatedDeliveryDate,
    actualDate: deliverySchedule.actualDeliveryDate,
    instructions: deliverySchedule.deliveryInstructions || "",
  };
};

// Method to update delivery status
orderSchema.methods.updateDeliveryStatus = function (status, actualDate = null) {
  this.deliverySchedule = this.deliverySchedule || {};
  this.deliverySchedule.deliveryStatus = status;

  if (status === "delivered" && actualDate) {
    this.deliverySchedule.actualDeliveryDate = actualDate;
    this.status = "Delivered";
  }

  return this.save();
};

// Method to calculate estimated delivery date
orderSchema.methods.calculateEstimatedDelivery = function () {
  const deliverySchedule = this.deliverySchedule || {};
  const now = new Date();
  let estimatedDate = new Date(now);

  switch (deliverySchedule.deliveryType) {
    case "express":
      // Next day delivery
      estimatedDate.setDate(now.getDate() + 1);
      break;
    case "scheduled":
      // Use preferred date
      if (deliverySchedule.preferredDate) {
        estimatedDate = new Date(deliverySchedule.preferredDate);
      } else {
        estimatedDate.setDate(now.getDate() + 2);
      }
      break;
    case "standard":
    default:
      // 2-3 business days
      estimatedDate.setDate(now.getDate() + 2);
      break;
  }

  this.deliverySchedule.estimatedDeliveryDate = estimatedDate;
  return estimatedDate;
};

// Pre-save middleware to calculate estimated delivery date
orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('deliverySchedule.deliveryType') || this.isModified('deliverySchedule.preferredDate')) {
    this.calculateEstimatedDelivery();
  }
  next();
});

// Virtual for formatted delivery date
orderSchema.virtual('formattedDeliveryDate').get(function () {
  const deliveryInfo = this.getDeliveryInfo();

  if (deliveryInfo.preferredDate) {
    return deliveryInfo.preferredDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (deliveryInfo.estimatedDate) {
    return deliveryInfo.estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return 'TBD';
});

// Static method to find orders with delivery scheduled for a specific date
orderSchema.statics.findDeliveriesForDate = function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    "deliverySchedule.preferredDate": {
      $gte: startOfDay,
      $lte: endOfDay
    },
    "deliverySchedule.deliveryType": "scheduled"
  }).sort({ "deliverySchedule.preferredTimeSlot": 1 });
};

// Static method to get delivery analytics
orderSchema.statics.getDeliveryAnalytics = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: "$deliverySchedule.deliveryType",
        count: { $sum: 1 },
        totalValue: { $sum: "$total" }
      }
    }
  ]);
};

const Order = mongoose.model(
  "Order",
  orderSchema.plugin(AutoIncrement, {
    inc_field: "invoice",
    start_seq: 10000,
  })
);

module.exports = Order;