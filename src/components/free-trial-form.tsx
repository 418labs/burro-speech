// components/free-trial-form.tsx (modified)
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { TrialTimer } from "@/components/trial-timer";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { MOCK_LANGUAGES } from "@/mock/languages";

export function FreeTrialForm() {
  const router = useRouter();
  const [url, setUrl] = useState("https://www.canva.com/design/DAGhOT00YU4/hh-AkEG99AYp4Uqe3HX4eA/view?embed");
  const [languageFrom, setLanguageFrom] = useState("es-AR");
  const [languageTo, setLanguageTo] = useState("en-US");
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null); 
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      setSessionData(session);
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic URL validation
    if (!url.startsWith("http")) {
      setError("Please enter a valid URL");
      return;
    }

    // If user is logged in, redirect to the app
    if (sessionData) {
      router.push(`/app?url=${encodeURIComponent(url)}&to=${languageTo}&from=${languageFrom}`);
      return;
    }

    // If not logged in, start the trial
    setIsTrialActive(true);
    // The app will be shown directly, with a timer
  };

  const handleTrialExpire = () => {
    setIsTrialActive(false);
    setAuthTab("signup"); // Default to signup when trial expires
    setShowAuthModal(true);
  };

  return (
    <div className="w-full py-8 md:px-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="w-full">
            <Label htmlFor="url">URL of your presentation</Label>
            <Input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://canva.com/design/... or https://docs.google.com/presentation/..."
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="min-w-[100px]">
            <Label htmlFor="languageFrom">From</Label>
            <Select defaultValue={languageFrom} onValueChange={setLanguageFrom}>
              <SelectTrigger id="languageFrom">
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>From</SelectLabel>
                  {MOCK_LANGUAGES.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[100px]">
            <Label htmlFor="languageTo">To</Label>
            <Select defaultValue={languageTo} onValueChange={setLanguageTo}>
              <SelectTrigger id="languageTo">
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>To</SelectLabel>
                  {MOCK_LANGUAGES.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={!languageTo || !url || !languageFrom}>
          {sessionData ? "Start Translating" : "Try Now"}
        </Button>
      </form>

      {/* Show the authentication buttons if not logged in and not in trial */}
      {!sessionData && !isTrialActive && (
        <div className="mt-4 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setAuthTab("signin");
              setShowAuthModal(true);
            }}
          >
            Sign In
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              setAuthTab("signup");
              setShowAuthModal(true);
            }}
          >
            Sign Up
          </Button>
        </div>
      )}

      {/* Show trial timer if in trial mode */}
      {isTrialActive && !sessionData && (
        <TrialTimer duration={60} onExpire={handleTrialExpire} />
      )}

      {/* Auth modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />
    </div>
  );
}