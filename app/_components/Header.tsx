"use client"
import React, { useState } from "react";
import Image from 'next/image'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from "next/link";

function Header() {
    const { user } = useUser();
    return (
        <div className='flex items-center justify-between  p-4 '>
            <Link href="/">
                <div className='flex gap-1 items-center'>
                    <Image src="/logo.png" alt="Logo" width={30} height={40} />
                    <h2 className='text-lg font-bold'> <span className='text-primary'>Vedemy</span></h2>
                </div>
            </Link>
            <ul className='flex gap-6 items-center'>
                <li className='text-lg hover:text-blue-600 font-medium cursor-pointer'>
                    <Link href="/">Home</Link>
                </li>
                <li className='text-lg hover:text-blue-600 font-medium cursor-pointer'>
                    <Link href="/pricing">Pricing</Link>
                </li>
            </ul>


            {user ?
                <UserButton /> :
                <SignInButton mode="modal">
                    <Button className='bg-blue-500'>Get Started</Button>
                </SignInButton>
            }

        </div>
    )
}

export default Header