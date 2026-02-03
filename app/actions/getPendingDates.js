"use server";
import { createAdminClient } from "@/config/appwrite";
import { Query } from "node-appwrite";

export async function getPendingDates(roomId) {
  const { databases } = await createAdminClient();

  // Query bookings for the specific room ID using Appwrite Query helper
  const bookings = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
    [Query.equal("room_id", roomId), Query.equal("booking_status", "Pending")],
  );

  const pendingDates = [];

  // Expand each booking's date range from check_in to check_out into individual booked dates
  bookings.documents.forEach((booking) => {
    // Fix: Convert UTC booking times to IST date strings to ensure correct day is blocked
    const checkInDateStr = new Date(booking.check_in).toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
      },
    );
    const checkOutDateStr = new Date(booking.check_out).toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
      },
    );

    let currentDate = new Date(checkInDateStr);
    const endDate = new Date(checkOutDateStr);

    while (currentDate <= endDate) {
      pendingDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  // Remove duplicate dates if any
  return Array.from(new Set(pendingDates));
}
