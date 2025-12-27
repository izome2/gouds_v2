import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiTruck, FiEdit3 } from "react-icons/fi";
import { Controller } from "react-hook-form";

const DeliverySchedule = ({ register, errors, setValue, watch, control }) => {
    const [deliveryType, setDeliveryType] = useState("standard");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("anytime");

    // Watch for form values
    const watchedDate = watch("preferredDate");
    const watchedDeliveryType = watch("deliveryType");

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Get maximum date (2 weeks from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 14);
        return maxDate.toISOString().split('T')[0];
    };

    // Time slots
    const timeSlots = [
        { value: "anytime", label: "Anytime", description: "12:00 AM - 8:00 PM" },
        { value: "afternoon", label: "Afternoon", description: "12:00 PM - 5:00 PM" },
        { value: "evening", label: "Evening", description: "5:00 PM - 8:00 PM" },
    ];

    // Delivery options
    const deliveryOptions = [
        {
            value: "standard",
            label: "Standard Delivery",
            description: "1-2 business days",
            price: "",
            icon: FiTruck,
        },
        {
            value: "scheduled",
            label: "Scheduled Delivery",
            description: "Choose your preferred date",
            price: "",
            icon: FiCalendar,
        },
    ];

    const handleDeliveryTypeChange = (type) => {
        setDeliveryType(type);
        setValue("deliveryType", type);

        // Reset date if not scheduled delivery
        if (type !== "scheduled") {
            setValue("preferredDate", "");
        }
    };

    const handleTimeSlotChange = (timeSlot) => {
        setSelectedTimeSlot(timeSlot);
        setValue("preferredTimeSlot", timeSlot);
    };

    // Initialize form values
    useEffect(() => {
        setValue("deliveryType", deliveryType);
        setValue("preferredTimeSlot", selectedTimeSlot);
    }, []);

    return (
        <div className="space-y-6">
            {/* Delivery Options */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiTruck className="mr-2" />
                    Delivery Options
                </h3>

                <div className="grid gap-4">
                    {deliveryOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <div
                                key={option.value}
                                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${deliveryType === option.value
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                                onClick={() => handleDeliveryTypeChange(option.value)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <IconComponent className={`text-xl ${deliveryType === option.value ? "text-emerald-600" : "text-gray-400"
                                            }`} />
                                        <div>
                                            <h4 className="font-medium text-gray-900">{option.label}</h4>
                                            <p className="text-sm text-gray-500">{option.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-sm font-medium ${deliveryType === option.value ? "text-emerald-600" : "text-gray-500"
                                            }`}>
                                            {option.price}
                                        </span>
                                        <input
                                            type="radio"
                                            name="deliveryType"
                                            value={option.value}
                                            checked={deliveryType === option.value}
                                            onChange={() => handleDeliveryTypeChange(option.value)}
                                            className="form-radio text-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scheduled Delivery Details */}
            {deliveryType === "scheduled" && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                        <FiCalendar className="mr-2" />
                        Schedule Your Delivery
                    </h4>

                    {/* Date Picker using Controller */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Date
                        </label>
                        <Controller
                            name="preferredDate"
                            control={control}
                            rules={{
                                required: deliveryType === "scheduled" ? "Please select a delivery date" : false
                            }}
                            render={({ field }) => (
                                <input
                                    type="date"
                                    min={getMinDate()}
                                    // max={getMaxDate()}
                                    {...field}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            )}
                        />
                        {errors.preferredDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.preferredDate.message}</p>
                        )}
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Time Slot
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot) => (
                                <div
                                    key={slot.value}
                                    className={`relative rounded-md border p-3 cursor-pointer transition-all duration-200 ${selectedTimeSlot === slot.value
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    onClick={() => handleTimeSlotChange(slot.value)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-900">{slot.label}</h5>
                                            <p className="text-xs text-gray-500">{slot.description}</p>
                                        </div>
                                        <input
                                            type="radio"
                                            name="preferredTimeSlot"
                                            value={slot.value}
                                            checked={selectedTimeSlot === slot.value}
                                            onChange={() => handleTimeSlotChange(slot.value)}
                                            className="form-radio text-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiEdit3 className="inline mr-1" />
                    Notes
                </label>
                <textarea
                    rows={3}
                    placeholder="Any special instructions..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 placeholder-gray-400"
                    {...register("deliveryNotes", {
                        maxLength: {
                            value: 500,
                            message: "Delivery notes must be less than 500 characters"
                        }
                    })}
                />
                {errors.deliveryNotes && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryNotes.message}</p>
                )}
            </div>

            {/* Delivery Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Delivery Summary</h4>
                <div className="text-sm text-blue-800">
                    {deliveryType === "standard" && (
                        <p>📦 Your order will be delivered within 2-3 business days</p>
                    )}
                    {deliveryType === "scheduled" && watchedDate && (
                        <p>📅 Your order will be delivered on {new Date(watchedDate).toLocaleDateString()} during {timeSlots.find(slot => slot.value === selectedTimeSlot)?.label}</p>
                    )}
                    {deliveryType === "scheduled" && !watchedDate && (
                        <p>📅 Please select your preferred delivery date</p>
                    )}
                </div>
            </div>

            {/* Hidden inputs for form submission */}
            <input type="hidden" {...register("deliveryType")} value={deliveryType} />
            <input type="hidden" {...register("preferredTimeSlot")} value={selectedTimeSlot} />
        </div>
    );
};

export default DeliverySchedule;