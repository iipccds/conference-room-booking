"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "react-toastify";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import rescheduleBooking from "@/app/actions/rescheduleBooking";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";

// --- Helper Functions ---

const normalizeDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TIME_OPTIONS_AMPM = [
  "08:00 AM",
  "08:15 AM",
  "08:30 AM",
  "08:45 AM",
  "09:00 AM",
  "09:15 AM",
  "09:30 AM",
  "09:45 AM",
  "10:00 AM",
  "10:15 AM",
  "10:30 AM",
  "10:45 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
  "12:15 PM",
  "12:30 PM",
  "12:45 PM",
  "01:00 PM",
  "01:15 PM",
  "01:30 PM",
  "01:45 PM",
  "02:00 PM",
  "02:15 PM",
  "02:30 PM",
  "02:45 PM",
  "03:00 PM",
  "03:15 PM",
  "03:30 PM",
  "03:45 PM",
  "04:00 PM",
  "04:15 PM",
  "04:30 PM",
  "04:45 PM",
  "05:00 PM",
  "05:15 PM",
  "05:30 PM",
  "05:45 PM",
  "06:00 PM",
  "06:15 PM",
  "06:30 PM",
  "06:45 PM",
  "07:00 PM",
  "07:15 PM",
  "07:30 PM",
  "07:45 PM",
  "08:00 PM",
  "08:15 PM",
  "08:30 PM",
  "08:45 PM",
  "09:00 PM",
];

const convertTo24Hour = (time12h) => {
  if (typeof time12h !== "string" || !time12h.includes(" ")) return "";
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== "12") hours = parseInt(hours, 10) + 12;
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const convertTo12Hour = (time24h) => {
  if (!time24h) return "";
  const [hours, minutes] = time24h.split(":");
  const h = parseInt(hours, 10);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour.toString().padStart(2, "0")}:${minutes} ${period}`;
};

const timeToMinutes = (time) => {
  if (typeof time !== "string" || !time.includes(":")) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const START_OF_TODAY = new Date();
// Adjust to UTC start of day to match server-side date handling
START_OF_TODAY.setUTCHours(0, 0, 0, 0);

// --- Submit Button ---

function SubmitButton({ isOverCapacity }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || isOverCapacity}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <>
          <FiLoader className="animate-spin w-5 h-5 mr-3" />
          Rescheduling...
        </>
      ) : (
        "Reschedule Booking"
      )}
    </button>
  );
}

// --- Main Form Component ---

const RescheduleBookingForm = ({ booking, room, bookedDates = [] }) => {
  const [state, formAction] = useActionState(rescheduleBooking, {});
  const router = useRouter();

  // Pre-fill state from the existing booking
  const [checkInDate, setCheckInDate] = useState(new Date(booking.check_in));
  const [checkOutDate, setCheckOutDate] = useState(new Date(booking.check_out));
  const [checkInTime, setCheckInTime] = useState(
    convertTo12Hour(booking.check_in.split("T")[1].slice(0, 5))
  );
  const [checkOutTime, setCheckOutTime] = useState(
    convertTo12Hour(booking.check_out.split("T")[1].slice(0, 5))
  );
  const [attendees, setAttendees] = useState(booking.attendees);
  const [eventName, setEventName] = useState(booking.event_name);

  // Fetched data state
  const [bookedSlotsCheckIn, setBookedSlotsCheckIn] = useState([]);
  const [bookedSlotsCheckOut, setBookedSlotsCheckOut] = useState([]);
  // State for disabling past times
  const [now, setNow] = useState(new Date());
  const isOverCapacity = attendees > room.capacity;

  const fetchBookedSlots = useCallback(
    async (date, setSlots) => {
      if (!date) {
        setSlots([]);
        return;
      }
      const dateStr = normalizeDate(date);
      try {
        // Exclude the current booking from the slots check
        const res = await fetch(
          `/api/rooms/${room.$id}/bookedSlots?date=${dateStr}&exclude=${booking.$id}`
        );
        if (!res.ok) throw new Error("Failed to fetch slots");
        setSlots(await res.json());
      } catch {
        setSlots([]);
      }
    },
    [room.$id, booking.$id]
  );

  useEffect(() => {
    fetchBookedSlots(checkInDate, setBookedSlotsCheckIn);
  }, [checkInDate, fetchBookedSlots]);

  useEffect(() => {
    fetchBookedSlots(checkOutDate, setBookedSlotsCheckOut);
  }, [checkOutDate, fetchBookedSlots]);

  const markedBookedDates = useMemo(
    () =>
      bookedDates
        .filter((dateStr) => {
          const originalCheckIn = normalizeDate(new Date(booking.check_in));
          const originalCheckOut = normalizeDate(new Date(booking.check_out));
          return dateStr < originalCheckIn || dateStr > originalCheckOut;
        })
        .map((dateStr) => new Date(dateStr + "T00:00:00")),
    [bookedDates, booking.check_in, booking.check_out]
  );

  const isCheckInTimeBooked = useMemo(() => {
    const bookedMinutes = new Set();
    const selectedDay = normalizeDate(checkInDate);

    bookedSlotsCheckIn.forEach(({ check_in, check_out }) => {
      const bookingStartDate = check_in.split("T")[0];
      const bookingEndDate = check_out.split("T")[0];
      let startMinutes, endMinutes;
      if (bookingStartDate === bookingEndDate) {
        startMinutes = timeToMinutes(check_in.split("T")[1].slice(0, 5));
        endMinutes = timeToMinutes(check_out.split("T")[1].slice(0, 5));
      } else {
        if (selectedDay === bookingStartDate) {
          startMinutes = timeToMinutes(check_in.split("T")[1].slice(0, 5));
          endMinutes = 24 * 60;
        } else if (selectedDay === bookingEndDate) {
          startMinutes = 0;
          endMinutes = timeToMinutes(check_out.split("T")[1].slice(0, 5));
        } else {
          startMinutes = 0;
          endMinutes = 24 * 60;
        }
      }
      for (let m = startMinutes; m < endMinutes; m += 15) {
        bookedMinutes.add(m);
      }
    });

    const todayStr = normalizeDate(now);
    const isToday = selectedDay === todayStr;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (timeAMPM) => {
      if (!timeAMPM) return false;
      const minutes = timeToMinutes(convertTo24Hour(timeAMPM));
      if (isToday && minutes < currentMinutes) return true;
      return bookedMinutes.has(minutes);
    };
  }, [bookedSlotsCheckIn, checkInDate, now]);

  const isCheckOutTimeBooked = useMemo(() => {
    const isSameDay =
      checkInDate &&
      checkOutDate &&
      normalizeDate(checkInDate) === normalizeDate(checkOutDate);
    const checkInMinutes = timeToMinutes(convertTo24Hour(checkInTime));
    const selectedDay = normalizeDate(checkOutDate);
    const bookedMinutes = new Set();

    bookedSlotsCheckOut.forEach(({ check_in, check_out }) => {
      const bookingStartDate = check_in.split("T")[0];
      const bookingEndDate = check_out.split("T")[0];
      let startMinutes, endMinutes;
      if (bookingStartDate === bookingEndDate) {
        startMinutes = timeToMinutes(check_in.split("T")[1].slice(0, 5));
        endMinutes = timeToMinutes(check_out.split("T")[1].slice(0, 5));
      } else {
        if (selectedDay === bookingStartDate) {
          startMinutes = timeToMinutes(check_in.split("T")[1].slice(0, 5));
          endMinutes = 24 * 60;
        } else if (selectedDay === bookingEndDate) {
          startMinutes = 0;
          endMinutes = timeToMinutes(check_out.split("T")[1].slice(0, 5));
        } else {
          startMinutes = 0;
          endMinutes = 24 * 60;
        }
      }
      for (let m = startMinutes; m < endMinutes; m += 15) {
        bookedMinutes.add(m); // Corrected from 'minutes' to 'm'
      }
    });

    let nextBookingStartMinutes = Infinity;
    if (isSameDay && checkInTime) {
      // Find the earliest start time of a booking that is AFTER the selected check-in time.
      const upcomingBookings = bookedSlotsCheckOut.filter(
        (b) =>
          timeToMinutes(b.check_in.split("T")[1].slice(0, 5)) > checkInMinutes
      );

      if (upcomingBookings.length > 0) {
        nextBookingStartMinutes = Math.min(
          ...upcomingBookings.map((b) =>
            timeToMinutes(b.check_in.split("T")[1].slice(0, 5))
          )
        );
      }
    }

    return (timeAMPM) => {
      if (!timeAMPM) return false;
      const minutes = timeToMinutes(convertTo24Hour(timeAMPM));

      // NEW: Disable past times for the checkout on the current day
      const todayStr = normalizeDate(now);
      const isToday = selectedDay === todayStr;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (isToday && minutes < currentMinutes) return true;

      if (isSameDay && checkInTime && minutes <= checkInMinutes) return true;
      if (isSameDay && checkInTime && minutes > nextBookingStartMinutes)
        return true;

      if (bookedMinutes.has(minutes)) {
        const isExactStartTime = bookedSlotsCheckOut.some((b) => {
          const bookingStartDate = b.check_in.split("T")[0];
          if (bookingStartDate !== selectedDay) return false;
          const startMins = timeToMinutes(b.check_in.split("T")[1].slice(0, 5));
          return startMins === minutes;
        });

        if (isExactStartTime) return false;
        return true;
      }
      return false;
    };
  }, [bookedSlotsCheckOut, checkInDate, checkOutDate, checkInTime, now]);

  const disabledDaysForCheckout = useMemo(() => {
    if (!checkInDate) {
      return { before: START_OF_TODAY };
    }
    const sortedBookedDates = [...markedBookedDates].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    let nextBookedDate = null;
    for (const bookedDate of sortedBookedDates) {
      if (bookedDate > checkInDate) {
        nextBookedDate = bookedDate;
        break;
      }
    }
    const disabledConditions = [{ before: checkInDate }];
    if (nextBookedDate) {
      disabledConditions.push({ after: nextBookedDate });
    }
    return disabledConditions;
  }, [checkInDate, markedBookedDates]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success(state.message || "Booking rescheduled successfully!");
      router.refresh();
      setTimeout(() => window.location.reload(), 1000);
    }
  }, [state, router]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border mt-6 max-w-4xl mx-auto">
      <form action={formAction}>
        <input type="hidden" name="booking_id" value={booking.$id} />
        <input type="hidden" name="room_id" value={room.$id} />
        <input
          type="hidden"
          name="check_in_date"
          value={normalizeDate(checkInDate)}
        />
        <input
          type="hidden"
          name="check_out_date"
          value={normalizeDate(checkOutDate)}
        />
        <input
          type="hidden"
          name="check_in_time"
          value={convertTo24Hour(checkInTime)}
        />
        <input
          type="hidden"
          name="check_out_time"
          value={convertTo24Hour(checkOutTime)}
        />
        <input type="hidden" name="attendees" value={attendees} />

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="event_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event Name
              </label>
              <input
                type="text"
                id="event_name"
                name="event_name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="attendees"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Attendees (Capacity: {room.capacity})
              </label>
              <input
                type="number"
                id="attendees"
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Description & Meeting Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meeting Description
              </label>
              <textarea
                id="description"
                name="meeting_description"
                rows="3"
                defaultValue={booking.meeting_description || ""}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Optional: Agenda, notes, etc."
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="meeting_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meeting Type
              </label>
              <select
                id="meeting_type"
                name="meeting_type"
                defaultValue={booking.meeting_type || "Internal"}
                className="w-full p-2 border bg-white border-gray-300 rounded-md"
              >
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </div>
          </div>

          {isOverCapacity && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <FiAlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Attendees cannot exceed room capacity.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-In Date
              </label>
              <DayPicker
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                disabled={{ before: START_OF_TODAY }}
                modifiers={{ booked: markedBookedDates }}
                modifiersStyles={{
                  booked: { color: "red", backgroundColor: "#FFEAEA" },
                }}
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-Out Date
              </label>
              <DayPicker
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                disabled={disabledDaysForCheckout}
                modifiers={{ booked: markedBookedDates }}
                modifiersStyles={{
                  booked: { color: "red", backgroundColor: "#FFEAEA" },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="check_in_time_ui"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Check-In Time
              </label>
              <select
                id="check_in_time_ui"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                disabled={!checkInDate}
                className="w-full p-2 border bg-white border-gray-300 rounded-md"
                required
              >
                <option value="">Select time</option>
                {TIME_OPTIONS_AMPM.map((time) => {
                  const isBooked = isCheckInTimeBooked(time);
                  return (
                    <option key={`in-${time}`} value={time} disabled={isBooked}>
                      {time} {isBooked ? "(Booked/Past)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label
                htmlFor="check_out_time_ui"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Check-Out Time
              </label>
              <select
                id="check_out_time_ui"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                disabled={!checkOutDate}
                className="w-full p-2 border bg-white border-gray-300 rounded-md"
                required
              >
                <option value="">Select time</option>
                {TIME_OPTIONS_AMPM.map((time) => {
                  const isBooked = isCheckOutTimeBooked(time);
                  return (
                    <option
                      key={`out-${time}`}
                      value={time}
                      disabled={isBooked}
                    >
                      {time} {isBooked ? "(Booked/Invalid)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <SubmitButton isOverCapacity={isOverCapacity} />
        </div>
      </form>
    </div>
  );
};

export default RescheduleBookingForm;
