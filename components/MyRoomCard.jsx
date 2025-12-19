import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaEye,
  FaEdit,
  FaUserTie,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import DeleteRoomButton from "./DeleteRoomButton"; // Assuming this component is in the same folder

import AmenitiesDisplay from "./AmenitiesDisplay";

const MyRoomCard = ({ room, user }) => {
  const bucketID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const imageUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/${bucketID}/files/${room.image}/view?project=${projectID}`;
  const imageSrc = room.image ? imageUrl : "/images/no-image.jpg";

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-200">
      {/* --- IMAGE & OVERLAY SECTION --- */}
      {/* This container uses 'relative' to position the overlay on top of the image. */}
      <div className="relative">
        <Image
          src={imageSrc}
          width={400}
          height={225}
          alt={room.name}
          className="w-full h-48 object-cover"
        />
        {/* This is the overlay. It sits on top of the image. */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h4 className="text-white text-xl font-bold drop-shadow-lg">
            {room.name}
          </h4>
          <p className="text-gray-200 text-sm flex items-center mt-1 drop-shadow-md">
            <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
            {room.location}
          </p>
        </div>
      </div>

      {/* --- Content Section (Capacity, Manager, Amenities) --- */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center">
            <FaUsers className="mr-2 text-gray-400 flex-shrink-0" />
            Seating Capacity:{" "}
            <span className="font-semibold text-gray-700 ml-1">
              {room.capacity}
            </span>
          </p>
          <p className="flex items-center">
            <FaUserTie className="mr-2 text-gray-400 flex-shrink-0" />
            Room Manager:{" "}
            {room.room_manager?.name ? (
              <span className="font-semibold text-gray-600 ml-1">
                {room.room_manager.name}
              </span>
            ) : (
              <span className="font-bold text-gray-600 ml-1">Assign</span>
            )}
          </p>
        </div>

        <hr className="my-4" />

        <h5 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h5>
        <AmenitiesDisplay amenities={room.amenities} />
      </div>

      {/* --- Action Buttons Section (Remains the same) --- */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end items-center gap-3">
          <Link
            href={`/rooms/${room.$id}`}
            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            <FaEye className="mr-2" /> View
          </Link>
          {user?.id === room.room_manager?.user_id && (
            <Link
              href={`/rooms/edit/${room.$id}`}
              className="flex items-center justify-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              <FaEdit className="mr-2" /> Edit
            </Link>
          )}
          <DeleteRoomButton roomId={room.$id} />
        </div>
      </div>
    </div>
  );
};

export default MyRoomCard;
