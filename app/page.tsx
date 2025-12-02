'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // 自动重定向到前台系统首页
    router.push('/front/page');
  }, [router]);
  
  return null;
}
