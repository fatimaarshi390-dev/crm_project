// app/(protected)/layout.tsx
import UserProvider from "../component/context/user-context";
import { getUserFromCookies } from "@/lib/helper";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userDoc = await getUserFromCookies();

  if (!userDoc) {
    redirect("/login");
  }

  // Convert Mongoose document to plain object
  const user = JSON.parse(JSON.stringify(userDoc));

  return (
    <UserProvider user={user}>
      {children}
    </UserProvider>
  );
}