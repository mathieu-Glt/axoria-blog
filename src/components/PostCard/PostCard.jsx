import Link from "next/link"
import Image from "next/image"

export default function PostCard({ post }) {

    const isPdf = post.coverImageUrl?.endsWith('.pdf')

    return (
        <li className="rounded-sm shadow-md hover:shadow-xl hover:border-zinc-900 overflow-hidden">
            <Link href={`/articles/${post.slug}`}>
                <div className="relative w-full h-48 bg-gray-200">
                    {isPdf ? (
                        <div className="flex items-center justify-center h-full bg-red-100">
                            <svg className="w-16 h-16 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                            </svg>
                        </div>
                    ) : (
                        <Image
                            src={post.coverImageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}
                </div>
            </Link>

            <div className="pt-5 px-5 pb-7">
                <div className="flex items-baseline gap-x-4 text-xs">
                    <time className="text-gray-500 text-sm" dateTime={post.createdAt}>
                        {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                            year: "numeric", 
                            month: "long", 
                            day: "numeric"
                        })}
                    </time>
                    <Link 
                        className='ml-auto text-base text-gray-600 hover:text-gray-800 whitespace-nowrap truncate' 
                        href={`/categories/author/${post.author.normalizedUserName}`}
                    >
                        {post.author.userName}
                    </Link>
                </div>
                <Link 
                    className="inline-block mt-6 text-xl font-semibold text-zinc-800 hover:text-zinc-600" 
                    href={`/articles/${post.slug}`}
                >
                    {post.title}
                </Link>
            </div>
        </li>
    )
}