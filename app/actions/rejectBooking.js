"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";
import { Query } from "node-appwrite";

async function rejectBooking(bookingId, reason) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    const { user } = await checkAuth();

    if (!user || user.role !== "admin") {
      return { error: "You are not authorized to perform this action." };
    }

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        booking_status: "Declined",
        cancellation_reason: reason,
        confirm_cancel_time: new Date()
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
      }
    );

    revalidatePath("/bookings", "layout");
    revalidatePath("/requests", "layout");

    // 1️⃣ Get updated booking info to include in email
    const bookingToCancel = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    // 2️⃣ Query user details to find their email for the notification
    const userResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      [Query.equal("user_id", bookingToCancel.user_id)]
    );

    if (userResponse.documents.length === 0) {
      return {
        error: "Could not find user to send rejection email.",
      };
    }
    const userDocument = userResponse.documents[0];

    const emailData = {
      ...bookingToCancel,
      user_email: userDocument.email,
      room_name: bookingToCancel.room_id.name, // Use the room's name
      check_in: new Date(bookingToCancel.check_in).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      check_out: new Date(bookingToCancel.check_out).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    // 3️⃣ Send rejection email
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/email/bookingStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to reject booking:", error);
    return { error: "Failed to reject booking. Please try again later." };
  }
}

export default rejectBooking;
