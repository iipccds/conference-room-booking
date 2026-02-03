import React from "react";
import Link from "next/link";
import RejectBookingButton from "@/components/RejectBookingButton";
import ConfirmBookingButton from "./ConfirmBookingButton";
import { DateTime } from "luxon";
import DeleteBookingButton from "./DeleteBookingButton";
// Import the new and existing icons
import {
  FaCalendarCheck,
  FaUser,
  FaInfoCircle,
  FaRegClock,
} from "react-icons/fa";
import { FiHome, FiUsers, FiInfo } from "react-icons/fi";

// Define timezone constant for consistency
const USER_TIMEZONE = "Asia/Kolkata";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return DateTime.fromISO(dateString, { zone: "utc" })
    .setZone(USER_TIMEZONE)
    .toFormat("MMM d 'at' h:mm a");
};

// StatusBadge component remains unchanged.
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    Confirmed: "bg-green-100 text-green-800 border border-green-200",
    Declined: "bg-red-100 text-red-800 border border-red-200",
    Delayed: "bg-orange-100 text-orange-800 border border-orange-200", // Example for a new status
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

// --- NEW: Map booking status to very light background colors ---
const cardBackgroundStyles = {
  Pending: "bg-yellow-50",
  Confirmed: "bg-green-50",
  Declined: "bg-red-50",
  Delayed: "bg-orange-50", // Example for a new status
};

function BookedRoomCardAdmin({ booking }) {
  const { room_id: room } = booking;

  // A booking is actionable by an admin only if its check-in time is in the future.
  const isActionable =
    DateTime.fromISO(booking.check_in, { zone: "utc" }) > DateTime.utc();

  // Get the appropriate background class
  const cardBgClass =
    cardBackgroundStyles[booking.booking_status] || "bg-white";

  return (
    // CARD CONTAINER: Dynamically apply the background class here
    <div
      className={`${cardBgClass} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-300`}
    >
      {/* --- CARD HEADER: Title and Status --- */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-start gap-4">
        <h4 className="text-lg font-bold text-gray-800 leading-tight">
          {booking.event_name}
        </h4>
        <div className="flex-shrink-0">
          <StatusBadge status={booking.booking_status} />
        </div>
      </div>

      {/* --- CARD BODY: Booking Details --- */}
      <div className="p-6 flex-grow">
        <div className="mb-4">
          <p className="flex items-center text-md font-semibold text-gray-700">
            <FiHome className="mr-2 h-4 w-4 text-purple-500" />
            {room.name}
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <p className="flex items-start">
            <FaCalendarCheck className="mr-3 mt-1 h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 leading-relaxed">
              <strong className="text-gray-800">From:</strong>{" "}
              {formatDate(booking.check_in)}
              <br />
              <strong className="text-gray-800">To:</strong>{" "}
              {formatDate(booking.check_out)}
            </span>
          </p>
          <p className="flex items-center">
            <FaUser className="mr-3 h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              <strong className="text-gray-800">Booked By:</strong>{" "}
              {booking.user_name}
            </span>
          </p>
          <p className="flex items-center">
            <FiUsers className="mr-3 h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              <strong className="text-gray-800">Attendees:</strong>{" "}
              {booking.attendees}
            </span>
          </p>
          <p className="flex items-center">
            <FiHome className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0" />
            <span className="text-gray-600">
              <strong className="text-gray-800">Type:</strong>{" "}
              {booking.meeting_type || "Internal"}
            </span>
          </p>
          {/* Description */}
          <p className="flex items-start">
            <FaInfoCircle className="mr-3 mt-1 h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Description:</strong>{" "}
              {booking.meeting_description || "No description provided."}
            </span>
          </p>
          {/* Created At */}
          <p className="flex items-start">
            <FaRegClock className="mr-3 mt-1 h-5 w-5 text-teal-500 flex-shrink-0" />
            <span className="text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Requested on:</strong>{" "}
              {formatDate(booking.request_time)}
            </span>
          </p>
          {/* Action Time (Confirmed/Declined) */}
          {booking.confirm_cancel_time &&
            (booking.booking_status === "Confirmed" ||
              booking.booking_status === "Declined") && (
              <p className="flex items-start">
                <FaCalendarCheck
                  className={`mr-3 mt-1 h-5 w-5 ${
                    booking.booking_status === "Confirmed"
                      ? "text-green-500"
                      : "text-red-500"
                  } flex-shrink-0`}
                />
                <span className="text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">
                    {booking.booking_status} on:
                  </strong>{" "}
                  {formatDate(booking.confirm_cancel_time)}
                </span>
              </p>
            )}
          {/* Cancellation Reason */}
          {booking.booking_status === "Declined" &&
            booking.cancellation_reason && (
              <p className="flex items-start p-2 bg-red-100/50 rounded-md border border-red-200/80">
                <FaInfoCircle className="mr-3 mt-1 h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-800 leading-relaxed">
                  {booking.cancellation_reason}
                </span>
              </p>
            )}
        </div>
      </div>

      {/* --- CARD FOOTER: Action Buttons --- */}
      <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-200">
        <div className="flex justify-end items-center gap-3">
          <Link
            href={`/rooms/${room.$id}`}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            View Room
          </Link>

          {/* Conditional action buttons */}
          {isActionable && booking.booking_status === "Pending" && (
            <>
              <ConfirmBookingButton bookingId={booking.$id} />
              <RejectBookingButton bookingId={booking.$id} />
            </>
          )}
          {isActionable && booking.booking_status === "Confirmed" && (
            <RejectBookingButton bookingId={booking.$id} />
          )}
          {/* Show delete button if booking is Declined OR if it's in the past */}
          {(booking.booking_status === "Declined" || !isActionable) &&
            booking.booking_status !== "Pending" && (
              <DeleteBookingButton bookingId={booking.$id} />
            )}
        </div>
      </div>
    </div>
  );
}

export default BookedRoomCardAdmin;
