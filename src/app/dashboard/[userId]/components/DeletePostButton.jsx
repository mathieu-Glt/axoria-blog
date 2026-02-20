"use client"

import { deletePost } from "@/lib/serverActions/blog/postServerActions"

function DeletePostButton({id}) {

   
  return (
    <button 
        onClick={() => deletePost(id)} 
        className="font-bold py-3 px-4 rounded mr-2 bg-red-500 hover:bg-red-600 text-black"
    >
      Delete
    </button>
  )
}

export default DeletePostButton
