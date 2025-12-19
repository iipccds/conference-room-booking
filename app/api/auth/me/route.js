// app/api/auth/me/route.js

import { createSessionClient } from "@/config/appwrite";
import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function GET(request) {
  try {
    const session = request.cookies.get("appwrite-session")?.value;
    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // 1. Get both 'account' and 'databases' from the client
    const { account, databases } = await createSessionClient(session);

    // 2. Get the authenticated user from Appwrite Auth
    const authUser = await account.get();

    // 3. Find the corresponding user profile in your database collection
    const { documents: userProfiles } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
      [Query.equal("user_id", authUser.$id)]
    );

    // 4. Handle case where the user has an auth session but no database profile
    if (userProfiles.length === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const userProfile = userProfiles[0];

    // 5. Extract the role from the database document and return it
    const role = userProfile.role;
    return NextResponse.json({ role });
  } catch (error) {
    // This will catch errors from an invalid or expired session
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
