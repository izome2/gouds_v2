import { useParams } from "react-router";
import ReactToPrint from "react-to-print";
import React, { useContext, useRef, useState } from "react";
import { FiPrinter, FiMail, FiEdit3, FiSave, FiX, FiTruck, FiClock, FiMapPin, FiCalendar } from "react-icons/fi";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { Button } from "@windmill/react-ui";
import {
  TableCell,
  TableHeader,
  Table,
  TableContainer,
  WindmillContext,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { PDFDownloadLink } from "@react-pdf/renderer";

//internal import
import useAsync from "@/hooks/useAsync";
import useError from "@/hooks/useError";
import Status from "@/components/table/Status";
import { notifyError, notifySuccess } from "@/utils/toast";
import { AdminContext } from "@/context/AdminContext";
import OrderServices from "@/services/OrderServices";
import Invoice from "@/components/invoice/Invoice";
import Loading from "@/components/preloader/Loading";
import logoDark from "@/assets/img/logo/logo-dark.svg";
import logoLight from "@/assets/img/logo/logo-color.svg";
import PageTitle from "@/components/Typography/PageTitle";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useDisableForDemo from "@/hooks/useDisableForDemo";
import InvoiceForDownload from "@/components/invoice/InvoiceForDownload";

const OrderInvoice = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const { id } = useParams();
  const printRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Add states for delivery management
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);

  const { data, loading, error, setData } = useAsync(() =>
    OrderServices.getOrderById(id)
  );

  const { handleErrorNotification } = useError();
  const { handleDisableForDemo } = useDisableForDemo();

  const { currency, globalSetting, showDateFormat, getNumberTwo } =
    useUtilsFunction();

  // ✅ Initialize delivery data when order loads
  React.useEffect(() => {
    if (data?.deliverySchedule) {
      setDeliveryNotes(data.deliverySchedule.deliveryNotes || "");
      setDeliveryStatus(data.deliverySchedule.deliveryStatus || "pending");
    }
  }, [data]);

  // ✅ Process delivery information
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
      "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
      "scheduled": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      "out_for_delivery": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
      "delivered": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
      "failed": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
    }[data.deliverySchedule.deliveryStatus] || "bg-yellow-100 text-yellow-800"
  } : null;

  // ✅ Handle delivery update
  const handleUpdateDelivery = async () => {
    if (handleDisableForDemo()) return;

    setIsUpdatingDelivery(true);
    try {
      const updateData = {
        deliverySchedule: {
          ...data.deliverySchedule,
          deliveryNotes: deliveryNotes,
          deliveryStatus: deliveryStatus
        }
      };

      const res = await OrderServices.updateOrderDelivery(id, updateData);

      // Update local data
      // setData({
      //   ...data,
      //   deliverySchedule: {
      //     ...data.deliverySchedule,
      //     deliveryNotes: deliveryNotes,
      //     deliveryStatus: deliveryStatus
      //   }
      // });

      setIsEditingDelivery(false);
      notifySuccess("Delivery information updated successfully!");
    } catch (err) {
      handleErrorNotification(err, "handleUpdateDelivery");
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  const handleEmailInvoice = async (inv) => {
    if (handleDisableForDemo()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...inv,
        date: showDateFormat(inv.createdAt),
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
        // ✅ Include delivery info in email
        deliverySchedule: data?.deliverySchedule
      };

      const res = await OrderServices.sendEmailInvoiceToCustomer(updatedData);
      notifySuccess(res.message);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      handleErrorNotification(err, "handleEmailInvoice");
    }
  };

  return (
    <>
      <PageTitle> {t("InvoicePageTittle")} </PageTitle>

      {/* ✅ Enhanced Delivery Management Section */}
      {!loading && deliveryInfo && (
        <div className="bg-white dark:bg-gray-800 mb-4 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <FiTruck className="mr-2 text-emerald-500" />
              Delivery Management
            </h2>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${deliveryInfo.statusColor}`}>
                {deliveryInfo.statusLabel}
              </span>
              {!isEditingDelivery ? (
                <button
                  onClick={() => setIsEditingDelivery(true)}
                  className="flex items-center px-3 py-2 text-sm bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-100 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors"
                >
                  <FiEdit3 className="mr-1" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateDelivery}
                    disabled={isUpdatingDelivery}
                    className="flex items-center px-3 py-2 text-sm bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100 rounded-md hover:bg-green-200 dark:hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isUpdatingDelivery ? (
                      <img src={spinnerLoadingImage} alt="Loading" width={16} height={16} className="mr-1" />
                    ) : (
                      <FiSave className="mr-1" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingDelivery(false);
                      setDeliveryNotes(data.deliverySchedule?.deliveryNotes || "");
                      setDeliveryStatus(data.deliverySchedule?.deliveryStatus || "pending");
                    }}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiX className="mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Delivery Type */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <FiTruck className="text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Type</p>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">{deliveryInfo.typeLabel}</p>
              </div>
            </div>

            {/* Scheduled/Estimated Date */}
            {(deliveryInfo.preferredDate || deliveryInfo.estimatedDate) && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {deliveryInfo.preferredDate ? "Scheduled Date" : "Estimated Date"}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">
                    {deliveryInfo.preferredDate ? deliveryInfo.preferredDateFormatted : deliveryInfo.estimatedDateFormatted}
                  </p>
                </div>
              </div>
            )}

            {/* Time Preference */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                <FiClock className="text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Preference</p>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">{deliveryInfo.timeSlotLabel}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
                <FiMapPin className="text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Address</p>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">{data?.user_info?.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{data?.user_info?.city}, {data?.user_info?.country}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Status
              </label>
              {isEditingDelivery ? (
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              ) : (
                <div className={`inline-flex px-3 py-2 rounded-md text-sm font-medium ${deliveryInfo.statusColor}`}>
                  {deliveryInfo.statusLabel}
                </div>
              )}
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Notes
              </label>
              {isEditingDelivery ? (
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Add delivery notes or special instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md min-h-[80px]">
                  <p className="text-gray-900 dark:text-gray-100">
                    {deliveryNotes || "No delivery notes available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Original Invoice Section */}
      <div
        ref={printRef}
        className="bg-white dark:bg-gray-800 mb-4 p-6 lg:p-8 rounded-xl shadow-sm overflow-hidden"
      >
        {!loading && (
          <div className="">
            <div className="flex lg:flex-row md:flex-row flex-col lg:items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-700 dark:text-gray-300">
              <h1 className="font-bold font-serif text-xl uppercase">
                {t("InvoicePageTittle")}
                <p className="text-xs mt-1 text-gray-500">
                  {t("InvoiceStatus")}
                  <span className="pl-2 font-medium text-xs capitalize">
                    {" "}
                    <Status status={data.status} />
                  </span>
                </p>
              </h1>
              <div className="lg:text-right text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {globalSetting?.website}
                </p>
              </div>
            </div>
            <div className="flex lg:flex-row md:flex-row flex-col justify-between pt-4">
              <div className="mb-3 md:mb-0 lg:mb-0 flex flex-col">
                <span className="font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoiceDate")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  {showDateFormat(data?.createdAt)}
                </span>
              </div>
              <div className="mb-3 md:mb-0 lg:mb-0 flex flex-col">
                <span className="font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoiceNo")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  #{data?.invoice}
                </span>
              </div>
              <div className="flex flex-col lg:text-right text-left">
                <span className="font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoiceTo")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  {data?.user_info?.name} <br />
                  {data?.user_info?.email}{" "}
                  <span className="ml-2">{data?.user_info?.contact}</span>
                  <br />
                  {data?.user_info?.address?.substring(0, 30)}
                  <br />
                  {data?.user_info?.city}, {data?.user_info?.country},{" "}
                  {data?.user_info?.zipCode}
                </span>
              </div>
            </div>
          </div>
        )}
        <div>
          {loading ? (
            <Loading loading={loading} />
          ) : error ? (
            <span className="text-center mx-auto text-red-500">{error}</span>
          ) : (
            <TableContainer className="my-8">
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>{t("Sr")}</TableCell>
                    <TableCell>Product Title</TableCell>
                    <TableCell className="text-center">
                      {t("Quantity")}
                    </TableCell>
                    <TableCell className="text-center">
                      {t("ItemPrice")}
                    </TableCell>
                    <TableCell className="text-right">{t("Amount")}</TableCell>
                  </tr>
                </TableHeader>
                <Invoice
                  data={data}
                  currency={currency}
                  getNumberTwo={getNumberTwo}
                  deliveryInfo={deliveryInfo} // ✅ Pass delivery info
                />
              </Table>
            </TableContainer>
          )}
        </div>

        {!loading && (
          <div className="border rounded-xl border-gray-100 p-8 py-6 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex lg:flex-row md:flex-row flex-col justify-between">
              <div className="mb-3 md:mb-0 lg:mb-0  flex flex-col sm:flex-wrap">
                <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoicepaymentMethod")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold font-serif block">
                  {data.paymentMethod}
                </span>
              </div>
              <div className="mb-3 md:mb-0 lg:mb-0  flex flex-col sm:flex-wrap">
                <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("ShippingCost")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold font-serif block">
                  {getNumberTwo(data.shippingCost)}
                  {currency}
                </span>
              </div>
              <div className="mb-3 md:mb-0 lg:mb-0  flex flex-col sm:flex-wrap">
                <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoiceDicount")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold font-serif block">
                  {getNumberTwo(data.discount)}
                  {currency}
                </span>
              </div>
              <div className="flex flex-col sm:flex-wrap">
                <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoiceTotalAmount")}
                </span>
                <span className="text-xl font-serif font-bold text-red-500 dark:text-emerald-500 block">
                  {getNumberTwo(data.total)}
                  {currency}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && (
        <div className="mb-4 mt-3 flex md:flex-row flex-col items-center justify-between">
          <PDFDownloadLink
            document={
              <InvoiceForDownload
                t={t}
                data={data}
                currency={currency}
                getNumberTwo={getNumberTwo}
                showDateFormat={showDateFormat}
                deliveryInfo={deliveryInfo} // ✅ Pass delivery info to PDF
              />
            }
            fileName={`Invoice-${data?.invoice}.pdf`}
          >
            {({ blob, url, loading, error }) =>
              loading ? (
                "Loading..."
              ) : (
                <button className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-emerald-500 border border-transparent active:bg-emerald-600 hover:bg-emerald-600  w-auto cursor-pointer">
                  Download Invoice
                  <span className="ml-2 text-base">
                    <IoCloudDownloadOutline />
                  </span>
                </button>
              )
            }
          </PDFDownloadLink>

          <div className="flex md:mt-0 mt-3 gap-4 md:w-auto w-full">
            {globalSetting?.email_to_customer && (
              <div className="flex justify-end md:w-auto w-full">
                {isSubmitting ? (
                  <Button
                    disabled={true}
                    type="button"
                    className="text-sm h-10 leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none text-white px-2 ml-4 md:px-4 lg:px-6 py-4 md:py-3.5 lg:py-4 hover:text-white bg-emerald-400 hover:bg-emerald-500"
                  >
                    <img
                      src={spinnerLoadingImage}
                      alt="Loading"
                      width={20}
                      height={10}
                    />{" "}
                    <span className="font-serif ml-2 font-light">
                      {" "}
                      Processing
                    </span>
                  </Button>
                ) : (
                  <button
                    onClick={() => handleEmailInvoice(data)}
                    className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-teal-500 border border-transparent active:bg-teal-600 hover:bg-teal-600  md:w-auto w-full h-10 justify-center"
                  >
                    Email Invoice
                    <span className="ml-2">
                      <FiMail />
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="md:w-auto w-full">
              <ReactToPrint
                trigger={() => (
                  <button className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-emerald-500 border border-transparent active:bg-emerald-600 hover:bg-emerald-600  md:w-auto w-full h-10 justify-center">
                    {t("PrintInvoice")}{" "}
                    <span className="ml-2">
                      <FiPrinter />
                    </span>
                  </button>
                )}
                content={() => printRef.current}
                documentTitle={data?.invoice}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderInvoice;