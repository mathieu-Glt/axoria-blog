
import { getPosts } from "@/lib/serverMethods/blog/postMethods"
import { sessionInfo } from "@/lib/serverMethods/session/sessionMethods"
import PostCard from "@/components/PostCard/PostCard"
export const revalidate = 60
export default async function Home() {
    const posts = await getPosts()



    return (
        <div className="u-main-container u-padding-content-container">
            <h1 className="t-main-title">Stay up to date with Axoria Blog</h1>
            <p className="t-main-subtitle">Tech news and useful knowledge</p>
            <ul className="u-articles-grid">
                {posts.map((post, id) => {
                    // Vérifier si c'est un PDF
                    return <PostCard key={post._id} post={post} />
                })}
            </ul>
        </div>
    )
}