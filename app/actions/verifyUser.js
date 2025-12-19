// app/actions/verifyUser.js
"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";

async function verifyUser(userId) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    const { user } = await checkAuth();

    if (user?.role !== "admin") {
      return { error: "You must be an admin to verify users." };
    }

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      userId,
      {
        is_verified: true,
      }
    );

    revalidatePath("/users"); // Or your admin/manage-users path
    return { success: true };
  } catch (error) {
    console.error("Failed to verify user", error);
    return { error: "Failed to verify user. Please try again later." };
  }
}

export default verifyUser;
