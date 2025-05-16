'use client'
import React from 'react'
import { Github , LogOut} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'

const Navbar = () => {
  const {isAuthenticated} = useAppSelector(store => store.user);

  return (
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 h-[63px]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Github className="w-6 h-6 mr-2 text-purple-600 " />
              <span className="text-xl font-bold text-slate-900 ">
                Git Forge
              </span>
            </div>

           {
            isAuthenticated ? 
            <Button className='p-2' variant={"outline"}>
              <LogOut />
            </Button>
            :          
            <div className="flex items-center">
              <Link href={"/sign-in"}>
                <Button variant="ghost" className="mr-2">
                  Sign In
                </Button>
              </Link>
              <Link href={"/sign-up"}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Sign Up
                </Button>
              </Link>
            </div>
           }

          </div>
        </div>
      </header>
  )
}

export default Navbar;