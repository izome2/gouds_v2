import React from "react";
import { TableCell, TableBody, TableRow } from "@windmill/react-ui";
import { FiTruck, FiClock, FiMapPin, FiEdit3 } from "react-icons/fi";

const Invoice = ({ data, currency, getNumberTwo, deliveryInfo }) => {
  return (
    <>
      <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 text-serif text-sm ">
        {data?.cart?.map((item, i) => (
          <TableRow key={i} className="dark:border-gray-700 dark:text-gray-400">
            <TableCell className="px-6 py-1 whitespace-nowrap font-normal text-gray-500 text-left">
              {i + 1}{" "}
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap font-normal text-gray-500">
              <span
                className={`text-gray-700 font-semibold dark:text-gray-300 text-xs ${item.title.length > 15 ? "wrap-long-title" : ""
                  }`}
              >
                {item.title}
              </span>
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap font-bold text-center">
              {item.quantity}{" "}
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap font-bold text-center">
              {getNumberTwo(item.price)}
              {currency}
            </TableCell>

            <TableCell className="px-6 py-1 whitespace-nowrap text-right font-bold text-red-500 dark:text-emerald-500">
              {getNumberTwo(item.itemTotal)}
              {currency}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      {/* ✅ Add Delivery Information Section to Invoice */}
      {deliveryInfo && (
        <TableBody className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableCell colSpan={5} className="px-6 py-4">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <FiTruck className="mr-2 text-emerald-500" />
                  Delivery Information
                </h4>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Delivery Type */}
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{deliveryInfo.typeLabel}</p>
                  </div>

                  {/* Date */}
                  {(deliveryInfo.preferredDate || deliveryInfo.estimatedDate) && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {deliveryInfo.preferredDate ? "Scheduled:" : "Estimated:"}
                      </span>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">
                        {deliveryInfo.preferredDate ? deliveryInfo.preferredDateFormatted : deliveryInfo.estimatedDateFormatted}
                      </p>
                    </div>
                  )}

                  {/* Time Slot */}
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Time:</span>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{deliveryInfo.timeSlotLabel}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${deliveryInfo.statusColor}`}>
                      {deliveryInfo.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Delivery Notes */}
                {deliveryInfo.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-600 dark:text-gray-400 flex items-center text-xs">
                      <FiEdit3 className="mr-1" />
                      Delivery Notes:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100 text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {deliveryInfo.notes}
                    </p>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      )}
    </>
  );
};

export default Invoice;