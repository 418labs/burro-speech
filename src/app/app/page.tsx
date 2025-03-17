// app/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import TranslateOverlay from "@/components/TranslateOverlay";
import { Suspense } from "react";

type SearchParams = {
  url?: string;
  from?: string;
  to?: string;
};

export default async function TranslatePage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  // Check if user is authenticated
  // Convert the headers to the format expected by Better Auth
  const headersList = headers();
  const headerEntries = Array.from((await headersList).entries());
  const headersObject = new Headers();

  headerEntries.forEach(([key, value]) => {
    headersObject.append(key, value);
  });

  const session = await auth.api.getSession({
    headers: headersObject,
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