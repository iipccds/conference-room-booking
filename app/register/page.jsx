"use client";
import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import createUser from "@/app/actions/createUser";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const RegisterPage = () => {
  const [state, formAction] = useActionState(createUser, {});
  const [phone, setPhone] = useState("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success("Registration successful!");
      router.push("/login");
    }
    // Correctly include router in the dependency array
  }, [state, router]);

  const handleSubmit = (formData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 w-full max-w-2xl">
        <form action={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your details to register
            </p>
          </div>

          {/* Name - Full Width */}
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
                id="name"
                name="name"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                required
              />
            </div>
          </div>

          {/* Grid for Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  id="email"
                  name="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
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
                  inputClass="!w-full !py-2 !px-3 !pl-[48px] !text-gray-900 !border !border-gray-300 !rounded-md !shadow-sm focus:!ring-2 focus:!ring-inset focus:!ring-blue-500 focus:!border-blue-500 sm:!text-sm sm:!leading-6"
                  containerClass="!w-full"
                  buttonClass="!border-gray-300 !rounded-l-md hover:!bg-gray-50"
                  dropdownClass="!shadow-lg !rounded-md"
                />
                <input
                  type="hidden"
                  name="phone_no"
                  value={phone ? "+" + phone : ""}
                />
              </div>
            </div>
          </div>

          {/* Grid for Employee ID and Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  id="employee_id"
                  name="employee_id"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
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
                  id="division"
                  name="division"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Grid for Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                isPending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isPending ? "Registering..." : "Register"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
