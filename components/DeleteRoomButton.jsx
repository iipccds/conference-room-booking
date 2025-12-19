"use client";
import React, { useState } from "react"; // Import useState
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { FiLoader } from "react-icons/fi"; // Import the loader icon
import deleteRoom from "@/app/actions/deleteRoom";

const DeleteRoomButton = ({ roomId, disabled }) => {
  // Accept the disabled prop
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room? This action cannot be undone."
    );
    if (confirmed) {
      setIsDeleting(true); // Start loading
      try {
        const response = await deleteRoom(roomId);
        if (response.success) {
          toast.success("Room deleted successfully!");
          // You might want to refresh or redirect here
        } else if (response.error) {
          // If the server sent back an error, display it
          toast.error("You are not authorized to delete this room.");
        }
      } catch (error) {
        console.log("Failed to delete room", error);
        toast.error("Failed to delete room. Please try again.");
      } finally {
        setIsDeleting(false); // Stop loading, regardless of outcome
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting || disabled} // Disable if deleting or if a parent action is running
      className="flex w-28 items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? (
        <FiLoader className="animate-spin w-5 h-5" />
      ) : (
        <>
          <FaTrash className="mr-2" /> Delete
        </>
      )}
    </button>
  );
};

export default DeleteRoomButton;
