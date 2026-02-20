import { getUserPostsFromUserID } from "@/lib/serverMethods/blog/postMethods";
import Image from "next/image";
import Link from "next/link"
import DeletePostButton from "./components/DeletePostButton";
import { redirect } from "next/dist/server/api-utils";
export const revalidate = 60

async function page({params}) {
  const { userId } = await params; 
  const posts = await getUserPostsFromUserID(userId)

if(!userId || userId === "null"){
  redirect("/signin")
}
  return (
    <div className='u-main-container u-padding-content-container'>
      <h1 className="text-3xl mb-5">Dashboard - Your articles</h1>
      <ul>
        {posts.length > 0 ? (
          posts.map(post => (
            <li key={post._id} className="flex items-center mb-2 bg-slate-50 py-2 pl-4">
       <Image
    src={post.coverImageUrl}
    alt={post.title}
    width={200}
    height={200}
    className="object-cover rounded mr-4"
    sizes="200px"
/>
              <Link 
                className="mr-auto underline underline-offset-2 text-violet-600" 
                href={`/articles/${post.slug}`} 
              >
                {post.title}
              </Link>
         
              <Link 
                className="font-bold py-3 px-4 rounded mr-2 bg-yellow-400 hover:bg-yellow-500 text-white" 
                href={`/dashboard/edit/${post._id}`}
              >
                Edit
              </Link>
              {/*On doit sérializer l'objet en JSON avec l'utilisation de toString() Un composant next doit recevoir post._id          // ObjectId('64f1a2b3c4d5e6f7a8b9c0d1')  ← objet Mongoose
                  post._id.toString() // "64f1a2b3c4d5e6f7a8b9c0d1"          ← string classique
                  // Parce que Next.js ne peut pas sérialiser un objet ObjectId pour le passer en props à un Client Component :
                    js// ❌ Plante — ObjectId n'est pas sérialisable
                    return <MonComposant id={post._id} />

                  // ✅ Ok — string classique
                  return <MonComposant id={post._id.toString()} /> */}
                  <DeletePostButton id={post._id.toString()}/>
                
            </li>
          ))
        ) : (
          <li>You haven't created any articles yet.</li>
        )}
      </ul>
    </div>
  )
}

export default page
