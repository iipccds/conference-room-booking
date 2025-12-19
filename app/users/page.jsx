import React from "react";
import Heading from "@/components/Heading";
import getAllUser from "@/app/actions/getAllUser";
import UserCard from "@/components/UserCard";

const ManageUsers = async () => {
  const users = await getAllUser();
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Heading title="All Users Profile" />
      {users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {users.map((user) => (
            <UserCard key={user.$id} user={user} />
          ))}
        </div>
      ) : (
        <p>NO User Available</p>
      )}
    </div>
  );
};

export default ManageUsers;
