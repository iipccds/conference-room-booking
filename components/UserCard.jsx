"use client";

import React, { useTransition } from "react";
import { toast } from "react-toastify";
import ChangeRoleButton from "./ChangeRoleButton";
import DeleteUserButton from "./DeleteUserButton";
import verifyUser from "@/app/actions/verifyUser";
// Import new icons for user details
import { FaUserCircle, FaEnvelope, FaFingerprint } from "react-icons/fa";

// A small, reusable component for the color-coded role badge.
const RoleBadge = ({ role }) => {
  const is_admin = role === "admin";
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize border ${
        is_admin
          ? "bg-sky-100 text-sky-800 border-sky-200"
          : "bg-amber-100 text-amber-800 border-amber-200"
      }`}
    >
      {role}
    </span>
  );
};

const UserCard = ({ user }) => {
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    startTransition(async () => {
      const result = await verifyUser(user.$id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${user.name} has been verified.`);
      }
    });
  };

  return (
    // CARD CONTAINER: Stable vertical layout for grid consistency.
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-200">
      {/* --- CARD HEADER: User Name and Role Badge --- */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-start gap-4">
        <div className="flex items-center">
          <FaUserCircle className="h-8 w-8 text-gray-400 mr-3" />
          <h4 className="text-lg font-bold text-gray-800 leading-tight">
            {user.name}
          </h4>
        </div>
        <div className="flex-shrink-0 mt-1">
          <RoleBadge role={user.role} />
        </div>
      </div>
      <div className="px-5 pb-2">
        <div>
          {user.is_verified ? (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Verified
            </span>
          ) : (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Not Verified
            </span>
          )}
        </div>
      </div>

      {/* --- CARD BODY: User Details with Icons --- */}
      <div className="p-6 flex-grow">
        <div className="space-y-4 text-sm">
          <p className="flex items-center">
            <FaEnvelope className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              <strong className="text-gray-800">Email:</strong> {user.email}
            </span>
          </p>
          <p className="flex items-center">
            <FaFingerprint className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              <strong className="text-gray-800">User ID:</strong> {user.$id}
            </span>
          </p>
        </div>
      </div>

      {/* --- CARD FOOTER: Action Buttons --- */}
      <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
        <div className="flex justify-end items-center gap-3">
          {user.is_verified ? (
            <ChangeRoleButton user={user} />
          ) : (
            <button
              onClick={handleVerify}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPending ? "Verifying..." : "Verify User"}
            </button>
          )}
          <DeleteUserButton user={user} />
        </div>
      </div>
    </div>
  );
};

export default UserCard;
