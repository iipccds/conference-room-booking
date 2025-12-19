"use server";
import { createAdminClient } from "@/config/appwrite";
import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

async function createUser(previousState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirm-password");
  const phone_no = formData.get("phone_no");
  const employee_id = Number(formData.get("employee_id"));
  const division = formData.get("division");

  if (!name || !email || !password || !phone_no || !employee_id || !division) {
    return {
      error: "All fields are required.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 6 characters long.",
    };
  }
  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
    };
  }

  //Get account Instance
  const { databases, account } = await createAdminClient();

  try {
    //crete user
    const user = await account.create(ID.unique(), email, password, name);

    const newUser = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE, // Replace with your database ID
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS, // Replace with your collection ID
      ID.unique(),
      {
        user_id: user.$id,
        role: "user",
        email: email,
        name: name,
        phone_no: phone_no,
        employee_id: employee_id,
        division: division,
        is_verified: false,
      }
    );

    revalidatePath("/users");

    return {
      success: true,
    };
  } catch (error) {
    console.log("Error creating user:", error);

    return {
      error: "Failed to create user. Please try again.",
    };
  }
}

export default createUser;
