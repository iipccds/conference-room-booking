import React from "react";
import Heading from "@/components/Heading";
import BookedRoomCardAdmin from "@/components/BookedRoomCardAdmin";
import getNewBookings from "../actions/getNewBookings";
import checkAuth from "../actions/checkAuth";

const RequestsPage = async () => {
  const bookings = await getNewBookings();
  const { user } = await checkAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Heading title="New Bookings Requests" />
      {bookings.length > 0 ? (
        // Grid container added here
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto mt-6">
          {bookings.map((booking) => {
            const { room_id: room } = booking;
            // Ensure room and room_manager exist before checking the user_id
            if (user.id !== room?.room_manager?.user_id) {
              return null; // Skip rendering if the user is not the room manager
            } else {
              return (
                <BookedRoomCardAdmin key={booking.$id} booking={booking} />
              );
            }
          })}
        </div>
      ) : (
        <p className="text-gray-600 mt-4 max-w-7xl mx-auto">
          {" "}
          You Have no bookings
        </p>
      )}
    </div>
  );
};

export default RequestsPage;
