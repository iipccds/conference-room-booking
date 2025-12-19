"use server";

import { createAdminClient } from "@/config/appwrite";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import checkAuth from "./checkAuth";
import { Query } from "node-appwrite";

async function updateUser(formData) {
  const name = formData.get("name");
  const phone_no = formData.get("phone_no");
  const employee_id = Number(formData.get("employee_id"));
  const division = formData.get("division");

  const { user } = await checkAuth();

  if (!user) {
    return {
      error: "You must be logged in to update your profile",
    };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");

  try {
    const { databases } = await createAdminClient(sessionCookie.value);

    // Get user document to find the ID
    const { documents } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      [Query.equal("user_id", user.id)]
    );

    if (documents.length === 0) {
      return { error: "User not found" };
    }

    const docId = documents[0].$id;

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      docId,
      {
        name: name,
        phone_no: phone_no,
        employee_id: employee_id,
        division: division,
      }
    );

    revalidatePath("/profile");

    return {
      success: true,
    };
  } catch (error) {
    console.log("Failed to update user", error);
    return {
      error: "Failed to update user",
    };
  }
}

export default updateUser;
