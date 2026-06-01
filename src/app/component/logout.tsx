"use client";

import { redirect } from "next/navigation";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    redirect("/login")
  };

  return (
    <button
      onClick={handleLogout}
      
    >
      Logout
    </button>
  );
}
