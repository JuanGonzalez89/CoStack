"use client"

import { useEffect, useMemo, useState } from "react"
import { Heart, MessageCircle, Repeat2, Share2, Send, TrendingUp, Award, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDashboardSnapshot } from "@/components/dashboard/use-dashboard-snapshot"

interface Post {
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

function initialsFromName(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function avatarClass(index: number) {
  const classes = [
    "bg-violet-500/20 text-violet-500",
    "bg-sky-500/20 text-sky-500",
    "bg-cyan-500/20 text-cyan-600",
    "bg-amber-500/20 text-amber-600",
  ]

  return classes[index % classes.length]
}

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  return (
    <article className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0", post.avatarBg)}>
          {post.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{post.user}</span>
            <span className="text-xs text-muted-foreground">{post.handle}</span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">{post.time}</span>
          </div>

          <p className="mt-2 text-sm text-foreground leading-relaxed">{post.content}</p>

          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border">
            <button
              onClick={() => onLike(post.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors",
                post.liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
              )}
            >
              <Heart size={14} className={cn(post.liked && "fill-rose-500")} />
              {post.likes}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-cyan-500 transition-colors">
              <MessageCircle size={14} />
              {post.comments}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-emerald-500 transition-colors">
              <Repeat2 size={14} />
              {post.reposts}
            </button>
            <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ComunidadView() {
  const { data, isLoading } = useDashboardSnapshot()
  const [posts, setPosts] = useState<Post[]>([])
  const [draft, setDraft] = useState("")

  useEffect(() => {
    const remotePosts = data?.latestGroup?.posts ?? []

    if (remotePosts.length > 0) {
      setPosts(
        remotePosts.map((post, index) => ({
          id: post.id,
          user: post.user.name ?? post.user.email,
          handle: `@${(post.user.name ?? post.user.email).split(" ")[0].toLowerCase()}`,
          avatar: initialsFromName(post.user.name ?? post.user.email),
          avatarBg: avatarClass(index),
          time: new Date(post.createdAt).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit" }),
          content: post.content,
          likes: post.likes,
          comments: Math.max(0, Math.round(post.reposts / 2)),
          reposts: post.reposts,
          liked: false,
        })),
      )
    }
  }, [data])

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post,
      ),
    )
  }

  const handlePost = () => {
    if (!draft.trim()) return

    const newPost: Post = {
      id: crypto.randomUUID(),
      user: "Martín Pérez",
      handle: "@martinperez.io",
      avatar: "MP",
      avatarBg: "bg-cyan-500/20 text-cyan-600",
      time: "ahora",
      content: draft.trim(),
      likes: 0,
      comments: 0,
      reposts: 0,
      liked: false,
    }

    setPosts((prev) => [newPost, ...prev])
    setDraft("")
  }

  const trendingTools = useMemo(() => {
    const counts = new Map<string, number>()

    for (const post of data?.latestGroup?.posts ?? []) {
      const words = post.content.split(/\s+/)
      for (const word of words) {
        if (word.startsWith("#")) {
          counts.set(word, (counts.get(word) ?? 0) + 1)
        }
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, postsCount]) => ({ name: tag.replace(/^#/, ""), tag, posts: postsCount }))
  }, [data])

  const topFreelancers = useMemo(() => {
    const seatsByUser = new Map<string, number>()

    for (const seat of data?.latestGroup?.seats ?? []) {
      const owner = seat.tool.name
      seatsByUser.set(owner, (seatsByUser.get(owner) ?? 0) + 1)
    }

    return (data?.latestGroup?.members ?? [])
      .map((member) => {
        const name = member.user.name ?? member.user.email
        return {
          name,
          handle: `@${name.split(" ")[0].toLowerCase()}`,
          avatar: initialsFromName(name),
          bg: avatarClass(name.length),
          seats: seatsByUser.get(name) ?? 0,
        }
      })
      .slice(0, 3)
  }, [data])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Comunidad Freelance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Comparte, co-financia y conecta con tu red</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-sm text-cyan-600 shrink-0">
              MP
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="¿Qué estás buscando compartir o co-financiar?"
              rows={3}
              className="flex-1 resize-none rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between pl-12">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <ImagePlus size={16} />
            </button>
            <Button
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl gap-1.5 px-4"
              onClick={handlePost}
              disabled={!draft.trim()}
            >
              <Send size={13} />
              Publicar
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
          {!posts.length && !isLoading && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Todavía no hay publicaciones persistidas.
            </div>
          )}
        </div>
      </div>

      <aside className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-cyan-500" />
            <h3 className="text-sm font-semibold text-foreground">Trending Tools</h3>
          </div>
          <ul className="space-y-3">
            {trendingTools.length ? (
              trendingTools.map((tool) => (
                <li key={tool.tag} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tool.name}</p>
                    <p className="text-[11px] text-cyan-500">{tool.tag}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tool.posts} posts
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-muted-foreground">Sin hashtags todavía.</li>
            )}
          </ul>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Top Freelancers</h3>
          </div>
          <ul className="space-y-3">
            {topFreelancers.length ? (
              topFreelancers.map((freelancer) => (
                <li key={freelancer.handle} className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", freelancer.bg)}>
                    {freelancer.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{freelancer.name}</p>
                    <p className="text-[11px] text-muted-foreground">{freelancer.handle}</p>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    {freelancer.seats} asientos
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-muted-foreground">Sin miembros persistidos todavía.</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  )
}
