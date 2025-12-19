"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";

async function deleteBooking(bookingId) {
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
        error: "You must be logged in to perform this action.",
      };
    }

    // --- CRITICAL AUTHORIZATION CHECK ---
    // Ensure that only an admin can delete a booking.
    if (user.role !== "admin") {
      return {
        error: "Only admins can delete bookings.",
      };
    }
    // --- END OF CHECK ---

    // If the check passes, proceed with deletion.
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    revalidatePath("/bookings", "layout"); // Corrected syntax

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return {
      error: "Failed to delete booking. Please try again later.",
    };
  }
}

export default deleteBooking;
