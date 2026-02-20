"use client"
import { useRouter } from 'next/navigation'

export default function BackButton() {
    const router = useRouter()
    return (
        <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 p-3 border rounded bg-indigo-700 text-white hover:bg-indigo-900"
        >
            ← Back
        </button>
    )
}