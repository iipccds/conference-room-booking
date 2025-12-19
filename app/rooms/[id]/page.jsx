import React from "react";
import BookingForm from "@/components/BookingForm";
import getSingleRoom from "@/app/actions/getSingleRoom";
import Heading from "@/components/Heading";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUsers,
  FiMaximize,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import { getBookedDates } from "@/app/actions/getBookedDates";
import { getPendingDates } from "@/app/actions/getPendingDates";
import ScheduledMeeting from "@/components/ScheduledMeeting";
import getBookingSchedule from "@/app/actions/getBookingSchedule";
import AmenitiesDisplay from "@/components/AmenitiesDisplay";

const RoomPage = async ({ params }) => {
  const { id } = await params;
  const room = await getSingleRoom(id);

  if (!room) {
    return <Heading title="Room Not Found" />;
  }

  const bucketID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const imageUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/${bucketID}/files/${room.image}/view?project=${projectID}`;
  const imageSrc = room.image ? imageUrl : "/images/no-image.jpg";

  const bookedDates = await getBookedDates(id);
  const pendingDates = await getPendingDates(id);
  const meetings = await getBookingSchedule(id);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 px-4 sm:px-6 lg:px-8 py-8">
      <main>
        <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-6 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 group"
          >
            <FiArrowLeft
              className="mr-2 text-blue-500 group-hover:-translate-x-1 transition-transform"
              size={20}
            />
            Back to All Rooms
          </Link>

          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="w-full md:w-1/2 flex items-center">
              <Image
                src={imageSrc}
                alt={room.name}
                width={800}
                height={600}
                className="w-full h-auto max-h-[450px] object-cover rounded-lg shadow-md"
                priority
              />
            </div>

            <div className="w-full md:w-1/2 mt-6 md:mt-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                {room.name}
              </h1>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {room.description}
              </p>

              <hr className="my-6 border-gray-200" />

              {/* --- MODIFIED: DetailItem logic is now directly inlined here --- */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Location */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiMapPin className="text-indigo-500 h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-500">
                      Location
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-800">
                      {room.location}
                    </p>
                  </div>
                </div>

                {/* Size */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiMaximize className="text-green-500 h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-500">Size</p>
                    <p className="mt-1 text-base font-semibold text-gray-800">
                      {room.sqft} sq ft
                    </p>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiUsers className="text-purple-500 h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-500">
                      Capacity
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-800">
                      {room.capacity} people
                    </p>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiCalendar className="text-orange-500 h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-500">
                      Availability
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-800">
                      {room.availability}
                    </p>
                  </div>
                </div>
              </div>

              <AmenitiesDisplay amenities={room.amenities} />
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          <BookingForm
            room={room}
            bookedDates={bookedDates}
            pendingDates={pendingDates}
          />
        </div>
      </main>

      <aside className="space-y-8 mt-8 lg:mt-0">
        <ScheduledMeeting meetings={meetings} />
      </aside>
    </div>
  );
};

export default RoomPage;

// import React from "react";
// import BookingForm from "@/components/BookingForm";
// import getSingleRoom from "@/app/actions/getSingleRoom";
// import Heading from "@/components/Heading";
// import Image from "next/image";
// import Link from "next/link";
// // Using Fi icons for consistency and broader choice of modern icons
// import {
//   FiArrowLeft,
//   FiUsers,
//   FiMaximize,
//   FiClipboard,
//   FiCalendar,
//   FiMapPin,
// } from "react-icons/fi";
// import { getBookedDates } from "@/app/actions/getBookedDates";
// import ScheduledMeeting from "@/components/ScheduledMeeting";
// import getBookingSchedule from "@/app/actions/getBookingSchedule";
// import AmenitiesDisplay from "@/components/AmenitiesDisplay";

// const RoomPage = async ({ params }) => {
//   const { id } = await params;
//   const room = await getSingleRoom(id);

//   if (!room) {
//     return <Heading title="Room Not Found" />;
//   }

//   const bucketID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
//   const projectID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
//   const imageUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/${bucketID}/files/${room.image}/view?project=${projectID}`;
//   const imageSrc = room.image ? imageUrl : "/images/no-image.jpg";

//   const bookedDates = await getBookedDates(id);
//   const meetings = await getBookingSchedule(id);

//   return (
//     <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 px-4 sm:px-6 lg:px-8 py-6">
//       <main>
//         <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-8">
//           <Link
//             href="/"
//             className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8 group"
//           >
//             <FiArrowLeft
//               className="mr-2 text-blue-500 group-hover:-translate-x-1 transition-transform"
//               size={20}
//             />
//             Back to All Rooms
//           </Link>

//           <div className="flex flex-col sm:flex-row sm:space-x-8">
//             <div className="w-full sm:w-1/2 flex items-center justify-center p-0">
//               <Image
//                 src={imageSrc}
//                 alt={room.name}
//                 width={1000}
//                 height={700}
//                 className="w-full h-auto object-cover rounded-lg shadow-md"
//                 priority
//               />
//             </div>

//             <div className="mt-6 sm:mt-0 sm:w-1/2">
//               {/* CHANGE: Added 'text-center' to center the room name */}
//               <h1 className="text-4xl font-extrabold text-gray-900 mb-3 leading-tight text-center">
//                 {room.name}
//               </h1>
//               {/* CHANGE: Centered the description for consistency */}
//               <p className="text-gray-700 leading-relaxed text-lg mb-6">
//                 {room.description}
//               </p>

//               {/* CHANGE: Removed the "Room Details" h3 heading */}
//               <ul className="space-y-4 text-gray-700 mt-8">
//                 <li className="flex items-center">
//                   <FiMapPin className="mr-4 text-indigo-500" size={22} />
//                   <span className="font-semibold text-gray-800 w-24">
//                     Location:
//                   </span>
//                   <span className="ml-2">{room.location}</span>
//                 </li>
//                 <li className="flex items-center">
//                   <FiMaximize className="mr-4 text-green-500" size={22} />
//                   <span className="font-semibold text-gray-800 w-24">
//                     Size:
//                   </span>
//                   <span className="ml-2">{room.sqft} sq ft</span>
//                 </li>
//                 <li className="flex items-center">
//                   <FiUsers className="mr-4 text-purple-500" size={22} />
//                   <span className="font-semibold text-gray-800 w-24">
//                     Capacity:
//                   </span>
//                   <span className="ml-2">{room.capacity} people</span>
//                 </li>
//                 <li className="flex items-center">
//                   <FiCalendar className="mr-4 text-orange-500" size={22} />
//                   <span className="font-semibold text-gray-800 w-24">
//                     Availability:
//                   </span>
//                   <span className="ml-2">{room.availability}</span>
//                 </li>
//                 <li className="flex items-center">
//                   <FiClipboard className="mr-4 text-red-500" size={22} />
//                   <span className="font-semibold text-gray-800 w-24">
//                     Amenities:
//                   </span>
//                   <span className="ml-2">
//                     <AmenitiesDisplay amenities={room.amenities} />
//                   </span>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <hr className="my-10 border-gray-200" />

//           <BookingForm room={room} bookedDates={bookedDates} />
//         </div>
//       </main>

//       <aside className="space-y-6 mt-12 lg:mt-0">
//         <ScheduledMeeting meetings={meetings} />
//       </aside>
//     </div>
//   );
// };

// export default RoomPage;
