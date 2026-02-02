"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";
import checkRoomAvailability from "./checkRoomAvailability";
import { Query } from "node-appwrite";

async function confirmBooking(bookingId) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    const { user } = await checkAuth();

    if (!user) {
      return {
        error: "You must be logged in to Confirm bookings",
      };
    }
    // 1. Get the booking being confirmed to check its details
    const bookingToConfirm = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
    );
    // 2. Check for conflicting CONFIRMED bookings before confirming this one.
    const availability = await checkRoomAvailability(
      bookingToConfirm.room_id.$id,
      bookingToConfirm.check_in,
      bookingToConfirm.check_out,
      bookingId, // Pass the current booking ID to exclude it from the check
    );

    if (!availability.available) {
      // The only error we can get here is a hard conflict, as pending conflicts return `available: true`.
      return { error: availability.error };
    }

    // 3. If available, update the booking status to "Confirmed"
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        booking_status: "Confirmed",
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
      },
    );

    revalidatePath("/bookings", "layout");

    // 4. Query user details to find their email for the notification
    const userResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      [Query.equal("user_id", bookingToConfirm.user_id)],
    );

    if (userResponse.documents.length === 0) {
      return {
        error: "Could not find user to send confirmation email.",
      };
    }
    const userDocument = userResponse.documents[0];

    const emailData = {
      ...bookingToConfirm,
      user_email: userDocument.email,
      room_name: bookingToConfirm.room_id.name, // Use the room's name
      check_in: new Date(bookingToConfirm.check_in).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      check_out: new Date(bookingToConfirm.check_out).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    // ---------------- SEND EMAIL TO USER ----------------
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/email/bookingStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log("Failed to confirm booking", error);
    return {
      error: "Failed to Confirm booking. Please try again later.",
    };
  }
}

export default confirmBooking;
