"use client"
import { useAuth } from '@/app/context/authContext/authContext'
import { logOut } from '@/lib/serverActions/session/sessionServerActions'
import { isPrivatePage } from '@/lib/utils/middleware/isPrivatePage'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'



function NavbarDropdown({userId}) {
    const {setIsAuthenticated} = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const router = useRouter()

    function toggleDropdown() {
        setIsOpen(!isOpen)
    }

    async function handleLogout() {
        console.log("Disconnected !")
        setIsOpen(false)
        const result = await logOut()
        if(result.success) {
        setIsAuthenticated({loading: false, isConnected: false, userId: null})
        const currentPath = window.location.pathname
        if(await isPrivatePage(currentPath)) {
            router.push("/signin")
        }
        }

    }

    // Close dropdown when clicking outside
useEffect(() => {
    // Cette fonction sera appelée quand on clique n'importe où dans le document
    function handleClickOutside(event) {
        // dropdownRef.current : référence au div contenant le dropdown
        // !dropdownRef.current.contains(event.target) : vérifie si le clic est EN DEHORS du dropdown
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false)  // Ferme le dropdown si on clique à l'extérieur de la div qui contient dropdownRef
        }
    }

    // On n'ajoute l'écouteur d'événement que si le dropdown est ouvert
    if (isOpen) {
        // Écoute tous les clics sur le document
        document.addEventListener('mousedown', handleClickOutside)
    }

    // Fonction de nettoyage : s'exécute quand le composant se démonte 
    // OU quand isOpen change (avant le prochain effet)
    return () => {
        // Retire l'écouteur pour éviter les fuites de mémoire
        document.removeEventListener('mousedown', handleClickOutside)
    }
}, [isOpen])  // Ce useEffect se ré-exécute chaque fois que isOpen change
    return (
        <div ref={dropdownRef} className='relative'>
            <button onClick={toggleDropdown} className='flex'>
                <Image src="/icons/user.svg" alt='User menu' width={24} height={24}/>
            </button>
            {isOpen && (
                <ul className='absolute right-0 top-10 w-[250px] border-b border-x border-zinc-300'>
                    <li>
                        <Link 
                            className='block bg-slate-50 hover:bg-slate-200 p-4 border-b border-slate-300' 
                            href={userId ? `/dashboard/${userId}` : '#'}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <button 
                            className="w-full p-4 text-left bg-slate-50 hover:bg-slate-200" 
                            onClick={handleLogout}
                        >
                            Sign out
                        </button>
                    </li>
                </ul>
            )}
        </div>
    )
}

export default NavbarDropdown