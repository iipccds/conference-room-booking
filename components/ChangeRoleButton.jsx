"use client";
import React, { useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { makeAdmin, makeUser } from "@/app/actions/changeRole";
import { FaUser, FaUserShield } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

const ChangeRoleButton = ({ user }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMakeAdmin = () => {
    if (!confirm(`Are you sure you want to make ${user.name} an admin?`)) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await makeAdmin(user.$id);
        if (result.success) {
          toast.success("Role changed to Admin successfully");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to change role.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleMakeUser = () => {
    if (
      !confirm(`Are you sure you want to change ${user.name} back to a user?`)
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await makeUser(user.$id);
        if (result.success) {
          toast.success("Role changed to User successfully");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to change role.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Unexpected error occurred");
      }
    });
  };

  if (user.role === "admin") {
    return (
      <button
        onClick={handleMakeUser}
        disabled={isPending}
        // Removed the fixed `w-32` class. Padding now controls the width.
        className="flex items-center justify-center bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <FiLoader className="animate-spin h-5 w-5" />
        ) : (
          <>
            <FaUser className="mr-2 h-4 w-4" />
            Make User
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleMakeAdmin}
      disabled={isPending}
      // Removed the fixed `w-32` class. Padding now controls the width.
      className="flex items-center justify-center bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <FiLoader className="animate-spin h-5 w-5" />
      ) : (
        <>
          <FaUserShield className="mr-2 h-4 w-4" />
          Make Admin
        </>
      )}
    </button>
  );
};

export default ChangeRoleButton;
