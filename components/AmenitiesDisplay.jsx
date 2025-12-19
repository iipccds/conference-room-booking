// components/AmenitiesDisplay.jsx

import React from "react";
// All the necessary icons are imported and defined here
import {
  FiCast,
  FiTv,
  FiEdit3,
  FiWifi,
  FiCoffee,
  FiVideo,
  FiMic,
  FiClipboard,
  FiSpeaker,
  FiCheckCircle,
  FiMonitor,
} from "react-icons/fi";

// The mapping is now part of this self-contained component
const amenityIconMap = {
  projector: <FiCast className="h-4 w-4 text-purple-500" />,
  television: <FiTv className="h-4 w-4 text-purple-500" />,
  whiteboard: <FiEdit3 className="h-4 w-4 text-gray-500" />,
  wifi: <FiWifi className="h-4 w-4 text-blue-500" />,
  coffee: <FiCoffee className="h-4 w-4 text-yellow-600" />,
  "video conferencing": <FiVideo className="h-4 w-4 text-cyan-500" />,
  podium: <FiMic className="h-4 w-4 text-red-500" />,
  pantry: <FiClipboard className="h-4 w-4 text-indigo-500" />,
  "audio system": <FiSpeaker className="h-4 w-4 text-red-500" />,
  "smart screen": <FiMonitor className="h-4 w-4 text-purple-500" />,
};

const defaultIcon = <FiCheckCircle className="h-4 w-4 text-green-500" />;

const AmenitiesDisplay = ({ amenities }) => {
  // A safety check to prevent errors if amenities are not a string
  if (typeof amenities !== "string" || amenities.trim() === "") {
    return null; // Don't render anything if there are no amenities
  }

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {amenities.split(",").map((amenity) => {
          const trimmedAmenity = amenity.trim();
          if (!trimmedAmenity) return null; // Skip empty strings

          const icon =
            amenityIconMap[trimmedAmenity.toLowerCase()] || defaultIcon;

          return (
            <div
              key={trimmedAmenity}
              className="flex items-center gap-2 text-sm"
            >
              {icon}
              <span className="text-gray-700">{trimmedAmenity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AmenitiesDisplay;
