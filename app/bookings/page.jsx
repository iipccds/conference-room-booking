import React from "react";
import Heading from "@/components/Heading";
import BookedRoomCard from "@/components/BookedRoomCard";
import getMyBookings from "@/app/actions/getMyBookings";

const BookingsPage = async () => {
  const bookings = await getMyBookings();
  //<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Heading title="My Bookings" />
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto mt-6">
          {bookings.map((booking) => (
            <BookedRoomCard key={booking.$id} booking={booking} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 mt-4 max-w-7xl mx-auto ">
          {" "}
          Sorry, You Have no bookings.
        </p>
      )}
    </div>
  );
};

export default BookingsPage;
