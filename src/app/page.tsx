"use client"

import Link from "next/link"
import { Feather, Sparkles, ArrowRight } from "lucide-react"
import { platformList } from "@/lib/platforms"
import { getPlatformIcon } from "@/components/platform-icons"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
              <Feather className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Capt<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">speare</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-20 h-[400px] w-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-[300px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-sm text-cyan-400 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Content Generator</span>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground md:text-7xl">
            Transform Words Into
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Social Media Gold
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-pretty text-lg text-muted-foreground">
            Speak or type your thoughts, and let Captspeare craft them into captivating captions and titles for any platform.
          </p>
        </div>
      </section>

      {/* Platform Selection */}
      <section className="relative py-12 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-foreground md:text-3xl">
              Choose Your Platform
            </h2>
            <p className="text-muted-foreground">
              Select where you want to share your content
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformList.map((platform) => (
              <Link
                key={platform.id}
                href={`/${platform.id}`}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl transition-all duration-300",
                  "hover:border-transparent hover:shadow-2xl hover:-translate-y-1"
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative">
                  <div className={cn(
                    "mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300",
                    platform.colors.bg,
                    "group-hover:scale-110"
                  )}>
                    <span className={platform.colors.accent}>
                      {getPlatformIcon(platform.id, "h-7 w-7")}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {platform.name}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {platform.description}
                  </p>

                  <div className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium transition-all",
                    platform.colors.accent
                  )}>
                    Generate
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Feather className="h-4 w-4" />
            <span className="text-sm">
              Captspeare - Transform your words into social media magic
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}
