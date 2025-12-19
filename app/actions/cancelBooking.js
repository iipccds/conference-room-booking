"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";

async function cancelBooking(bookingId) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    const { user } = await checkAuth();

    if (!user) {
      return { error: "You must be logged in to cancel bookings" };
    }

    // Get the booking to check its ownership
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    // --- ESSENTIAL SECURITY CHECK ---
    // A user can only cancel if they are the owner OR they are an admin.
    if (booking.user_id !== user.id && user.role !== "admin") {
      return {
        error: "You are not authorized to cancel this booking.",
      };
    }
    // --- END OF CHECK ---

    // If the check passes, delete the booking
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    revalidatePath("/bookings", "layout"); // Corrected this line

    return { success: true };
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return { error: "Failed to cancel booking. Please try again later." };
  }
}

export default cancelBooking;
