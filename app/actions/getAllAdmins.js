"use server";

import { createAdminClient } from "@/config/appwrite";
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";

async function getAllAdmins() {
  try {
    const { databases } = await createAdminClient();

    const { documents: admins } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      [Query.equal("role", "admin")]
    );

    // Revalidate the cache for this path

    // revalidatePath("/", "layout");

    return admins;
  } catch (error) {
    console.log("Failed to get admins", error);
    redirect("/error");
  }
}

export default getAllAdmins;
