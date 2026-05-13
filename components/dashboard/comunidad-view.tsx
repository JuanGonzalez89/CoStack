"use client"

import { useState } from "react"
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Send,
  TrendingUp,
  Award,
  ImagePlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Post {
  id: number
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

const initialPosts: Post[] = [
  {
    id: 1,
    user: "Santiago Calderon",
    handle: "@santicaldev",
    avatar: "SC",
    avatarBg: "bg-violet-500/20 text-violet-500",
    time: "hace 12 min",
    content:
      "Alguien tiene un asiento disponible para Vercel Pro? Necesito desplegar un proyecto full-stack este finde y compartimos gastos.",
    likes: 14,
    comments: 6,
    reposts: 3,
    liked: false,
  },
  {
    id: 2,
    user: "Juan Pablo Garcia",
    handle: "@jpgarcia_ui",
    avatar: "JP",
    avatarBg: "bg-sky-500/20 text-sky-500",
    time: "hace 1 h",
    content:
      "Acabo de liberar 2 asientos en nuestro workspace de Midjourney. El bot ya está configurado para dar acceso automático. Link en mi perfil! #Design",
    likes: 38,
    comments: 11,
    reposts: 9,
    liked: false,
  },
  {
    id: 3,
    user: "Martín Pérez",
    handle: "@martinperez.io",
    avatar: "MP",
    avatarBg: "bg-cyan-500/20 text-cyan-600",
    time: "hace 3 h",
    content:
      "Compartiendo mi repositorio de Next.js. Logré integrar la API de CoStack para automatizar cobros de clientes. Opiniones?",
    likes: 52,
    comments: 17,
    reposts: 14,
    liked: true,
  },
]

const trendingTools = [
  { name: "Vercel Pro", tag: "#VercelPro", posts: 124 },
  { name: "GitHub Copilot", tag: "#Copilot", posts: 98 },
  { name: "Midjourney", tag: "#Midjourney", posts: 76 },
  { name: "ChatGPT Team", tag: "#ChatGPT", posts: 63 },
  { name: "Figma Org", tag: "#FigmaOrg", posts: 51 },
]

const topFreelancers = [
  { name: "Laura Díaz", handle: "@lauradesigns", avatar: "LD", bg: "bg-pink-500/20 text-pink-500", seats: 12 },
  { name: "Carlos Ruiz", handle: "@cruizdev", avatar: "CR", bg: "bg-emerald-500/20 text-emerald-600", seats: 9 },
  { name: "Ana Torres", handle: "@ana.freelance", avatar: "AT", bg: "bg-amber-500/20 text-amber-600", seats: 7 },
]

function PostCard({ post, onLike }: { post: Post; onLike: (id: number) => void }) {
  return (
    <article className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
            post.avatarBg
          )}
        >
          {post.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{post.user}</span>
            <span className="text-xs text-muted-foreground">{post.handle}</span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">{post.time}</span>
          </div>

          {/* Content */}
          <p className="mt-2 text-sm text-foreground leading-relaxed">{post.content}</p>

          {/* Actions */}
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
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [draft, setDraft] = useState("")

  const handleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    )
  }

  const handlePost = () => {
    if (!draft.trim()) return
    const newPost: Post = {
      id: Date.now(),
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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Main feed ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Comunidad Freelance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Comparte, co-financia y conecta con tu red</p>
        </div>

        {/* New post composer */}
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

        {/* Posts feed */}
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Trending Tools */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-cyan-500" />
            <h3 className="text-sm font-semibold text-foreground">Trending Tools</h3>
          </div>
          <ul className="space-y-3">
            {trendingTools.map((t, i) => (
              <li key={t.tag} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-cyan-500">{t.tag}</p>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {t.posts} posts
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Freelancers */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Top Freelancers</h3>
          </div>
          <ul className="space-y-3">
            {topFreelancers.map((f) => (
              <li key={f.handle} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    f.bg
                  )}
                >
                  {f.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground">{f.handle}</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  {f.seats} asientos
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
