import { NextResponse } from "next/server";
import { createAdminClient } from "@/config/appwrite";
import { Query } from "node-appwrite";

export async function GET(req, context) {
  // Await params here
  const params = await context.params;
  const roomId = params.roomId;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const bookingToExclude = searchParams.get("exclude"); // Get the booking ID to exclude

  if (!date || !roomId) {
    return NextResponse.json(
      { error: "Date and Room ID are required" },
      { status: 400 }
    );
  }

  try {
    const { databases } = await createAdminClient();

    // Query bookings overlapping the date
    const startDateTime = `${date}T00:00:00Z`;
    const endDateTime = `${date}T23:59:59Z`;

    const queries = [
      Query.equal("room_id", roomId),
      Query.equal("booking_status", "Confirmed"),
      Query.lessThanEqual("check_in", endDateTime),
      Query.greaterThanEqual("check_out", startDateTime),
    ];

    // If a booking ID to exclude is provided, add it to the query
    if (bookingToExclude) {
      queries.push(Query.notEqual("$id", bookingToExclude));
    }

    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      queries
    );

    // Return bookings with only relevant time ranges
    const result = bookings.map((booking) => ({
      check_in: booking.check_in,
      check_out: booking.check_out,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
