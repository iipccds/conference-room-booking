import { getUser } from "@/app/actions/getUser";
import Heading from "@/components/Heading";
import ProfileForm from "@/components/ProfileForm";
import { FaUserCircle } from "react-icons/fa";

const ProfilePage = async () => {
  const user = await getUser();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Heading title="My Profile" />
      <div className="bg-white shadow-xl rounded-lg overflow-hidden mt-6 border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUserCircle className="h-20 w-20 text-gray-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user?.name}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
