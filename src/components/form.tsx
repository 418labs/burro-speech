'use client';

import { useEffect, useState } from 'react';

import { addWaitlist } from '@/actions/waitlist';
import { getLocal, setLocal } from '@/lib/config';

import { Button } from './ui/button';
import { Input } from './ui/input';

export function Form(props: any) {
  // const [showTab, setShowTab] = useState(0);
  const [value, setValue] = useState('');
  const [disabled, setDisabled] = useState(false);

  const [registered, setRegistered] = useState(false);

  async function onSubmit(e: any) {
    e.preventDefault();
    setDisabled(true);

    if (!value || registered) {
      setDisabled(false);
      return;
    }

    const { error, status } = await addWaitlist(value);

    if (error) {
      setDisabled(false);
      return;
    }

    setLocal('waitlist-email', value);
    setRegistered(true);
    setValue('');
  }

  useEffect(() => {
    const isRegistered = getLocal('waitlist-email');
    setRegistered(isRegistered);
  }, []);

  return (
    <div className='flex flex-col gap-4 w-full max-w-sm mx-auto'>
      <form onSubmit={onSubmit}>
        <div className={`relative flex flex-col gap-2`}>
          <Input
            {...props}
            className='pr-30'
            type={'email'}
            placeholder={'your@email.com'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={registered}
          />
          <div className='absolute right-2 top-0 flex items-center h-full'>
            <Button
              size='sm'
              type='submit'
              id={'cta-landing-join-waitlist-email'}
              disabled={!value || disabled || registered}
            >
              Send
            </Button>
          </div>
        </div>
      </form>
      {registered && (
        <div className=''>
          <p className='text-muted-foreground'>Thanks!</p>
        </div>
      )}
    </div>
  );
}
