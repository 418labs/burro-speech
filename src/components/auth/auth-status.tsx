"use client"

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/auth/auth-modal";

export function AuthStatus() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  // Function to check session status
  const checkSession = async () => {
    try {
      const sessionData = await authClient.getSession();
      setSession(sessionData);
    } catch (error) {
      console.error("Error fetching session:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    checkSession();

    // Poll for session changes every 30 seconds
    const intervalId = setInterval(() => {
      checkSession();
    }, 30000);

    // Set up event listeners for auth-related browser events
    window.addEventListener("focus", checkSession);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", checkSession);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      // Immediately update our local state after signing out
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>;
  }

  // Check if session is null or doesn't have a user property
  if (!session || !session.user) {
    return (
      <>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthTab("signin");
              setShowAuthModal(true);
            }}
          >
            Sign In
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setAuthTab("signup");
              setShowAuthModal(true);
            }}
          >
            Sign Up
          </Button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          defaultTab={authTab}
        />
      </>
    );
  }

  // Now we can safely destructure the user object
  const { user } = session;
  
  // Use optional chaining to safely access user.name
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
    : 'U';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.name || 'User'} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'No email'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleSignOut}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}