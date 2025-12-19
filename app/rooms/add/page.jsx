import CreateRoomForm from "@/components/CreateRoomForm";
import getAllAdmins from "@/app/actions/getAllAdmins";
import Heading from "@/components/Heading";
import checkAuth from "@/app/actions/checkAuth";

// This is a Server Component by default
export default async function CreateRoomPage() {
  // 1. Fetch the list of admins on the server
  const admins = await getAllAdmins();
  const user = await checkAuth();
  if (!user) {
    return (
      <Heading title="Unauthorized" subtitle="Please log in to continue." />
    );
  }

  // 2. Pass the fetched admins as a prop to the form component
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Heading title="Create New Room" />
      <CreateRoomForm user={user} admins={admins} />
    </div>
  );
}
