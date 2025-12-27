import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import useRazorpay from "react-razorpay";
import { useQuery } from "@tanstack/react-query";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import * as fbq from "../lib/fpixel";

//internal import
import { getUserSession } from "@lib/auth";
import { UserContext } from "@context/UserContext";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "./useUtilsFunction";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import NotificationServices from "@services/NotificationServices";

const useCheckoutSubmit = (storeSetting) => {
  const { dispatch } = useContext(UserContext);
  const { data: session } = useSession();

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [isCouponAvailable, setIsCouponAvailable] = useState(false);

  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const couponRef = useRef("");
  const [Razorpay] = useRazorpay();
  const { isEmpty, emptyCart, items, cartTotal } = useCart();

  const userInfo = getUserSession();
  const isGuest = !session?.user && !userInfo;

  const { showDateFormat, currency, globalSetting } = useUtilsFunction();
  console.log("🔍 Authentication Debug:", {
    session: session?.user,
    userInfo,
    sessionStatus: status,
    isGuest,
    hasSessionUser: !!session?.user,
    hasUserInfo: !!userInfo
  });
  const { data, isLoading } = useQuery({
    queryKey: ["shippingAddress", { id: userInfo?.id }],
    queryFn: async () =>
      userInfo?.id
        ? await CustomerServices.getShippingAddress({
          userId: userInfo?.id,
        })
        : null,
    select: (data) => data?.shippingAddress,
    enabled: !!userInfo?.id,
  });

  const hasShippingAddress =
    !isLoading && data && Object.keys(data)?.length > 0 && !!userInfo?.id;

  // Initialize form with default values including delivery schedule
  const {
    register,
    control, // Add control here
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      address: "",
      city: "",
      country: "",
      zipCode: "",
      paymentMethod: "Cash",
      deliveryType: "standard", // Add delivery schedule defaults
      preferredTimeSlot: "anytime",
      preferredDate: "",
      deliveryNotes: "",
    }
  });

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
    if (userInfo?.email) {
      setValue("email", userInfo.email);
    } else {
      setValue("email", "");
    }
  }, [isCouponApplied]);

  //remove coupon if total value less then minimum amount of coupon
  useEffect(() => {
    if (minimumAmount - discountAmount > total || isEmpty) {
      setDiscountPercentage(0);
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, total]);

  //calculate total and discount value
  useEffect(() => {
    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + currentValue.itemTotal,
      0
    );

    let totalValue = 0;
    const subTotal = parseFloat(cartTotal + Number(shippingCost)).toFixed(2);
    const discountAmount =
      discountPercentage?.type === "fixed"
        ? discountPercentage?.value
        : discountProductTotal * (discountPercentage?.value / 100);

    const discountAmountTotal = discountAmount ? discountAmount : 0;

    totalValue = Number(subTotal) - discountAmountTotal;

    setDiscountAmount(discountAmountTotal);
    setTotal(totalValue);
  }, [cartTotal, shippingCost, discountPercentage]);

  const submitHandler = async (data) => {
    try {
      setIsCheckoutSubmit(true);
      setError("");

      const userDetails = {
        name: `${data.firstName} ${data.lastName}`,
        contact: data.contact,
        email: data.email,
        address: data.address,
        country: data.country,
        city: data.city,
        zipCode: data.zipCode,
      };

      // Build delivery schedule data
      const deliveryScheduleData = {
        deliveryType: data.deliveryType || "standard",
        preferredTimeSlot: data.preferredTimeSlot || "anytime",
        deliveryNotes: data.deliveryNotes || "",
      };

      // Add preferred date if scheduled delivery
      if (data.deliveryType === "scheduled" && data.preferredDate) {
        deliveryScheduleData.preferredDate = new Date(data.preferredDate);
      }

      let orderInfo = {
        user_info: userDetails,
        deliverySchedule: deliveryScheduleData,
        shippingOption: data.shippingOption,
        paymentMethod: data.paymentMethod,
        status: "Pending",
        cart: items,
        subTotal: cartTotal,
        shippingCost: shippingCost,
        discount: discountAmount,
        total: total,
      };

      // Add guest information if user is not authenticated
      if (isGuest) {
        orderInfo.guestInfo = {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.contact,
        };
        orderInfo.isGuestOrder = true;
      }

      // Only try to save shipping address for authenticated users
      if (userInfo?.id && !isGuest) {
        try {
          await CustomerServices.addShippingAddress({
            userId: userInfo?.id,
            shippingAddressData: {
              ...userDetails,
            },
          });
        } catch (addressError) {
          console.warn("Failed to save shipping address:", addressError.message);
        }
      }

      // Handle payment based on method
      switch (data.paymentMethod) {
        case "Card":
          await handlePaymentWithStripe(orderInfo);
          break;
        case "RazorPay":
          await handlePaymentWithRazorpay(orderInfo);
          break;
        case "Cash":
          await handleCashPayment(orderInfo);
          break;
        default:
          throw new Error("Invalid payment method selected");
      }
    } catch (error) {
      console.error("Checkout submission error:", error);

      if (!isGuest && error?.response?.status === 401) {
        signOut();
        Cookies.remove("couponInfo");
        window.location.replace(`${process.env.NEXT_PUBLIC_STORE_DOMAIN}/auth/login`);
      } else if (error?.response?.status === 403) {
        notifyError("Access denied. Please contact admin.");
      } else {
        notifyError(error?.response?.data?.message || error?.message || "Order submission failed");
      }
      setIsCheckoutSubmit(false);
    }
  };

  const handleOrderSuccess = async (orderResponse, orderInfo) => {
    try {
      const order = orderResponse?.order || orderResponse;
      const orderId = order?._id || order?.id;

      console.log("Order extracted:", order);
      console.log("Order ID:", orderId);

      if (!orderId) {
        console.error("Could not extract order ID from response");
        console.error("Full response structure:", JSON.stringify(orderResponse, null, 2));
        throw new Error("Order ID not found in response");
      }

      // Get customer info for both guest and authenticated users
      const customerInfo = isGuest
        ? orderInfo.guestInfo
        : {
          name: order?.user_info?.name,
          email: order?.user_info?.email,
          contact: order?.user_info?.contact,
        };

      const notificationInfo = {
        orderId: orderId,
        message: `${customerInfo?.name || 'A customer'} placed an order of ${parseFloat(order?.total).toFixed(2)}!`,
        image: "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
      };

      const updatedData = {
        ...order,
        date: showDateFormat(order?.createdAt),
        company_info: {
          currency: currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };

      if (globalSetting?.email_to_customer) {
        OrderServices.sendEmailInvoiceToCustomer(updatedData).catch(
          (emailErr) => {
            console.error("Failed to send email invoice:", emailErr.message);
          }
        );
      }

      try {
        await NotificationServices.addNotification(notificationInfo);
      } catch (notifError) {
        console.warn("Failed to add notification:", notifError.message);
      }

      // Facebook pixel tracking
      fbq.event("Purchase", {
        currency: currency,
        value: parseFloat(order?.total).toFixed(2)
      });

      // Redirect based on user type
      if (isGuest) {
        console.log("Redirecting guest to:", `/order-confirmation/${orderId}`);
        router.push(`/order-confirmation/${orderId}`);
      } else {
        console.log("Redirecting user to:", `/order/${orderId}`);
        router.push(`/order/${orderId}`);
      }

      notifySuccess(
        isGuest
          ? "Your Order Confirmed! Please save your order ID for tracking."
          : "Your Order Confirmed! The invoice will be emailed to you shortly."
      );

      Cookies.remove("couponInfo");
      emptyCart();
      setIsCheckoutSubmit(false);
    } catch (err) {
      console.error("Order success handling error:", err.message);
      console.error("Error details:", err);
      throw new Error(err.message);
    }
  };

  //handle cash payment
  const handleCashPayment = async (orderInfo) => {
    try {
      const orderResponse = await OrderServices.addOrder(orderInfo);
      await handleOrderSuccess(orderResponse, orderInfo);
    } catch (err) {
      console.error("Cash payment error:", err.message);
      throw new Error(err.message);
    }
  };

  //handle stripe payment
  const handlePaymentWithStripe = async (orderInfo) => {
    try {
      if (!stripe || !elements) {
        throw new Error("Stripe is not initialized");
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });

      if (error || !paymentMethod) {
        throw new Error(error?.message || "Stripe payment failed");
      }

      const order = {
        ...orderInfo,
        cardInfo: paymentMethod,
      };

      const stripeInfo = await OrderServices.createPaymentIntent(order);

      const confirmResult = await stripe.confirmCardPayment(stripeInfo?.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (confirmResult.error) {
        throw new Error(confirmResult.error.message);
      }

      const orderData = { ...orderInfo, cardInfo: stripeInfo };
      const orderResponse = await OrderServices.addOrder(orderData);
      await handleOrderSuccess(orderResponse, orderInfo);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  //handle razorpay payment
  const handlePaymentWithRazorpay = async (orderInfo) => {
    try {
      const { amount, id, currency } = await OrderServices.createOrderByRazorPay({
        amount: Math.round(orderInfo.total).toString(),
      });

      const customerInfo = isGuest
        ? orderInfo.guestInfo
        : orderInfo.user_info;

      const options = {
        key: storeSetting?.razorpay_id,
        amount,
        currency,
        name: "Gouds Store",
        description: "This is the total cost of your purchase",
        order_id: id,
        handler: async (response) => {
          const razorpayDetails = {
            amount: orderInfo.total,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const orderData = { ...orderInfo, razorpay: razorpayDetails };
          const orderResponse = await OrderServices.addRazorpayOrder(orderData);
          await handleOrderSuccess(orderResponse, orderInfo);
        },
        prefill: {
          name: customerInfo?.name || "Customer",
          email: customerInfo?.email || "customer@example.com",
          contact: customerInfo?.phone || customerInfo?.contact || "0000000000",
        },
        theme: { color: "#10b981" },
      };

      const rzpay = new Razorpay(options);
      rzpay.open();
    } catch (err) {
      console.error("Razorpay payment error:", err.message);
      throw new Error(err.message);
    }
  };

  const handleShippingCost = (value) => {
    setShippingCost(Number(value));
  };

  //handle default shipping address
  const handleDefaultShippingAddress = (value) => {
    setUseExistingAddress(value);
    if (value && !isGuest) {
      const address = data;
      const nameParts = address?.name?.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts?.length > 1 ? nameParts[nameParts?.length - 1] : "";

      setValue("firstName", firstName);
      setValue("lastName", lastName);
      setValue("address", address.address);
      setValue("contact", address.contact);
      setValue("city", address.city);
      setValue("country", address.country);
      setValue("zipCode", address.zipCode);
    } else {
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("address", "");
      setValue("contact", "");
      setValue("city", "");
      setValue("country", "");
      setValue("zipCode", "");
    }
  };

  const handleCouponCode = async (e) => {
    e.preventDefault();

    if (!couponRef.current.value) {
      notifyError("Please Input a Coupon Code!");
      return;
    }
    setIsCouponAvailable(true);

    try {
      const coupons = await CouponServices.getShowingCoupons();
      const result = coupons.filter(
        (coupon) => coupon.couponCode === couponRef.current.value
      );
      setIsCouponAvailable(false);

      if (result.length < 1) {
        notifyError("Please Input a Valid Coupon!");
        return;
      }

      if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
        notifyError("This coupon is not valid!");
        return;
      }

      if (total < result[0]?.minimumAmount) {
        notifyError(
          `Minimum ${result[0].minimumAmount} USD required for Apply this coupon!`
        );
        return;
      } else {
        notifySuccess(
          `Your Coupon ${result[0].couponCode} is Applied on ${result[0].productType}!`
        );
        setIsCouponApplied(true);
        setMinimumAmount(result[0]?.minimumAmount);
        setDiscountPercentage(result[0].discountType);
        dispatch({ type: "SAVE_COUPON", payload: result[0] });
        Cookies.set("couponInfo", JSON.stringify(result[0]));
      }
    } catch (error) {
      setIsCouponAvailable(false);
      return notifyError(error.message);
    }
  };

  return {
    register,
    control, // Add control to the return values
    errors,
    showCard,
    setShowCard,
    error,
    stripe,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountPercentage,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    isCouponApplied,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    handleDefaultShippingAddress,
    isGuest,
    currency,
    setValue,
    watch,
  };
};

export default useCheckoutSubmit;