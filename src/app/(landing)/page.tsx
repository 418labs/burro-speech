'use client';

import { useAuth } from '@/context/auth-context';
import { AuthButton } from '@/components/auth/auth-status';

export default function Page() {
  const { user } = useAuth();

  // Check for existing session
  // useEffect(() => {
  //   const checkSession = async () => {
  //     const session = await authClient.getSession();
  //     setSessionData(session?.data);
  //   };

  //   checkSession();
  // }, []);

  return (
    <>
      <div className='min-h-screen flex flex-col'>
        <header className='flex-1 flex items-center h-full py-12'>
          <div className='container mx-auto px-4 md:px-6'>
            <div className='flex flex-col items-center gap-8'>
              <div className='flex flex-col gap-4 text-center'>
                <h1 className='text-4xl font-bold'>AI-powered live translation for events, meetings or workshops</h1>
                <p className='text-xl text-muted-foreground'>
                  Break down language barriers at your events with our instant and easy interpretation solution.
                </p>
              </div>
              {!user && (
                <div>
                  <AuthButton text='Sign in to Google to try now' />
                </div>
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
