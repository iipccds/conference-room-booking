import Heading from "@/components/Heading";
import MyRoomCard from "@/components/MyRoomCard";
import getMyRooms from "@/app/actions/getMyRooms";
import checkAuth from "@/app/actions/checkAuth";

const MyRoomsPage = async () => {
  const rooms = await getMyRooms();
  const { user } = await checkAuth();
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Heading title="Manage Rooms" />
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {rooms.map((room) => (
            <MyRoomCard key={room.$id} room={room} user={user} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">No rooms listing found</p>
      )}
    </div>
  );
};

export default MyRoomsPage;

// {rooms.length > 0 ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
//           {rooms.map((room) => {
//             // Check if the current user is the room manager
//             if (room.room_manager?.user_id === user.id) {
//               return <MyRoomCard key={room.$id} room={room} />;
//             }
//             // If not the manager, don't render anything for this room
//             return null;
//           })}
//         </div>
//       ) : (
//         <p className="text-center text-gray-500 mt-8">No rooms listing found</p>
//       )}
