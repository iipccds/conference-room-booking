import Heading from "@/components/Heading";
import getSingleRoom from "@/app/actions/getSingleRoom";
import EditRoomForm from "@/components/EditRoomForm";
import getAllAdmins from "@/app/actions/getAllAdmins";

export default async function EditRoomPage({ params }) {
  const { id } = await params;
  const room = await getSingleRoom(id);
  const admins = await getAllAdmins();
  if (!room) return <Heading title="Room Not Found" />;

  return (
    <>
      <Heading title="Edit Room" />
      <EditRoomForm room={room} admins={admins} />
    </>
  );
}
