"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiEdit2, FiX, FiLoader } from "react-icons/fi";
import RescheduleBookingForm from "./RescheduleBookingForm";
import { getBookedDates } from "@/app/actions/getBookedDates";

function RescheduleBookingButton({ booking }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const fetchDates = async () => {
        const dates = await getBookedDates(booking.room_id.$id);
        setBookedDates(dates);
        setIsLoading(false);
      };
      fetchDates();
    }
  }, [isOpen, booking.room_id.$id]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center justify-center gap-2 
                   border border-blue-500 text-blue-600 
                   bg-white 
                   px-4 py-2 rounded-lg 
                   hover:bg-blue-50 hover:border-blue-600 
                   transition-colors text-sm font-medium"
        aria-label="Reschedule booking"
      >
        <FiEdit2 className="h-4 w-4" />
        <span>Edit</span>
      </button>

      {isClient &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
            onClick={closeModal}
          >
            <div
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-50"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Reschedule: {booking.event_name}
              </h3>
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <FiLoader className="animate-spin text-blue-500 w-10 h-10" />
                </div>
              ) : (
                <RescheduleBookingForm
                  booking={booking}
                  room={booking.room_id}
                  bookedDates={bookedDates}
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default RescheduleBookingButton;
