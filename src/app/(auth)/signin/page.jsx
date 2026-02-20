"use client"
import { useAuth } from '@/app/context/authContext/authContext'
import { login } from '@/lib/serverActions/session/sessionServerActions'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'


export default function page() {
  const {setIsAuthenticated} = useAuth()
  const serverInfoRef = useRef()
  const submitButtonRef = useRef()
  const router = useRouter()

  async function handleSubmit(e) {
      e.preventDefault()

      serverInfoRef.current.textContent = ""
      submitButtonRef.current.disabled = true


      try {
        const result = await login(new FormData(e.target))

        if(result.success){
          setIsAuthenticated({loading: false, isConnected: true, userId: result.userId})
          router.push("/")
        }
      } catch (error) {
        console.log("Err during login")
        submitButtonRef.current.disabled = false
        serverInfoRef.current.textContent = error.message

      }



  }
  return (
    <div>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-36">
            <label className='f-label' htmlFor='email'>Email</label>
            <input className='f-auth-input' name="email" id='email' placeholder='Your e-mail' type='email' required/>
            <label className='f-label' htmlFor='password'>Password</label>
            <input className='f-auth-input' name="password"  id='password' placeholder='Your password' type='password' required/>
            <button ref={submitButtonRef} type='submit' className='w-full mt-5 bg-indigo-500 hover:bg-indigo-800 text-white font-bold py-3 px-4 mb-10 rounded border-none'>Submit</button>
            <p className="hidden text-center mb-10" ref={serverInfoRef}></p>
        </form>

    </div>
  )
}
