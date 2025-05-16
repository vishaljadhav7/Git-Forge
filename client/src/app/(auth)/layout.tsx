'use client'

import React , {useEffect} from 'react'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'

const Layout = ( { children}: { children: React.ReactNode}) => {

    const authStatus = useAppSelector(store => store.user.isAuthenticated);
    const router = useRouter();

      useEffect(() => {
        if (authStatus) {
          router.push("/dashboard");
        }
      }, [router, authStatus]);
    
  return (
    <div>{children}</div>
  )
}

export default Layout