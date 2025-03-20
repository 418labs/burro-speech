'use client';

import Link from 'next/link';

import { useAuth } from '@/context/auth-context';

import { AuthStatus } from '@/components/auth/auth-status';
import { Logo } from '@/components/logo';

export function MainNavbar() {
  const { user } = useAuth();

  return (
    <div className='absolute top-0 z-10 w-full border-b'>
      <div className='flex justify-between h-16 items-center px-4 container mx-auto'>
        <Link href='/'>
          <Logo className='max-h-12 max-w-28' />
        </Link>
        {user && (
          <div>
            <AuthStatus />
          </div>
        )}
      </div>
    </div>
  );
}
