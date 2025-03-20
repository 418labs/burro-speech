'use client';

import { LogOut } from 'lucide-react';

import { useAuth } from '@/context/auth-context';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthButton({ text }: { text: string }) {
  const { loading, login } = useAuth();

  return (
    <Button variant='outline' onClick={login} disabled={loading} className='w-full'>
      <svg className='h-4 w-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
        <path
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          fill='#4285F4'
        />
        <path
          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          fill='#34A853'
        />
        <path
          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          fill='#FBBC05'
        />
        <path
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          fill='#EA4335'
        />
      </svg>
      {text}
    </Button>
  );
}

export function AuthStatus() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <Skeleton className='h-10 w-10 rounded-full bg-black/20 animate-pulse' />;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className='h-10 w-10 cursor-pointer'>
            <AvatarImage src={user?.image || 'https://placehold.co/400'} alt={user?.name || 'User'} />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='min-w-[12rem]' align='end'>
          <DropdownMenuLabel>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{user?.name || 'User'}</p>
              <p className='text-xs leading-none text-muted-foreground'>{user?.email || 'No email'}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='cursor-pointer' onClick={logout}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
