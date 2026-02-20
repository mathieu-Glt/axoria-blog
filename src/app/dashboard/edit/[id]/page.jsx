import { getPostForEdit } from "@/lib/serverMethods/blog/postMethods"
import ClientEditForm from "./(components)/ClientEditForm"
export default async  function page({params}) 
{
  const {id} = await params;
  const post = await getPostForEdit(id)
/**
 * Cette ligne sert à convertir un document Mongoose en objet JavaScript pur et sérialisable. Voici ce qu'elle fait étape par étape :
JSON.stringify(post, replacer) — transforme post en string JSON. Le deuxième argument est une fonction replacer qui intercepte chaque valeur pendant la conversion. Pour chaque clé/valeur du document, elle vérifie : est-ce que cette valeur est un ObjectId Mongoose ? Si oui, elle le convertit en string. Sinon, elle laisse la valeur telle quelle.
JSON.parse(...) — retransforme immédiatement la string JSON en objet JS plain.
 */
  //const serializablePost = JSON.parse(JSON.stringify(post, (key, value) => value instanceof Types.ObjectId ? value.toString() : value))
  return (
    <div>
      <ClientEditForm post={post} />
    </div>
  )
}
