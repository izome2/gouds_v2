// pages/order-confirmation/[id].js
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { IoCheckmarkCircle, IoCloseCircle, IoCopyOutline } from "react-icons/io5";
import { FiMail, FiPhone, FiMapPin, FiShoppingBag, FiClock, FiDollarSign, FiPackage, FiTruck } from "react-icons/fi";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

//internal import
import Layout from "@layout/Layout";
import Loading from "@components/preloader/Loading";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { notifySuccess } from "@utils/toast";

const OrderConfirmation = () => {
    const router = useRouter();
    const { id: orderId } = router.query;
    const [copied, setCopied] = useState(false);

    const { currency, showDateFormat } = useUtilsFunction();

    const { data: order, error, isLoading } = useQuery({
        queryKey: ["guestOrder", orderId],
        queryFn: async () => await OrderServices.getOrderById(orderId),
        enabled: !!orderId,
    });

    // ✅ Define deliveryInfo properly
    const deliveryInfo = order?.deliverySchedule ? {
        type: order.deliverySchedule.deliveryType,
        typeLabel: order.deliverySchedule.deliveryType === "standard" ? "Standard Delivery" :
            order.deliverySchedule.deliveryType === "express" ? "Express Delivery" :
                order.deliverySchedule.deliveryType === "scheduled" ? "Scheduled Delivery" : "Standard Delivery",
        preferredDate: order.deliverySchedule.preferredDate,
        preferredDateFormatted: order.deliverySchedule.preferredDate ?
            new Date(order.deliverySchedule.preferredDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : null,
        timeSlot: order.deliverySchedule.preferredTimeSlot || "anytime",
        estimatedDate: order.deliverySchedule.estimatedDeliveryDate,
        estimatedDateFormatted: order.deliverySchedule.estimatedDeliveryDate ?
            new Date(order.deliverySchedule.estimatedDeliveryDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : null,
        notes: order.deliverySchedule.deliveryNotes,
        cost: order.shippingCost || 0
    } : null;

    const copyOrderId = async () => {
        try {
            await navigator.clipboard.writeText(order?.invoice || orderId);
            setCopied(true);
            notifySuccess("Order ID copied to clipboard!");
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy order ID:", err);
        }
    };

    if (isLoading) {
        return <Loading loading={isLoading} />;
    }

    if (error) {
        return (
            <Layout title="Order Not Found" description="Order confirmation page">
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-sm">
                        <IoCloseCircle className="mx-auto text-6xl text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find an order with this ID. Please check your order ID and try again.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    const customerInfo = order?.isGuestOrder ? order?.guestInfo : order?.user_info;

    return (
        <Layout title="Order Confirmation" description="Your order has been confirmed">
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                            <IoCheckmarkCircle className="text-4xl text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Thank you for your order! We've received your order and will start processing it soon.
                            You'll receive a confirmation email with all the details.
                        </p>
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <FiShoppingBag className="mr-2" />
                                    Order Details
                                </h2>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${order?.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                    order?.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                        order?.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order?.status}
                                </span>
                            </div>
                        </div>

                        {/* ✅ Delivery Information Section - Fixed */}
                        {deliveryInfo && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <FiTruck className="mr-2 text-emerald-600" />
                                    Delivery Information
                                </h4>

                                <div className="bg-emerald-50 rounded-lg p-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-emerald-800">Delivery Type</p>
                                            <p className="text-emerald-700">{deliveryInfo.typeLabel}</p>
                                            {deliveryInfo.cost > 0 && (
                                                <p className="text-xs text-emerald-600">+{deliveryInfo.cost.toFixed(2)} {currency} delivery fee</p>
                                            )}
                                        </div>

                                        {deliveryInfo.preferredDate && (
                                            <div>
                                                <p className="text-sm font-medium text-emerald-800">Scheduled Date</p>
                                                <p className="text-emerald-700">{deliveryInfo.preferredDateFormatted}</p>
                                            </div>
                                        )}

                                        {deliveryInfo.estimatedDate && !deliveryInfo.preferredDate && (
                                            <div>
                                                <p className="text-sm font-medium text-emerald-800">Estimated Delivery</p>
                                                <p className="text-emerald-700">{deliveryInfo.estimatedDateFormatted}</p>
                                            </div>
                                        )}

                                        {deliveryInfo.timeSlot !== "anytime" && (
                                            <div>
                                                <p className="text-sm font-medium text-emerald-800">Time Preference</p>
                                                <p className="text-emerald-700 capitalize">{deliveryInfo.timeSlot}</p>
                                            </div>
                                        )}
                                    </div>

                                    {deliveryInfo.notes && (
                                        <div className="mt-3 pt-3 border-t border-emerald-200">
                                            <p className="text-sm font-medium text-emerald-800">Notes</p>
                                            <p className="text-emerald-700 text-sm">{deliveryInfo.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="px-6 py-6 space-y-5">
                            {/* Order ID */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-500 mr-3">Order ID:</span>
                                    <code className="bg-white px-3 py-2 rounded border text-lg font-mono font-semibold">
                                        #{order?.invoice || orderId}
                                    </code>
                                </div>
                                <button
                                    onClick={copyOrderId}
                                    className="flex items-center px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
                                    title="Copy Order ID"
                                >
                                    <IoCopyOutline className={`mr-1 ${copied ? "text-green-600" : ""}`} />
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                                    <FiClock className="text-blue-600 text-xl mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Order Date</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {showDateFormat(order?.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                                    <FiDollarSign className="text-purple-600 text-xl mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                        <p className="text-sm font-semibold text-gray-900">{order?.paymentMethod}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                                    <FiPackage className="text-green-600 text-xl mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {order?.total?.toFixed(2)} {currency}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping Information */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Shipping Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FiMapPin className="mr-2 text-emerald-600" />
                                Shipping Address
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p className="font-medium text-gray-900">{customerInfo?.name}</p>
                                <p>{order?.user_info?.address}</p>
                                <p>{order?.user_info?.city}, {order?.user_info?.zipCode}</p>
                                <p>{order?.user_info?.country}</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FiMail className="mr-2 text-emerald-600" />
                                Contact Information
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <FiMail className="mr-3 text-gray-400" />
                                    <span>{customerInfo?.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiPhone className="mr-3 text-gray-400" />
                                    <span>{customerInfo?.phone || order?.user_info?.contact}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {order?.cart?.map((item, index) => (
                                <div key={index} className="px-6 py-4 flex items-center">
                                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                        <Image
                                            src={item.image || "/placeholder-image.png"}
                                            alt={item.title}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {(item.price * item.quantity).toFixed(2)} {currency}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Totals */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{order?.subTotal?.toFixed(2)} {currency}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-medium">{order?.shippingCost?.toFixed(2)} {currency}</span>
                                </div>
                                {order?.discount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="font-medium text-orange-600">-{order?.discount?.toFixed(2)} {currency}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-gray-300">
                                    <span>Total:</span>
                                    <span className="text-emerald-600">{order?.total?.toFixed(2)} {currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notice for Guests */}
                    {order?.isGuestOrder && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Please save your Order ID: <strong>#{order?.invoice}</strong></li>
                                <li>• You can use this Order ID to track your order status</li>
                                <li>• We've sent a confirmation email to: <strong>{customerInfo?.email}</strong></li>
                                <li>• Contact us if you need any assistance with your order</li>
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Footer Message */}
                    <div className="text-center mt-8 text-sm text-gray-500">
                        <p>Thank you for choosing Gouds Store! We appreciate your business.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export const getServerSideProps = async ({ params }) => {
    return {
        props: { params },
    };
};

export default OrderConfirmation;