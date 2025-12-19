"use client";

import { useState, useEffect, useTransition } from "react";
import updateUser from "@/app/actions/updateUser";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const ProfileForm = ({ user }) => {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone_no || "");
  const [employeeId, setEmployeeId] = useState(user?.employee_id || "");
  const [division, setDivision] = useState(user?.division || "");
  const [isPending, startTransition] = useTransition();
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const initialName = user?.name || "";
    const initialPhone = user?.phone_no ? String(user.phone_no) : "";
    const currentPhone = String(phone);
    const initialEmployeeId = user?.employee_id ? String(user.employee_id) : "";
    const currentEmployeeId = String(employeeId);
    const initialDivision = user?.division || "";

    setIsChanged(
      name !== initialName ||
        currentPhone !== initialPhone ||
        currentEmployeeId !== initialEmployeeId ||
        division !== initialDivision
    );
  }, [name, phone, employeeId, division, user]);

  const handleSubmit = (formData) => {
    startTransition(async () => {
      const result = await updateUser(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success("Your user profile is updated");
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={user?.email}
              disabled
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone_no"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <div className="mt-1">
            <PhoneInput
              country={"in"}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              inputClass="!w-full !py-2 !px-3 !pl-[48px] !text-gray-900 !border !border-gray-300 !rounded-md !shadow-sm focus:!ring-2 focus:!ring-inset focus:!ring-indigo-600 focus:!border-indigo-600 sm:!text-sm sm:!leading-6"
              containerClass="!w-full"
              buttonClass="!border-gray-300 !rounded-l-md hover:!bg-gray-50"
              dropdownClass="!shadow-lg !rounded-md"
            />
            {/* Hidden input to pass the raw value to the server action */}
            <input
              type="hidden"
              name="phone_no"
              value={
                phone && !String(phone).startsWith("+") ? "+" + phone : phone
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="employee_id"
            className="block text-sm font-medium text-gray-700"
          >
            Employee ID
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="employee_id"
              id="employee_id"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="division"
            className="block text-sm font-medium text-gray-700"
          >
            Division
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="division"
              id="division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              User ID
            </span>
            <span
              className="mt-1 block text-sm text-gray-900 font-mono truncate"
              title={user?.user_id}
            >
              {user?.user_id}
            </span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </span>
            <span className="mt-1 block text-sm text-gray-900 capitalize">
              {user?.role}
            </span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </span>
            <span
              className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.is_verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {user?.is_verified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!isChanged || isPending}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            !isChanged || isPending
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
