"use server";

import { createAdminClient } from "@/config/appwrite";
import checkAuth from "./checkAuth";
import { Query } from "node-appwrite";
import { cookies } from "next/headers";

export const getUser = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
    return null;
  }

  const { user } = await checkAuth();
  if (!user) return null;

  try {
    const { databases } = await createAdminClient(sessionCookie.value);
    const { documents } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      [Query.equal("user_id", user.id)]
    );

    return documents[0] || null;
  } catch (error) {
    console.error("Failed to fetch user document:", error);
    return null;
  }
};
