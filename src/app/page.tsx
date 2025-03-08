import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteConfig.name,
  };
}

export default function Page() {
  return <>Hola mundo</>;
}
