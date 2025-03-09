import { FreeTrialForm } from '@/components/free-trial-form';
import { Logo } from '@/components/logo';

export default function Page() {
  return (
    <>
      <div className='min-h-screen flex flex-col'>
        <header className='flex-1 flex items-center h-full py-12'>
          <div className='container mx-auto px-4 md:px-6'>
            <div className='flex flex-col items-center'>
              <div className='mb-4'>
                <Logo />
              </div>
              <div className='flex flex-col gap-4 text-center'>
                <h1 className='text-4xl font-bold'>AI-powered live translation for events, meetings or workshops</h1>
                <p className='text-xl text-muted-foreground'>
                  Break down language barriers at your events with our instant and easy interpretation solution.
                </p>
              </div>
              <FreeTrialForm />
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
