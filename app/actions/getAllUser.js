"use server";

import { createAdminClient } from "@/config/appwrite";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";

async function getAllUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    redirect("/login");
  }
  const { user } = await checkAuth();
  if (!user) {
    return {
      error: "you must be logged in to view bookings",
    };
  }

  try {
    const { databases } = await createAdminClient(sessionCookie.value);

    const { documents: users } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      [Query.notEqual("user_id", user.id)]
    );

    // Revalidate the cache for this path

    // revalidatePath("/", "layout");

    return users;
  } catch (error) {
    console.log("Failed to get users", error);
    redirect("/error");
  }
}

export default getAllUser;
