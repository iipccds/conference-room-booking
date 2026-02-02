// app/actions/bookRoom.js

"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";
import { revalidatePath } from "next/cache";
import checkRoomAvailability from "./checkRoomAvailability";

async function bookRoom(previousState, formData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { user } = await checkAuth();
    if (!user) {
      return { error: "You must be logged in to book a room." };
    }

    // --- VERIFICATION CHECK ---
    if (!user.is_verified) {
      return {
        error: "Please get your account verified by an admin to book a room.",
      };
    }

    // 1. --- EXTRACT DATA ---
    const checkInDate = formData.get("check_in_date");
    const checkInTime = formData.get("check_in_time");
    const checkOutDate = formData.get("check_out_date");
    const checkOutTime = formData.get("check_out_time");
    const eventName = formData.get("event_name");
    const roomId = formData.get("room_id");
    const roomName = formData.get("room_name");
    const attendees = Number(formData.get("attendees"));
    const meeting_description = formData.get("meeting_description");
    const meeting_type = formData.get("meeting_type");
    const adminEmail = formData.get("admin_email");

    // 2. --- VALIDATE ALL INPUTS ---
    if (
      !checkInDate ||
      !checkInTime ||
      !checkOutDate ||
      !checkOutTime ||
      !eventName ||
      !roomId
    ) {
      return { error: "All fields are required." };
    }

    if (!Number.isFinite(attendees) || attendees < 1) {
      return { error: "Attendees must be at least 1." };
    }

    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

    if (new Date(checkInDateTime) >= new Date(checkOutDateTime)) {
      return { error: "Check-out must be after check-in." };
    }

    // 3. --- PROCEED WITH CORE LOGIC ---
    const availabilityResult = await checkRoomAvailability(
      roomId,
      checkInDateTime,
      checkOutDateTime,
    );
    if (!availabilityResult.available) {
      return { error: availabilityResult.error };
    }

    const bookingData = {
      check_in: checkInDateTime,
      check_out: checkOutDateTime,
      user_id: user.id,
      user_name: user.name,
      room_id: roomId,
      event_name: eventName,
      attendees: attendees,
      booking_status: "Pending",
      meeting_description: meeting_description,
      meeting_type: meeting_type,
      request_time: new Date()
        .toLocaleString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(", ", "T"),
    };
    console.log(bookingData);
    const { databases } = await createSessionClient(sessionCookie.value);
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      ID.unique(),
      bookingData,
    );

    revalidatePath("/bookings", "layout");
    // ----------------- SEND EMAIL TO ADMIN -----------------
    const emailData = {
      ...bookingData,
      room_name: roomName,
      check_in: new Date(checkInDateTime).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      check_out: new Date(checkOutDateTime).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      adminEmail: adminEmail,
    };
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/email/bookingRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    return { success: true, warning: availabilityResult.warning };
  } catch (error) {
    console.log("Failed to book rooms", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export default bookRoom;
