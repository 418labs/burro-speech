// app/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import TranslateOverlay from "@/components/TranslateOverlay";
import { Suspense } from "react";

export default async function TranslatePage({ searchParams }) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: headers(),
  });

  // Get URL parameters
  const url = searchParams?.url;
  const from = searchParams?.from;
  const to = searchParams?.to;

  // Missing required parameters
  if (!url || !to) {
    return redirect("/");
  }

  // If user is not logged in, check if this is a trial session
  // You can implement a server-side check for trial sessions if needed
  // For simplicity, we'll just allow access as we'll handle the timer client-side

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranslateOverlay />
    </Suspense>
  );
}