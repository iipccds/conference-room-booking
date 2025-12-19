"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import rejectBooking from "@/app/actions/rejectBooking";
import { toast } from "react-toastify";

const RejectBookingButton = ({ bookingId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to ensure portal is only created on the client-side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // When the component mounts, we know we're on the client.
    setIsClient(true);
  }, []);

  const handleSubmitRejection = async () => {
    if (!reason.trim()) {
      toast.error("A reason for rejection is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await rejectBooking(bookingId, reason.trim());
      if (result.success) {
        toast.success("Booking rejected successfully");
        // Close modal and reset reason on success
        setIsModalOpen(false);
        setReason("");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.log("Error rejecting booking:", error);
      toast.error("Failed to reject booking. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className=" text-white px-4 py-2 rounded-lg w-full sm:w-auto text-center bg-red-500 hover:bg-red-700 transition-colors text-sm font-medium"
      >
        Reject
      </button>

      {isClient &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${
              isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
                isModalOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div
              className={`bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4 z-10 transform transition-all duration-300 ease-in-out ${
                isModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Reason for Rejection
              </h2>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this booking..."
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setReason("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRejection}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Rejection"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
export default RejectBookingButton;
