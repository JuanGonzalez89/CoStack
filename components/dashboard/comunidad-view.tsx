"use client"

import { useEffect, useMemo, useState } from "react"
import { Send, TrendingUp, Award, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDashboardSnapshot } from "@/components/dashboard/use-dashboard-snapshot"
import { CommunityPostRow, type CommunityPost } from "./community-post-row"
import { RoleFilterBar } from "./role-filter-bar"

function initialsFromName(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function avatarClass(index: number) {
  const classes = [
    "bg-violet-500/10 text-violet-500",
    "bg-sky-500/10 text-sky-500",
    "bg-cyan-500/10 text-cyan-500",
    "bg-amber-500/10 text-amber-500",
  ]
  return classes[index % classes.length]
}

const filterOptions = [
  { value: "all", label: "Todos" },
  { value: "my_posts", label: "Mis publicaciones" },
  { value: "saved", label: "Guardados" },
]

export function ComunidadView() {
  const { data, isLoading } = useDashboardSnapshot()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [draft, setDraft] = useState("")
  const [filter, setFilter] = useState("all")

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

    const newPost: CommunityPost = {
      id: crypto.randomUUID(),
      user: "Martín Pérez",
      handle: "@martinperez.io",
      avatar: "MP",
      avatarBg: "bg-sky-500/10 text-sky-500",
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-50">Comunidad Freelance</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Comparte, co-financia y conecta con tu red</p>
          </div>
          <RoleFilterBar value={filter} onChange={setFilter} options={filterOptions} />
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/10 flex items-center justify-center font-bold text-sm text-sky-500 shrink-0 border border-zinc-800">
              MP
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="¿Qué estás buscando compartir o co-financiar?"
              rows={3}
              className="flex-1 resize-none rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-50 placeholder:text-zinc-500 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/40 leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between pl-12">
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ImagePlus size={16} />
            </button>
            <Button
              size="sm"
              className="bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl gap-1.5 px-4"
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
            <CommunityPostRow key={post.id} post={post} onLike={handleLike} />
          ))}
          {!posts.length && !isLoading && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500 text-center">
              Todavía no hay publicaciones persistidas.
            </div>
          )}
        </div>
      </div>

      <aside className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-sky-500" />
            <h3 className="text-sm font-semibold text-zinc-50">Trending Tools</h3>
          </div>
          <ul className="space-y-3">
            {trendingTools.length ? (
              trendingTools.map((tool) => (
                <li key={tool.tag} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-50">{tool.name}</p>
                    <p className="text-[11px] text-sky-500">{tool.tag}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                    {tool.posts} posts
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-zinc-500">Sin hashtags todavía.</li>
            )}
          </ul>
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-zinc-50">Top Freelancers</h3>
          </div>
          <ul className="space-y-3">
            {topFreelancers.length ? (
              topFreelancers.map((freelancer) => (
                <li key={freelancer.handle} className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-zinc-800", freelancer.bg)}>
                    {freelancer.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-50 truncate">{freelancer.name}</p>
                    <p className="text-[11px] text-zinc-500">{freelancer.handle}</p>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                    {freelancer.seats} asientos
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-zinc-500">Sin miembros persistidos todavía.</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  )
}

