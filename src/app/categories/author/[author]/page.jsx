import PostCard from "@/components/PostCard/PostCard"
import { getPostsByAuthor } from "@/lib/serverMethods/blog/postMethods"

export const revalidate = 60


export default async function page({ params }) {

    const {author} = await params
    const { author: authorData, posts } = await getPostsByAuthor(author);    
    
  return (
    <div className="u-main-container u-padding-content-container">
        <h1 className="t-main-title">Posts from the {authorData.userName} 🏷️. </h1>
        <p className="t-main-subtitle">Every post from that author.</p>
        <p className="mr-4 text-md text-zinc-900">Latest articles</p>

        <ul className="u-articles-grid">
            {posts.length > 0 ? (
                posts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
                <li>There is no article written for that author. 💁🏽</li>
            )}
        </ul>
    </div>
  )
}
