import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CommunityPost {
  id: string
  user: string
  handle: string
  avatar: string
  avatarBg: string
  time: string
  content: string
  likes: number
  comments: number
  reposts: number
  liked: boolean
}

interface CommunityPostRowProps {
  post: CommunityPost
  onLike: (id: string) => void
}

export function CommunityPostRow({ post, onLike }: CommunityPostRowProps) {
  return (
    <article className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 hover:bg-zinc-900/30 transition-colors duration-200">
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-zinc-800", post.avatarBg)}>
          {post.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-semibold text-zinc-50">{post.user}</span>
            <span className="text-xs text-zinc-500">{post.handle}</span>
            <span className="text-xs text-zinc-500 ml-auto shrink-0">{post.time}</span>
          </div>

          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{post.content}</p>

          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-zinc-800">
            <button
              onClick={() => onLike(post.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors",
                post.liked ? "text-rose-500" : "text-zinc-500 hover:text-rose-500"
              )}
            >
              <Heart size={14} className={cn(post.liked && "fill-rose-500")} />
              {post.likes}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-sky-500 transition-colors">
              <MessageCircle size={14} />
              {post.comments}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-emerald-500 transition-colors">
              <Repeat2 size={14} />
              {post.reposts}
            </button>
            <button className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors">
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
