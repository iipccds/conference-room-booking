"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import { toast } from "react-toastify";
import cancelBooking from "@/app/actions/cancelBooking";
import { FiLoader } from "react-icons/fi";

const CancelBookingButton = ({ bookingId }) => {
  const router = useRouter(); // 2. Initialize the router
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        toast.success("Booking cancelled successfully");
        router.refresh(); // 3. Refresh the UI on success
      } else {
        toast.error(result.error || "Failed to cancel booking.");
      }
    } catch (error) {
      console.log("Error cancelling booking:", error);
      toast.error("Failed to cancel booking. Please try again later.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancelClick}
      disabled={isCancelling}
      className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed "
    >
      {isCancelling ? <FiLoader className="animate-spin w-5 h-5" /> : "Cancel"}
    </button>
  );
};

export default CancelBookingButton;
