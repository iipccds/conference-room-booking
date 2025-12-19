"use client";
import confirmBooking from "@/app/actions/confirmBooking";
import { toast } from "react-toastify";

const ConfirmBookingButton = ({ bookingId }) => {
  const handleConfirmClick = async () => {
    if (!confirm("Are you sure you want to Confirm this booking?")) {
      return;
    }

    try {
      const result = await confirmBooking(bookingId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success("Booking confirmed successfully");
      }
    } catch (error) {
      console.log("Error confirming booking:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <button
      onClick={handleConfirmClick}
      className="bg-green-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto text-center hover:bg-red-700 transition-colors text-sm font-medium"
    >
      Confirm
    </button>
  );
};
export default ConfirmBookingButton;
