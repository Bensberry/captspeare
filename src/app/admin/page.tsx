"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Shield, Lock, Search, RefreshCw, Clock, ExternalLink } from "lucide-react"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would be a proper auth session.
    // Here we use a simple env-based password check on the client for demonstration.
    // SECURE NOTE: For production, use NextAuth or Supabase Auth.
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchLogs()
    } else {
      setError("Invalid password")
    }
  }

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/logs?password=${encodeURIComponent(password)}`)
      const data = await res.json()
      
      if (res.ok) {
        setLogs(data || [])
      } else {
        setError(data.error || "Failed to fetch logs")
      }
    } catch (err) {
      console.error(err)
      setError("Connection error")
    }
    setIsLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Access</h1>
            <p className="mt-2 text-sm text-muted-foreground text-balance">
              Enter your password to view user request logs.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-border/50 bg-secondary/30 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Request Logs</h1>
            <p className="mt-1 text-muted-foreground">Monitor what users are generating in real-time.</p>
          </div>
          <button 
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-medium hover:bg-secondary/50 transition-all"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        </header>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/50 bg-secondary/30">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Platform</th>
                  <th className="px-6 py-4 font-semibold">Prompt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="group hover:bg-secondary/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-muted-foreground text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {log.user_name}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {log.platform}
                        </span>
                      </td>
                      <td className="max-w-md px-6 py-4 text-muted-foreground text-xs">
                        <p className="line-clamp-2">{log.input_text}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
