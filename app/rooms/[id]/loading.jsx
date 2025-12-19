// Create this file at: app/rooms/[id]/loading.jsx

import { FiLoader } from "react-icons/fi";

export default function RoomLoading() {
  // You can make this a more sophisticated skeleton component
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <FiLoader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800">
        Loading Room Details...
      </h2>
      <p className="text-gray-500">Please wait a moment.</p>
    </div>
  );
}
