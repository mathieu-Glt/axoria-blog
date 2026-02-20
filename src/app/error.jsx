"use client"

import Link from "next/link"

function Error({ error, reset}) {
  return (
    <div className="pt-44 text-center">
      <h1 className="text-4xl mb-4">❗️ ❌ A server error has occurred 😔 🔔</h1>
      <p className="mb-4 text-red-600">{error.message}</p>
      <div className="space-x-4">
        <button 
          onClick={() => reset()} 
          className="underline text-blue-600"
        >
          Try again
        </button>
        <Link href="/" className="underline">Return Home</Link>
      </div>
    </div>
  )
}

export default Error
