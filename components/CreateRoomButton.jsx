"use client";
import { useFormStatus } from "react-dom";
import { FiLoader } from "react-icons/fi";

// This component uses the useFormStatus hook to get the pending state of the form it's inside.
export function CreateRoomButton({ buttonText }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending} // Disable the button while the form is submitting
      className="flex w-36 items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? <FiLoader className="animate-spin h-5 w-5" /> : buttonText}
    </button>
  );
}
