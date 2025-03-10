'use server';

import { sendEmail } from './email';

export async function addWaitlist(email: string): Promise<{ error: any; status: number }> {
  if (!email) {
    return { error: 'Oops...', status: 400 };
  }

  const res = await sendEmail({ email });

  return { error: res?.error, status: 200 };
}
