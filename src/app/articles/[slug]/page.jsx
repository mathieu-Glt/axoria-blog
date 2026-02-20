import Link from "next/link";
import Image from "next/image";
import './article-styles.css'
import 'prism-themes/themes/prism-vsc-dark-plus.css'
import BackButton from "@/components/BackButton/BackButton";
import NotFound from "@/app/not-found";


const { getPost } = require("@/lib/serverMethods/blog/postMethods");

export default async function page({params}) {

    const {slug} = await params
    const post = await getPost(slug)
    if(!post) return <NotFound />

    const isPdf = post.coverImageUrl?.endsWith('.pdf')
    
    return (
        <main className="u-main-container u-padding-content-container">
            <BackButton />
            {/* Image de couverture */}
            <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden shadow-lg">
                
                {isPdf ? (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                        <div className="text-center">
                            <svg className="w-20 h-20 mx-auto mb-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                            </svg>
                            <a 
                                href={post.coverImageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                            >
                                Télécharger le PDF
                            </a>
                        </div>
                    </div>
                ) : (
                    
                    <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
            </div>

{/* Titre */}
<h1 className="text-4xl font-bold mb-4">{post.title}</h1>

{/* Métadonnées (auteur, date) */}
<div className="flex items-center gap-4 mb-4 text-gray-600">
    <span>
        Par{" "}
        <Link 
            href={`/categories/author/${post.author.normalizedUserName}`} 
            className="underline hover:text-gray-900"
        >
            {post.author.userName}  {/* ✅ Utilisez userName */}
        </Link>
    </span>
    <span>•</span>
    <time dateTime={post.createdAt}>
        {new Date(post.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })}
    </time>
</div>

            {/* Tags */}
            <div className="mb-8">
                {post.tags.map(tag => (
                    <Link 
                        key={tag.slug} 
                        className="inline-block mr-2 mb-2 px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300" 
                        href={`/categories/tag/${tag.slug}`}
                    >
                        #{tag.name}
                    </Link>
                ))}
            </div>

            {/* Contenu de l'article */}
            <div className="article-styles" dangerouslySetInnerHTML={{__html: post.markdownHTMLResult}}>
            </div>
        </main>
    )
}