"use client";

import { useState, useMemo, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { DateTime } from "luxon";
import MeetingCard from "./MeetingCard";
import { FiCalendar } from "react-icons/fi";

/* =====================================================
   GLOBAL TIME CONFIG
===================================================== */
const USER_TIMEZONE = "Asia/Kolkata";

/* =====================================================
   HELPERS (SAFE)
===================================================== */
// JS Date from DayPicker is already local — DO NOT override zone
const toISODate = (date) => {
  if (!date) return null;
  return DateTime.fromJSDate(date).toISODate();
};

/* =====================================================
   COMPONENT
===================================================== */
const ScheduledMeeting = ({ meetings }) => {
  /* ================= STATE ================= */
  const [selected, setSelected] = useState(() => new Date());
  const [isListVisible, setIsListVisible] = useState(true);

  // 🔴 CRITICAL FIX FOR VERCEL SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDateSelect = (date) => {
    if (date) setSelected(date);
  };

  /* =====================================================
     CALENDAR MARKED DATES (MULTI-DAY SAFE)
  ===================================================== */
  const meetingDateObjects = useMemo(() => {
    return meetings.flatMap((meeting) => {
      const dates = [];

      const start = DateTime.fromISO(meeting.check_in, { zone: "utc" })
        .setZone(USER_TIMEZONE)
        .startOf("day");

      const end = DateTime.fromISO(meeting.check_out, { zone: "utc" })
        .setZone(USER_TIMEZONE)
        .startOf("day");

      let current = start;

      while (current <= end) {
        dates.push(current.toJSDate());
        current = current.plus({ days: 1 });
      }

      return dates;
    });
  }, [meetings]);

  /* =====================================================
     FILTER MEETINGS FOR SELECTED DAY
  ===================================================== */
  const filteredMeetings = useMemo(() => {
    if (!selected) return [];

    const selectedISO = toISODate(selected);

    return meetings.filter((meeting) => {
      const startISO = DateTime.fromISO(meeting.check_in, { zone: "utc" })
        .setZone(USER_TIMEZONE)
        .toISODate();

      const endISO = DateTime.fromISO(meeting.check_out, { zone: "utc" })
        .setZone(USER_TIMEZONE)
        .toISODate();

      return selectedISO >= startISO && selectedISO <= endISO;
    });
  }, [meetings, selected]);

  /* =====================================================
     ANIMATION TRIGGER
  ===================================================== */
  useEffect(() => {
    setIsListVisible(false);
    const timer = setTimeout(() => setIsListVisible(true), 100);
    return () => clearTimeout(timer);
  }, [selected]);

  /* =====================================================
     TITLE (TODAY VS OTHER DAY)
  ===================================================== */
  const title = useMemo(() => {
    if (!selected) return "Select a date";

    const todayISO = DateTime.now().setZone(USER_TIMEZONE).toISODate();

    const selectedISO = toISODate(selected);

    return selectedISO === todayISO
      ? "Meetings Today"
      : `Meetings on ${DateTime.fromJSDate(selected).toFormat("dd MMM yyyy")}`;
  }, [selected]);

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="flex flex-col md:flex-row lg:flex-col gap-6 lg:items-center">
      {/* ================= MEETING LIST ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit p-4 w-full md:w-1/2 lg:w-full">
        <h2 className="text-lg font-bold text-gray-900 text-center border-b border-gray-100 pb-3 mb-4">
          {title}
        </h2>

        {filteredMeetings.length > 0 ? (
          <div className="space-y-4 overflow-y-auto pr-2">
            {filteredMeetings.map((meeting, index) => (
              <div
                key={meeting.$id}
                className={`transition-all duration-300 ease-in-out ${
                  isListVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <MeetingCard meeting={meeting} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FiCalendar className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-3 text-sm">No meetings scheduled for this date.</p>
          </div>
        )}
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit flex justify-center w-full md:w-1/2 lg:w-full">
        {mounted && (
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            modifiers={{ hasMeeting: meetingDateObjects }}
            modifiersStyles={{
              hasMeeting: {
                backgroundColor: "#E0E7FF",
                color: "#3730A3",
                fontWeight: "bold",
              },
            }}
            className="p-4"
          />
        )}
      </div>
    </div>
  );
};

export default ScheduledMeeting;
