"use client"
import { register } from "@/lib/serverActions/session/sessionServerActions"
import { useRef } from "react"
import { useRouter } from 'next/navigation'

export default function Page() { 
  const serverInfoRef = useRef()
  const submitButtonRef = useRef()
  const router = useRouter()
  


  async function handleSubmit(e){
    e.preventDefault()

    serverInfoRef.current.classList.add("hidden")
    serverInfoRef.current.textContent = ""
    submitButtonRef.current.textContent = "Saving User ..."
    submitButtonRef.current.disabled = true

    try {
        const result = await register(new FormData(e.target))

        if(result.success){
            submitButtonRef.current.textContent = "User created ✅"

            let countdown = 3;
            // ✅ Ajout de .current
            serverInfoRef.current.classList.remove("hidden")
            serverInfoRef.current.textContent = `Redirecting in ${countdown}...`

            const interval = setInterval(() => {
                countdown -= 1;
                serverInfoRef.current.textContent = `Redirecting in ${countdown}...`

                if(countdown === 0){
                    clearInterval(interval)
                    router.push(`/signin`)
                }
            }, 1000)
        } else {
            // ✅ Gestion du cas success: false
            submitButtonRef.current.textContent = "Submit"
            submitButtonRef.current.disabled = false
            serverInfoRef.current.classList.remove("hidden")
            serverInfoRef.current.textContent = result.message
        }
    } catch (error) {
        submitButtonRef.current.textContent = "Submit"
        serverInfoRef.current.classList.remove("hidden")
        serverInfoRef.current.textContent = `${error.message}`
        submitButtonRef.current.disabled = false

    }
  }

  return (
    <div>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-36">
            <label className='f-label' htmlFor='userName'>Name or pseudo</label>
            <input className='f-auth-input' name="userName" id='userName' placeholder='Name or pseudo' type='text' required/>
            <label className='f-label' htmlFor='email'>Email</label>
            <input className='f-auth-input' name="email" id='email' placeholder='Your e-mail' type='email' required/>
            <label className='f-label' htmlFor='password'>Password</label>
            <input className='f-auth-input' name="password"  id='password' placeholder='Your password' type='password' required/>
            <label className='f-label' htmlFor='passwordRepeat'>Confirm password</label>
            <input className='f-auth-input block ' name="passwordRepeat" id='passwordRepeat' placeholder='Confirm password' type='password' required/>
            <button ref={submitButtonRef} type='submit' className='w-full mt-5 bg-indigo-500 hover:bg-indigo-800 text-white font-bold py-3 px-4 mb-10 rounded border-none'>Submit</button>
            <p className="hidden text-center mb-10" ref={serverInfoRef}></p>
            <a className='mb-5 underline text-blue-600 block text-center'>Already have an account ? Log in</a>
        </form>
    </div>
  )
}