// "use client" vs "use server" vs rien

// Par défaut : rien du tout = Server Component
// Dans Next.js App Router, tout est côté serveur par défaut.
// js// Pas de directive = s'exécute sur le serveur
// export default async function Page() {
//   const posts = await getPosts(); // accès BDD direct, normal
//   return <div>{posts.map(...)}</div>
// }

// "use client" — quand tu as besoin du navigateur
// Tu l'ajoutes quand ton composant utilise des choses qui n'existent que dans le navigateur.
// js"use client";

// // ✅ Ces hooks nécessitent le client
// import { useState, useEffect } from "react";

// export default function Counter() {
//   const [count, setCount] = useState(0); // état interactif
  
//   useEffect(() => { ... }, []); // effet de bord
  
//   return <button onClick={() => setCount(count + 1)}>{count}</button>
//   //                  ↑ événement utilisateur
// }
// Cas concrets :

// useState, useEffect, useRef...
// onClick, onChange, onSubmit...
// localStorage, window, document...
// Librairies UI interactives (framer-motion, recharts...)


// "use server" — quand le client doit déclencher une action serveur
// Tu l'ajoutes sur des fonctions de mutation (create, update, delete) appelées depuis un Client Component ou un <form>.
// js"use server";

// // ✅ Le client peut appeler cette fonction
// // sans que la logique serveur soit exposée
// export async function createPost(formData) {
//   await connectToDB();
//   await Post.create({ title: formData.get("title") });
// }
// js"use client";

// import { createPost } from "./actions";

// export default function Form() {
//   return (
//     <form action={createPost}> {/* ← Server Action */}
//       <input name="title" />
//       <button type="submit">Créer</button>
//     </form>
//   );
// }
// ```

// ---

// ### Résumé visuel
// ```
// Accès BDD, logique métier, données sensibles
//           │
//           ▼
//    Pas de directive          "use server"
//    (Server Component)        (Server Action)
//    lecture de données   →    écriture / mutation
//    getPosts()                createPost()
//    getUser()                 deletePost()
//           │                       ▲
//           │ props                 │ appelée par
//           ▼                       │
//         "use client"  ────────────┘
//         (Client Component)
//         useState, onClick...