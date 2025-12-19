"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";

async function checkRoomAvailability(
  roomId,
  checkIn,
  checkOut,
  excludeBookingId = null
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    const queries = [
      Query.equal("room_id", roomId),
      Query.notEqual("booking_status", "Declined"), // Exclude declined bookings
      Query.lessThan("check_in", checkOut),
      Query.greaterThan("check_out", checkIn),
    ];

    if (excludeBookingId) {
      queries.push(Query.notEqual("$id", excludeBookingId));
    }

    // This efficient query now does all the hard work.
    // It fetches all bookings that conflict and are either 'Confirmed' or 'Pending'.
    const { documents: conflictingBookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      queries
    );

    // Loop through all conflicting bookings to check their status
    for (const booking of conflictingBookings) {
      // If any booking is 'Confirmed', it's a hard conflict.
      if (booking.booking_status === "Confirmed") {
        return {
          available: false,
          error: "Room is already booked for an event.",
        };
      }
    }

    // Check if there are any pending bookings after checking for confirmed ones.
    const hasPendingConflict = conflictingBookings.some(
      (b) => b.booking_status === "Pending"
    );

    if (hasPendingConflict) {
      return {
        available: true,
        warning:
          "Your request has been submitted, but there is another pending booking for this time.",
      };
    }

    // If the query returned no documents, the room is available.
    return { available: true };
  } catch (error) {
    console.log("Failed to check Availability", error);
    return {
      available: false,
      error: "Failed to check room availability. Please try again later.",
    };
  }
}

export default checkRoomAvailability;

// "use server";

// import { createSessionClient } from "@/config/appwrite";
// import { cookies } from "next/headers";
// import { Query } from "node-appwrite";
// import { redirect } from "next/navigation";
// import { DateTime } from "luxon";

// function toUTCDateTime(dateString) {
//   return DateTime.fromISO(dateString, { zone: "utc" }).toUTC();
// }

// //Check for overlapping date ranges
// function dateRangesOverlap(checkInA, checkOutA, checkInB, checkOutB) {
//   return checkInA < checkOutB && checkOutA > checkInB;
// }

// async function checkRoomAvailability(roomId, checkIn, checkOut) {
//   const cookieStore = await cookies();
//   const sessionCookie = cookieStore.get("appwrite-session");

//   if (!sessionCookie) {
//     redirect("/login");
//   }

//   try {
//     const { databases } = await createSessionClient(sessionCookie.value);
//     const checkInDateTime = toUTCDateTime(checkIn);
//     const checkOutDateTime = toUTCDateTime(checkOut);

//     //Fetch all bookings for a given room
//     const { documents: bookings } = await databases.listDocuments(
//       process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
//       process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
//       [
//         Query.equal("room_id", roomId),
//         Query.notEqual("booking_status", "declined"),
//         Query.lessThan("check_in", checkOut), // Find existing bookings that start before the new one ends
//         Query.greaterThan("check_out", checkIn),
//       ] // Find existing bookings that end after the new one starts
//     );

//     //Loop through bookings to check for conflicts
//     for (const booking of bookings) {
//       const bookingCheckInDateTime = toUTCDateTime(booking.check_in);
//       const bookingCheckOutDateTime = toUTCDateTime(booking.check_out);

//       // Check if the requested dates overlap with any existing booking
//       if (
//         dateRangesOverlap(
//           checkInDateTime,
//           checkOutDateTime,
//           bookingCheckInDateTime,
//           bookingCheckOutDateTime
//         )
//       ) {
//         // Overlap found, check the status and return a specific error
//         if (booking.booking_status === "confirm") {
//           return {
//             available: false,
//             error: "Room is already booked for an event.",
//           };
//         }
//         if (booking.booking_status === "pending") {
//           return {
//             available: false,
//             error: "There's already a booking request on this date.",
//           };
//         }
//         // Fallback for any other status
//         return {
//           available: false,
//           error: "The room is not available for the selected dates.",
//         };
//       }
//     }
//     // No overlaps found, room is available
//     return { available: true };
//   } catch (error) {
//     console.log("Failed to check Availability", error);
//     return {
//       available: false,
//       error: "Failed to check room availability. Please try again later.",
//     };
//   }
// }

// export default checkRoomAvailability;
