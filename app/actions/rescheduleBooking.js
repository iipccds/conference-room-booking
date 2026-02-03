"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";
import checkRoomAvailability from "./checkRoomAvailability";

export default async function rescheduleBooking(previousState, formData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const bookingId = formData.get("booking_id");
  if (!bookingId) {
    return { error: "Booking ID is missing." };
  }

  try {
    const { user } = await checkAuth();
    if (!user) {
      return { error: "You must be logged in to reschedule a room." };
    }

    // 1. --- EXTRACT & VALIDATE DATA ---
    const checkInDate = formData.get("check_in_date");
    const checkInTime = formData.get("check_in_time");
    const checkOutDate = formData.get("check_out_date");
    const checkOutTime = formData.get("check_out_time");
    const eventName = formData.get("event_name");
    const roomId = formData.get("room_id");
    const meeting_description = formData.get("meeting_description");
    const meeting_type = formData.get("meeting_type");
    const attendees = Number(formData.get("attendees"));

    if (
      !checkInDate ||
      !checkInTime ||
      !checkOutDate ||
      !checkOutTime ||
      !eventName
    ) {
      return { error: "All date, time, and event name fields are required." };
    }

    // Fix: Force IST timezone (+05:30) interpretation for inputs
    const checkInDateTime = new Date(
      `${checkInDate}T${checkInTime}+05:30`,
    ).toISOString();
    const checkOutDateTime = new Date(
      `${checkOutDate}T${checkOutTime}+05:30`,
    ).toISOString();

    if (new Date(checkInDateTime) >= new Date(checkOutDateTime)) {
      return { error: "Check-out must be after check-in." };
    }

    // // 2. --- CHECK AVAILABILITY (excluding the current booking) ---
    // const availabilityResult = await checkRoomAvailability(
    //   roomId,
    //   checkInDateTime,
    //   checkOutDateTime,
    //   bookingId // Pass bookingId to exclude it from conflict check
    // );

    // if (!availabilityResult.available) {
    //   return { error: availabilityResult.error };
    // }

    // 3. --- UPDATE THE BOOKING ---
    const { databases } = await createSessionClient(sessionCookie.value);
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        check_in: checkInDateTime,
        check_out: checkOutDateTime,
        event_name: eventName,
        attendees: attendees,
        meeting_description: meeting_description,
        meeting_type: meeting_type,
        booking_status: "Pending", // Status resets to Pending for re-approval
      },
    );
    // Get room & admin email
    const room = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      roomId,
    );

    const adminEmail = room.room_manager.email;

    revalidatePath("/bookings", "layout");

    // 📩 SEND RESCHEDULE EMAIL TO ADMIN
    const emailData = {
      user_name: user.name,
      check_in: checkInDateTime,
      check_out: checkOutDateTime,
      event_name: eventName,
      attendees: attendees,
      room_id: roomId,
      meeting_description: meeting_description,
      meeting_type: meeting_type,
      adminEmail: adminEmail,
      reschedule: true,

      // 🆕 formatted fields only for email
      check_in_formatted: new Date(checkInDateTime).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }),
      check_out_formatted: new Date(checkOutDateTime).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }),
    };

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/email/bookingRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });
    return {
      success: true,
      message: "Booking rescheduled! Your request is pending approval.",
    };
  } catch (error) {
    console.error("Failed to reschedule booking:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
