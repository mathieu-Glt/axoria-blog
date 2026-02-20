"use client" // Ne pas déclare de composant en async quand il est notifié comme Client avec "use client"
import React, { useRef, useState } from 'react'
import {  editPost } from '@/lib/serverActions/blog/postServerActions'
import { useRouter } from 'next/navigation'
import areTagSimilar from '@/lib/utils/general/utils'

export default function ClientEditForm({ post }) {
    const [tags, setTags] = useState(post.tags.map(tag => tag.name))
    const tagInputRef = useRef(null)
    const submitButtonRef = useRef(null);
    const serverValidationText = useRef(null);
    const router = useRouter()
    const imgUploadValidationText = useRef(null)

 async function handleSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)

    const id = formData.get("id")
    const coverImage = formData.get("coverImage")
    const title = formData.get("title")
    const markdownArticle = formData.get("markdownArticle")
    const areSimilarTags = areTagSimilar(tags, post.tags)

    if (
      (!coverImage || coverImage.size === 0) &&
      title.trim() === post.title &&
      markdownArticle.trim() === post.markdownArticle &&
      areSimilarTags
    ) {
      serverValidationText.current.textContent = "You must make a change before submitting"
      return
    } else {
      serverValidationText.current.textContent = ""
    }

    formData.set("tags", JSON.stringify(tags))
    // ✅ Ajout du slug manquant
    formData.set("slug", post.slug)

    serverValidationText.current.textContent = ""
    submitButtonRef.current.textContent = "Updating Post ..."
    submitButtonRef.current.disabled = true

    // ✅ editPost dans le try/catch
    try {
        const result = await editPost(formData)

        if (result.success) {
            submitButtonRef.current.textContent = "Post Updated ✅"

            let countdown = 3;
            serverValidationText.current.textContent = `Redirecting in ${countdown}...`
            const interval = setInterval(() => {
                countdown -= 1;
                serverValidationText.current.textContent = `Redirecting in ${countdown}...`

                if (countdown === 0) {
                    clearInterval(interval)
                    router.push(`/articles/${result.slug}`)
                }
            }, 1000)
        }
    } catch (error) {
        serverValidationText.current.textContent = error.message
        submitButtonRef.current.textContent = "Submit"
        submitButtonRef.current.disabled = false
    }
}

/* !tags.includes(newTag) condition qui vérifie que le nouveau tag n'existe pas déja dans le tableau */
    function handleTag() {
        const newTag = tagInputRef.current.value.trim().toLowerCase()
        if(newTag !== "" && !tags.includes(newTag) && tags.length <= 4) {
            setTags([...tags, newTag])
            tagInputRef.current.value = ""
        }
    }

    function handleRemove(tagToRemove) {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    function handleEnterOnTagInput(e) {
        if(e.key === "Enter"){
            e.preventDefault()
            handleTag()
        }
    }

  function handleFileChange(e){
    const file = e.target.files[0]
    
    if(!file) return
    
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const validPdfType = "application/pdf"
    const allValidTypes = [...validImageTypes, validPdfType]

    // Validation du type
    if(!allValidTypes.includes(file.type)){
        imgUploadValidationText.current.textContent = 
            "Invalid file type. Accepted: JPEG, PNG, WebP, PDF"
        e.target.value = ""
        return
    }

    // Validation de la taille (5 MB)
    const maxSize = 5 * 1024 * 1024
    if(file.size > maxSize){
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        imgUploadValidationText.current.textContent = 
            `File too large (${sizeMB}MB). Maximum: 5MB`
        e.target.value = ""
        return
    }

    // Réinitialiser le message d'erreur
    imgUploadValidationText.current.textContent = ""

    // Vérification des dimensions pour les images uniquement
    if(validImageTypes.includes(file.type)){
        const img = new Image()
        
        img.addEventListener("load", function checkImgSizeOnLoad(){
            if(img.width > 1280 || img.height > 720){
                imgUploadValidationText.current.textContent = 
                    `Image too large (${img.width}x${img.height}). Maximum: 1280x720`
                e.target.value = ""
            } else {
                imgUploadValidationText.current.textContent = 
                    `✅ Image valid (${img.width}x${img.height})`
            }
            URL.revokeObjectURL(img.src)
        })

        img.src = URL.createObjectURL(file)
    } else if(file.type === validPdfType){
        // Message de confirmation pour PDF
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        imgUploadValidationText.current.textContent = 
            `✅ PDF valid (${sizeMB}MB)`
    }
}


  return (
    <main className='u-main-container bg-white p-7 mt-32 mb-44'>
        <h1 className="text-4xl mb-4">Edit that article 📝</h1>
        <form className="pb-6" onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={post._id} />
            <label htmlFor='title' className='f-label focus:outline-slate-400'>Title</label>
            <input 
                type='text' 
                name='title' 
                className='shadow border rounded w-full p-3 mb-7 text-gray-700 focus:outline-slate-400' 
                id="title" 
                placeholder='Title' 
                defaultValue={post.title}
            
            />
            <label htmlFor="coverImage" className='f-label'><span>Cover file (Image: 1280x720 max or PDF: 5MB max)</span><span className='block font-normal'>Changing the image is <span className='font-bold'>optional</span> in edit mode</span></label>
            <input type="file" name="coverImage" id="coverImage"  placeholder="Article's cover image" className='shadow cursor-pointer border rounded w-full p-3 text-gray-700 mb-2 focus:outline-none focus:shadow-outline'     
                onChange={handleFileChange}/>
            <p className='text-red-700 mb-7' ref={imgUploadValidationText}></p>
            <div className='mb-10'>
                <label className='f-label' htmlFor='tag'>Add a tag(s) (optional, max 5)</label>
                <input type="text" className='shadow border rounded p-3 text-gray-700 focus:outline-slate-400' id='tag' placeholder='Add a tag' ref={tagInputRef} onKeyDown={handleEnterOnTagInput}/>
                <button className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-4 rounded mx-4' onClick={handleTag} type='button'>Add tag</button>
                <div className='flex items-center grow whitespace-nowrap overflow-y-auto shadow border rounded px-3'>
                    {tags.map((tag, id) => (
                        <span className='inline-block whitespace-nowrap bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2' key={tag} >{tag} <button className='text-red-500 ml-2' type='button' onClick={() => handleRemove(tag)}>&times;</button></span>
                    ))}
                </div>
            </div>
            <label htmlFor='markdownArticle' className='f-label'>Write your article using markdown - do not repeat the already given title</label>
            <a target='_blank' className='block mb-4 text-blue-600' href="https://www.markdownguide.org/cheat-sheet/">How to use markdown syntax ?</a>
            
            <textarea 
                name='markdownArticle' 
                id="markdownArticle" 
                required 
                className='min-h-44 text-xl shadow appearance-none border rounded w-full p-8 text-gray-700 mb-4 focus:outline-slate-400'
                placeholder='Write your article here...'
                defaultValue={post.markdownArticle}
            ></textarea>

            {/* <label htmlFor='author' className='f-label focus:outline-slate-400'>Author</label>
            <input 
                type='text' 
                name='author' 
                className='shadow border rounded w-full p-3 mb-7 text-gray-700 focus:outline-slate-400' 
                id="author" 
                placeholder='Author' 
                required
            /> */}

            
            <button ref={submitButtonRef} className='min-w-44 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none mb-4'>
                Submit
            </button>
            <p ref={serverValidationText}></p>
        </form>
    </main>
  )
}
