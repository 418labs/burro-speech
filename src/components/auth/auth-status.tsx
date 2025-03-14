// components/auth/auth-status.tsx
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

  useEffect(() => {
    const checkSession = async () => {
      const sessionData = await authClient.getSession();
      setSession(sessionData);
      setLoading(false);
    };
    
    checkSession();
    
    // Set up a subscription to session changes
    const unsubscribe = authClient.subscribe("session", () => {
      checkSession();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>;
  }

  if (!session) {
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

  const { user } = session;
  const initials = user.name
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
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
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