import { Tag } from "@/lib/models/Tag";
import { connectToDB } from "@/lib/utils/db/connectToDB";

export async function getTags() {
  await connectToDB();
  //Tri, filtre jointure pour compter le nombre de post en realtion avec un tag précis
  const tags = await Tag.aggregate([
    {
      /**
         * C'est l'équivalent d'un SQL JOIN. Pour chaque tag, il va chercher tous les posts qui le référencent.
js// Résultat après $lookup :
{
  _id: ObjectId("..."),
  name: "JavaScript",
  slug: "javascript",
  postsWithTag: [ {post1}, {post2}, {post3} ]  // ← tableau ajouté
}
         */
      $lookup: {
        from: "posts", // on regarde dans la collection "posts"
        foreignField: "tags", // le champ dans posts qui contient les tag IDs
        localField: "_id", // l'_id du tag actuel
        as: "postsWithTag", // nom du tableau résultant
      },
    },
    {
      /**
       * $size compte le nombre d'éléments dans le tableau. On crée un nouveau champ postCount.
       */
      $addFields: {
        postCount: { $size: "$postsWithTag" },
      },
    },
    {
      /**
         * $match: { postCount: { $gt: 0 } }
$gt = greater than. On garde uniquement les tags qui ont au moins 1 post. Inutile d'afficher un tag orphelin.
         */
      $match: { postCount: { $gt: 0 } },
    },
    {
      /**
         * Étape 4 — $sort : le tri
js$sort: { postCount: -1 }
-1 = ordre décroissant. Les tags les plus utilisés apparaissent en premier.
         */
      $sort: { postCount: -1 },
    },
    {
      $project: { postsWithTag: 0 },
    },
  ]);

  return tags;
}
