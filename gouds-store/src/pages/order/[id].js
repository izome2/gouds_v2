import { PDFDownloadLink } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { IoCloudDownloadOutline, IoPrintOutline, IoInformationCircleOutline } from "react-icons/io5";
import { FiTruck, FiClock, FiMapPin, FiEdit3, FiCalendar } from "react-icons/fi";
import ReactToPrint from "react-to-print";
import { useQuery } from "@tanstack/react-query";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import Invoice from "@components/invoice/Invoice";
import Loading from "@components/preloader/Loading";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import InvoiceForDownload from "@components/invoice/InvoiceForDownload";

const Order = ({ params }) => {
  const printRef = useRef();
  const orderId = params.id;

  const { data, error, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => await OrderServices.getOrderById(orderId),
  });

  const { showingTranslateValue, getNumberTwo, currency, showDateFormat } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  // ✅ Enhanced delivery information processing
  const deliveryInfo = data?.deliverySchedule ? {
    type: data.deliverySchedule.deliveryType,
    typeLabel: data.deliverySchedule.deliveryType === "standard" ? "Standard Delivery (2-3 business days)" :
      data.deliverySchedule.deliveryType === "express" ? "Express Delivery (Next day)" :
        data.deliverySchedule.deliveryType === "scheduled" ? "Scheduled Delivery" : "Standard Delivery",
    preferredDate: data.deliverySchedule.preferredDate,
    preferredDateFormatted: data.deliverySchedule.preferredDate ?
      new Date(data.deliverySchedule.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null,
    timeSlot: data.deliverySchedule.preferredTimeSlot || "anytime",
    timeSlotLabel: {
      "morning": "Morning (9:00 AM - 12:00 PM)",
      "afternoon": "Afternoon (12:00 PM - 5:00 PM)",
      "evening": "Evening (5:00 PM - 8:00 PM)",
      "anytime": "Anytime (9:00 AM - 8:00 PM)"
    }[data.deliverySchedule.preferredTimeSlot] || "Anytime (9:00 AM - 8:00 PM)",
    estimatedDate: data.deliverySchedule.estimatedDeliveryDate,
    estimatedDateFormatted: data.deliverySchedule.estimatedDeliveryDate ?
      new Date(data.deliverySchedule.estimatedDeliveryDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null,
    notes: data.deliverySchedule.deliveryNotes,
    status: data.deliverySchedule.deliveryStatus || "pending",
    statusLabel: {
      "pending": "Pending",
      "scheduled": "Scheduled",
      "out_for_delivery": "Out for Delivery",
      "delivered": "Delivered",
      "failed": "Failed"
    }[data.deliverySchedule.deliveryStatus] || "Pending",
    statusColor: {
      "pending": "bg-yellow-100 text-yellow-800",
      "scheduled": "bg-blue-100 text-blue-800",
      "out_for_delivery": "bg-purple-100 text-purple-800",
      "delivered": "bg-green-100 text-green-800",
      "failed": "bg-red-100 text-red-800"
    }[data.deliverySchedule.deliveryStatus] || "bg-yellow-100 text-yellow-800"
  } : null;

  // Customer info for both guest and authenticated users
  const customerInfo = data?.isGuestOrder ? data?.guestInfo : data?.user_info;

  return (
    <Layout title="Invoice" description="order confirmation page">
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : error ? (
        <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Order Not Found</h2>
            <p className="text-red-600">
              {error?.message || "Unable to load order details. Please check your order ID and try again."}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-6">
          {/* Welcome Message */}
          <div className="bg-emerald-100 rounded-md mb-5 px-4 py-3">
            <label className="flex items-center">
              <IoInformationCircleOutline className="text-emerald-600 mr-2" />
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_first
              )}{" "}
              <span className="font-bold text-emerald-600 mx-1">
                {customerInfo?.name || data?.user_info?.name},
              </span>{" "}
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_last
              )}
            </label>
          </div>

          {/* ✅ Enhanced Delivery Information Card */}
          {deliveryInfo && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiTruck className="mr-2 text-emerald-600" />
                  Delivery Information
                  <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${deliveryInfo.statusColor}`}>
                    {deliveryInfo.statusLabel}
                  </span>
                </h3>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Delivery Type */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiTruck className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Delivery Type</p>
                      <p className="text-gray-900 font-semibold">{deliveryInfo.typeLabel}</p>
                    </div>
                  </div>

                  {/* Scheduled Date (if applicable) */}
                  {deliveryInfo.preferredDate && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                        <p className="text-gray-900 font-semibold">{deliveryInfo.preferredDateFormatted}</p>
                      </div>
                    </div>
                  )}

                  {/* Estimated Delivery (if no scheduled date) */}
                  {deliveryInfo.estimatedDate && !deliveryInfo.preferredDate && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                        <p className="text-gray-900 font-semibold">{deliveryInfo.estimatedDateFormatted}</p>
                      </div>
                    </div>
                  )}

                  {/* Time Preference */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FiClock className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time Preference</p>
                      <p className="text-gray-900 font-semibold">{deliveryInfo.timeSlotLabel}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FiMapPin className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                      <p className="text-gray-900 font-semibold">{data?.user_info?.address}</p>
                      <p className="text-sm text-gray-600">{data?.user_info?.city}, {data?.user_info?.country}</p>
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  {deliveryInfo.notes && (
                    <div className="flex items-start space-x-3 md:col-span-2 lg:col-span-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiEdit3 className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Notes</p>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md mt-1">{deliveryInfo.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Progress Indicator */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-500 mb-3">Delivery Status</p>
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${deliveryInfo.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <div className="flex-1 h-1 bg-gray-200 rounded">
                      <div className={`h-1 rounded transition-all duration-500 ${deliveryInfo.status === 'pending' ? 'w-1/4 bg-yellow-500' :
                        deliveryInfo.status === 'scheduled' ? 'w-2/4 bg-blue-500' :
                          deliveryInfo.status === 'out_for_delivery' ? 'w-3/4 bg-purple-500' :
                            deliveryInfo.status === 'delivered' ? 'w-full bg-green-500' :
                              'w-1/4 bg-red-500'
                        }`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{deliveryInfo.statusLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <Invoice
              data={data}
              printRef={printRef}
              currency={currency}
              globalSetting={globalSetting}
              deliveryInfo={deliveryInfo} // ✅ Pass delivery info to Invoice component
            />

            {/* Action Buttons */}
            <div className="bg-white p-8 rounded-b-xl">
              <div className="flex lg:flex-row md:flex-row sm:flex-row flex-col justify-between invoice-btn gap-4">
                <PDFDownloadLink
                  document={
                    <InvoiceForDownload
                      data={data}
                      currency={currency}
                      globalSetting={globalSetting}
                      getNumberTwo={getNumberTwo}
                      deliveryInfo={deliveryInfo} // ✅ Pass delivery info to PDF
                    />
                  }
                  fileName={`Invoice-${data?.invoice || orderId}.pdf`}
                >
                  {({ blob, url, loading, error }) =>
                    loading ? (
                      <button disabled className="mb-3 sm:mb-0 md:mb-0 lg:mb-0 flex items-center justify-center bg-gray-400 text-white font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md">
                        Loading PDF...
                      </button>
                    ) : (
                      <button className="mb-3 sm:mb-0 md:mb-0 lg:mb-0 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white transition-all font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md">
                        {showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.download_button
                        ) || "Download"}{" "}
                        <span className="ml-2 text-base">
                          <IoCloudDownloadOutline />
                        </span>
                      </button>
                    )
                  }
                </PDFDownloadLink>

                <ReactToPrint
                  trigger={() => (
                    <button className="mb-3 sm:mb-0 md:mb-0 lg:mb-0 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white transition-all font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md">
                      {showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.print_button
                      ) || "Print"}{" "}
                      <span className="ml-2">
                        <IoPrintOutline />
                      </span>
                    </button>
                  )}
                  content={() => printRef.current}
                  documentTitle={`Invoice-${data?.invoice || orderId}`}
                />
              </div>

              {/* Guest Order Notice */}
              {data?.isGuestOrder && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <IoInformationCircleOutline className="text-blue-500 text-xl mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 mb-1">Guest Order</h4>
                      <p className="text-sm text-blue-700">
                        This is a guest order. Please save your order ID <strong>#{data?.invoice}</strong> for future reference and tracking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export const getServerSideProps = ({ params }) => {
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(Order), { ssr: false });