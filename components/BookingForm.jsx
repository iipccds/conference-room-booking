"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "react-toastify";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import bookRoom from "@/app/actions/bookRoom";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";
import { DateTime } from "luxon";

// --- 1. Helper Functions (Grouped at top) ---

const USER_TIMEZONE = "Asia/Kolkata";

const normalizeDate = (date) => {
  if (!date) return "";
  return DateTime.fromJSDate(date, { zone: USER_TIMEZONE }).toFormat(
    "yyyy-MM-dd",
  );
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
  if (modifier === "PM" && hours !== "12") hours = parseInt(hours, 10) + 12;
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const timeToMinutes = (time) => {
  if (typeof time !== "string" || !time.includes(":")) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Get the start of today, so the DayPicker doesn't disable today.
const START_OF_TODAY = DateTime.now()
  .setZone(USER_TIMEZONE)
  .startOf("day")
  .toJSDate();

// --- 2. Submit Button (Must be separate for useFormStatus) ---

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
          Booking...
        </>
      ) : (
        "Book Room"
      )}
    </button>
  );
}

// --- 3. Main BookingForm Component ---

const BookingForm = ({ room, bookedDates = [], pendingDates = [] }) => {
  // --- A. State Management ---

  const [state, formAction] = useActionState(bookRoom, {});
  const router = useRouter();

  // Form input state
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [attendees, setAttendees] = useState(1);

  // Fetched data state
  const [bookedSlotsCheckIn, setBookedSlotsCheckIn] = useState([]);
  const [bookedSlotsCheckOut, setBookedSlotsCheckOut] = useState([]);

  // State for disabling past times
  const [now, setNow] = useState(DateTime.now().setZone(USER_TIMEZONE));

  // Simple derived state
  const isOverCapacity = attendees > room.capacity;

  // --- B. Data Fetching ---

  const fetchBookedSlots = useCallback(
    async (date, setSlots) => {
      if (!date) {
        setSlots([]);
        return;
      }
      const dateStr = normalizeDate(date);
      try {
        const res = await fetch(
          `/api/rooms/${room.$id}/bookedSlots?date=${dateStr}`,
        );
        if (!res.ok) throw new Error("Failed to fetch booked slots");
        setSlots(await res.json());
      } catch {
        setSlots([]);
      }
    },
    [room.$id],
  );

  // Effect to fetch slots for Check-In Date
  useEffect(() => {
    fetchBookedSlots(checkInDate, setBookedSlotsCheckIn);
  }, [checkInDate, fetchBookedSlots]);

  // Effect to fetch slots for Check-Out Date
  useEffect(() => {
    fetchBookedSlots(checkOutDate, setBookedSlotsCheckOut);
  }, [checkOutDate, fetchBookedSlots]);

  // --- C. Memoized Business Logic ---

  // Convert bookedDates prop to Date objects for DayPicker
  const markedBookedDates = useMemo(
    () =>
      bookedDates.map((dateStr) => {
        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d);
      }),
    [bookedDates],
  );

  // Logic to determine which Check-In times are disabled
  const isCheckInTimeBooked = useMemo(() => {
    const bookedMinutes = new Set();
    const selectedDay = normalizeDate(checkInDate);
    // If now is not yet set (SSR), default to empty/false to avoid mismatch
    // if (!now) return () => false;

    bookedSlotsCheckIn.forEach(({ check_in, check_out }) => {
      const startDt = DateTime.fromISO(check_in, { zone: "utc" }).setZone(
        USER_TIMEZONE,
      );
      const endDt = DateTime.fromISO(check_out, { zone: "utc" }).setZone(
        USER_TIMEZONE,
      );

      const bookingStartDate = startDt.toFormat("yyyy-MM-dd");
      const bookingEndDate = endDt.toFormat("yyyy-MM-dd");

      let startMinutes, endMinutes;
      if (bookingStartDate === bookingEndDate) {
        startMinutes = startDt.hour * 60 + startDt.minute;
        endMinutes = endDt.hour * 60 + endDt.minute;
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

    // Check against 'now' state
    const todayStr = now.toFormat("yyyy-MM-dd");
    const isToday = selectedDay === todayStr;
    const currentMinutes = now.hour * 60 + now.minute;

    return (timeAMPM) => {
      if (!timeAMPM) return false;
      const minutes = timeToMinutes(convertTo24Hour(timeAMPM));
      if (isToday && minutes < currentMinutes) return true; // Rule 1: Is past
      return bookedMinutes.has(minutes); // Rule 2: Is booked
    };
  }, [bookedSlotsCheckIn, checkInDate, now]);

  // Logic to determine which Check-Out times are disabled
  const isCheckOutTimeBooked = useMemo(() => {
    const isSameDay =
      checkInDate &&
      checkOutDate &&
      normalizeDate(checkInDate) === normalizeDate(checkOutDate);
    const checkInMinutes = timeToMinutes(convertTo24Hour(checkInTime));
    const selectedDay = normalizeDate(checkOutDate);
    const bookedMinutes = new Set();

    bookedSlotsCheckOut.forEach(({ check_in, check_out }) => {
      const startDt = DateTime.fromISO(check_in, { zone: "utc" }).setZone(
        USER_TIMEZONE,
      );
      const endDt = DateTime.fromISO(check_out, { zone: "utc" }).setZone(
        USER_TIMEZONE,
      );

      const bookingStartDate = startDt.toFormat("yyyy-MM-dd");
      const bookingEndDate = endDt.toFormat("yyyy-MM-dd");

      let startMinutes, endMinutes;
      if (bookingStartDate === bookingEndDate) {
        startMinutes = startDt.hour * 60 + startDt.minute;
        endMinutes = endDt.hour * 60 + endDt.minute;
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

    let nextBookingStartMinutes = Infinity;
    if (isSameDay && checkInTime) {
      const sortedBookedStartTimes = bookedSlotsCheckOut
        .map((b) => timeToMinutes(b.check_in.split("T")[1].slice(0, 5)))
        .sort((a, b) => a - b);
      for (const startTime of sortedBookedStartTimes) {
        if (startTime > checkInMinutes) {
          nextBookingStartMinutes = startTime;
          break;
        }
      }
    }

    // --- MODIFIED (The 3:00 PM checkout fix) ---
    return (timeAMPM) => {
      if (!timeAMPM) return false;
      const minutes = timeToMinutes(convertTo24Hour(timeAMPM));

      // Rule 1: Disable if same day and before/at check-in time (Unchanged)
      if (isSameDay && checkInTime && minutes <= checkInMinutes) return true;

      // Rule 2: Disable if it's after the *next* booking on the same day (Unchanged)
      if (isSameDay && checkInTime && minutes > nextBookingStartMinutes)
        return true;

      // --- FIXED RULE 3 ---
      // Check if this time slot (e.g., 3:00 PM) is in the booked set.
      if (bookedMinutes.has(minutes)) {
        // If it is, we MUST allow it if it's the *start time* of a booking.

        // Check if `minutes` is an exact start time for any booking on this day
        const isExactStartTime = bookedSlotsCheckOut.some((b) => {
          const bookingStartDate = b.check_in.split("T")[0];
          // Only check bookings on the selected day
          if (bookingStartDate !== selectedDay) return false;

          const startDt = DateTime.fromISO(b.check_in, { zone: "utc" }).setZone(
            USER_TIMEZONE,
          );
          const startMins = startDt.hour * 60 + startDt.minute;

          return startMins === minutes;
        });

        // If it IS an exact start time, we are allowed to check out then.
        if (isExactStartTime) {
          return false; // Allow it (This enables the 3:00 PM slot)
        }

        // It's in the booked set, but not a start time (e.g., 3:30 PM),
        // so it's in the middle of a booking. Disable it.
        return true;
      }

      // Not in the booked set, not before check-in, not after next booking.
      return false;
    };
    // --- END MODIFIED ---
  }, [bookedSlotsCheckOut, checkInDate, checkOutDate, checkInTime]);

  // Logic for disabling days in the Check-Out calendar
  const disabledDaysForCheckout = useMemo(() => {
    if (!checkInDate) {
      return { before: START_OF_TODAY };
    }
    const sortedBookedDates = [...markedBookedDates].sort(
      (a, b) => a.getTime() - b.getTime(),
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

  // --- D. UI Effects ---

  // Effect to update 'now' state on a timer (for past time check)
  useEffect(() => {
    setNow(DateTime.now().setZone(USER_TIMEZONE)); // Update 'now' immediately on date change
    const isToday =
      normalizeDate(checkInDate) ===
      DateTime.now().setZone(USER_TIMEZONE).toFormat("yyyy-MM-dd");

    if (isToday) {
      const interval = setInterval(() => {
        setNow(DateTime.now().setZone(USER_TIMEZONE));
      }, 60000); // Re-check every 60 seconds
      return () => clearInterval(interval);
    }
  }, [checkInDate]);

  // Effect to show toasts based on form submission
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      if (state.warning) {
        toast.warn(state.warning, { autoClose: 8000 });
      } else {
        toast.success("Request raised successfully!");
      }
      router.push("/bookings");
    }
  }, [state, router]);

  // --- E. Render JSX ---

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Book this Conference Room
      </h2>
      <form action={formAction}>
        {/* Hidden inputs for form submission */}
        <input type="hidden" name="room_id" value={room.$id} />
        <input type="hidden" name="room_name" value={room.name} />
        <input
          type="hidden"
          name="admin_email"
          value={room.room_manager?.email || ""}
        />
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
          {/* Event Name & Attendees */}
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="attendees"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Attendees (Capacity: {room.capacity})
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
                className="w-full p-2 border bg-white border-gray-300 rounded-md"
              >
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </div>
          </div>

          {/* Capacity Warning */}
          {isOverCapacity && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <FiAlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Attendees cannot exceed room capacity.
              </span>
            </div>
          )}

          {/* Date Pickers */}
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

          {/* Time Selectors */}
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
                    <option key={time} value={time} disabled={isBooked}>
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
                    <option key={time} value={time} disabled={isBooked}>
                      {time} {isBooked ? "(Booked/Invalid)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t">
          <SubmitButton isOverCapacity={isOverCapacity} />
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
