import { MainNavbar } from '@/components/main-navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNavbar />
      <div className='relative overflow-x-hidden flex flex-col w-screen min-h-screen bg-background'>{children}</div>
    </>
  );
}
