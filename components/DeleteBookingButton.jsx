"use client";
import React, { useTransition } from "react"; // 1. Import useTransition instead of useState
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import deleteBooking from "@/app/actions/deleteBooking";
import { FaTrash } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

const DeleteBookingButton = ({ bookingId }) => {
  const router = useRouter();
  // 2. Use the useTransition hook. 'isPending' is your new loading state.
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = () => {
    // No longer needs to be async
    if (!confirm("Are you sure you want to permanently delete this booking?")) {
      return;
    }

    // 3. Wrap the server action call in startTransition
    startTransition(async () => {
      const result = await deleteBooking(bookingId);
      if (result.success) {
        toast.success("Booking deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete booking.");
      }
    });
  };

  return (
    <button
      onClick={handleDeleteClick}
      disabled={isPending} // 4. Use isPending to disable the button
      className="flex items-center justify-center bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
      aria-label="Delete booking"
    >
      {isPending ? ( // 5. Use isPending to show the loader
        <FiLoader className="animate-spin w-5 h-5" />
      ) : (
        <FaTrash className="w-4 h-4" />
      )}
    </button>
  );
};

export default DeleteBookingButton;
