import BackButton from "@/components/BackButton/BackButton"
import PostCard from "@/components/PostCard/PostCard"
import { getPostsByTag } from "@/lib/serverMethods/blog/postMethods"

export const revalidate = 60


export default async function page({ params }) {

    const {tag} = await params
    const posts = await getPostsByTag(tag)
    
  return (
    <div className="u-main-container u-padding-content-container">
        
        <BackButton />
        <h1 className="t-main-title">Posts from the #{tag} 🏷️ tag. </h1>
        <p className="t-main-subtitle">All of the posts that use that tag.</p>
        <p className="mr-4 text-md text-zinc-900">Latest articles</p>

        <ul className="u-articles-grid">
            {posts.length > 0 ? (
                posts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
                <li>No articles found for that tag. 🤬</li>
            )}
        </ul>
    </div>
  )
}
