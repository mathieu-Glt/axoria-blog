"use client"
import Link from 'next/link'
import React from 'react'
import NavbarDropdown from './NavbarDropdown'
import { useAuth } from '@/app/context/authContext/AuthContext'
import Image from 'next/image'

export default function Navbar() {
  const {isAuthenticated} = useAuth()
  console.log("isAuthenticated ~ useAuth - Navbar : ", isAuthenticated)

 


  return (
    <nav className='fixed z-10 w-full bg-slate-50 border-b border-b-zinc-300'>
        <div className='u-main-container flex py-4 px-12'>         
            <Link className='mr-2 text-zinc-900' href="/">AXORIA</Link>
            <Link className='mx-2 text-zinc-900 mr-auto' href="/categories">Categories</Link>
            {isAuthenticated.loading && (
              <div className=''>
                  <Image src='/icons/loader.svg' width={24} height={24} alt="loader" />
              </div>
            )}
            {isAuthenticated.isConnected ? (
              <>              
                <Link className='mx-2 text-zinc-900 ' href="/dashboard/create">Add an article</Link>
                <NavbarDropdown userId={isAuthenticated.userId}/>
              </>
            ) : (
              <>    
                <Link className='mx-2 text-zinc-900 ' href="/signin">Sign in</Link>
                <Link className='mx-2 text-zinc-900 ' href="/signup">Sign up</Link>
              </>
            )}
   
        </div>
    </nav>
  )
}

